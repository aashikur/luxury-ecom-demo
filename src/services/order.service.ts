import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Order, { IOrderItem } from '@/models/Order';
import Product from '@/models/Product';
import StoreConfig from '@/models/StoreConfig';
import { DeliveryZone, OrderStatus, PaymentMethod } from '@/types/domain';
import { upsertCustomerOnOrder, updateCustomerDeliveryMetrics } from './customer.service';
import { validateCoupon, incrementCouponUsage } from './coupon.service';

interface CreateOrderInputCustomer {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address: string;
  deliveryZone?: DeliveryZone;
  district?: string;
  thana?: string;
  note?: string;
}

interface CreateOrderInputItem {
  productId: string;
  variantId?: string | null;
  sku?: string;
  title?: string;
  image?: string;
  size?: string;
  variantLabel?: string;
  attributes?: { key: string; value: string }[];
  modifiers?: { groupName?: string; optionLabel?: string; label?: string; priceDelta: number }[];
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderInput {
  customer: CreateOrderInputCustomer;
  items: CreateOrderInputItem[];
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  senderPhone?: string;
  trxId?: string;
  note?: string;
  status?: OrderStatus;
  idempotencyKey?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface OrderServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'OUT_OF_STOCK' | 'INTERNAL_ERROR' | 'COUPON_INVALID';
  status?: number;
}

/**
 * Validates Bangladeshi 11-digit mobile number: 013-019XXXXXXXX
 */
export function isValidBDPhone(phone: string): boolean {
  const sanitized = phone.replace(/[\s\-\+]/g, '');
  const normalized = sanitized.startsWith('880') ? sanitized.slice(2) : sanitized;
  return /^01[3-9]\d{8}$/.test(normalized);
}

/**
 * Normalizes phone number to standard 11-digit format: 01XXXXXXXXX
 */
export function normalizeBDPhone(phone: string): string {
  const sanitized = phone.replace(/[\s\-\+]/g, '');
  return sanitized.startsWith('880') ? sanitized.slice(2) : sanitized;
}

interface DeductionRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productId: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variantId?: any;
  qty: number;
}

/**
 * Reverts atomic inventory deductions if a checkout batch fails halfway through
 */
async function rollbackDeductions(records: DeductionRecord[]) {
  for (const record of records) {
    if (record.variantId) {
      await Product.updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _id: record.productId, 'variants._id': record.variantId } as any,
        {
          $inc: {
            'variants.$.stock': record.qty,
            totalStock: record.qty,
          },
        }
      ).catch(() => {});
    } else {
      await Product.updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _id: record.productId } as any,
        { $inc: { totalStock: record.qty } }
      ).catch(() => {});
    }
  }
}

/**
 * Atomically decrements product inventory with strict zero-oversell ($gte) guard.
 */
export async function deductOrderInventoryAtomic(items: IOrderItem[]): Promise<{
  success: boolean;
  failedItemTitle?: string;
}> {
  const deductedRecords: DeductionRecord[] = [];

  for (const item of items) {
    if (!item.productId) continue;
    const qty = Number(item.quantity) || 1;

    if (item.variantId) {
      const res = await Product.updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {
          _id: item.productId,
          'variants._id': item.variantId,
          'variants.stock': { $gte: qty },
        } as any,
        {
          $inc: {
            'variants.$.stock': -qty,
            totalStock: -qty,
          },
        }
      );

      if (res.matchedCount === 0 || res.modifiedCount === 0) {
        await rollbackDeductions(deductedRecords);
        return { success: false, failedItemTitle: item.title };
      }

      deductedRecords.push({ productId: item.productId, variantId: item.variantId, qty });
    } else {
      const res = await Product.updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {
          _id: item.productId,
          totalStock: { $gte: qty },
        } as any,
        {
          $inc: { totalStock: -qty },
        }
      );

      if (res.matchedCount === 0 || res.modifiedCount === 0) {
        await rollbackDeductions(deductedRecords);
        return { success: false, failedItemTitle: item.title };
      }

      deductedRecords.push({ productId: item.productId, qty });
    }
  }

  return { success: true };
}

/**
 * Domain Service: Creates a customer order with server-authoritative pricing and atomic stock lock
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderServiceResult> {
  await connectDB();

  const {
    customer,
    items,
    couponCode,
    paymentMethod = 'COD',
    senderPhone,
    trxId,
    note,
    status,
    idempotencyKey,
    createdBy = 'CUSTOMER',
    updatedBy = 'CUSTOMER',
  } = input;

  if (!customer?.name?.trim() || !customer?.phone?.trim() || !customer?.address?.trim()) {
    return {
      success: false,
      error: 'Customer Name, Phone number, and Address are required.',
      code: 'VALIDATION_ERROR',
      status: 400,
    };
  }

  if (!isValidBDPhone(customer.phone)) {
    return {
      success: false,
      error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).',
      code: 'VALIDATION_ERROR',
      status: 400,
    };
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      error: 'Your shopping cart is empty.',
      code: 'VALIDATION_ERROR',
      status: 400,
    };
  }

  // Idempotency Deduplication Check
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey }).lean();
    if (existingOrder) {
      return { success: true, data: existingOrder, status: 200 };
    }
  }

  // Fetch 3-zone delivery fees
  const config = await StoreConfig.findOne({ isActive: true }).lean();
  const insideDhakaFee = config?.logistics?.insideDhakaFee ?? 70;
  const dhakaSuburbsFee = config?.logistics?.suburbsDhakaFee ?? 100;
  const outsideDhakaFee = config?.logistics?.outsideDhakaFee ?? 130;
  const freeShippingThreshold = config?.logistics?.freeShippingThreshold ?? 2500;

  // Server-Authoritative Pricing Resolution
  const productIds = items
    .map((i) => (i.productId ? String(i.productId) : ''))
    .filter((id) => Boolean(id) && mongoose.Types.ObjectId.isValid(id));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbProducts = (await Product.find({ _id: { $in: productIds } }).lean()) as any[];
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  const normalizedItems: IOrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const dbProduct = productMap.get(String(item.productId));
    if (!dbProduct || !dbProduct.isActive) {
      return {
        success: false,
        error: `Product "${item.title || 'Item'}" is no longer available.`,
        code: 'NOT_FOUND',
        status: 400,
      };
    }

    const quantity = Math.max(1, Number(item.quantity) || 1);
    let unitPrice = dbProduct.discountPrice ?? dbProduct.basePrice;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let variantDoc: any = null;
    if (item.variantId && Array.isArray(dbProduct.variants)) {
      variantDoc = dbProduct.variants.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any) => String(v._id) === String(item.variantId)
      );
      if (variantDoc) {
        unitPrice = variantDoc.discountPrice ?? variantDoc.price ?? unitPrice;
      }
    }

    const itemTotal = unitPrice * quantity;
    calculatedSubtotal += itemTotal;

    normalizedItems.push({
      productId: dbProduct._id,
      variantId: variantDoc?._id || item.variantId || null,
      sku: variantDoc?.sku || item.sku || '',
      title: dbProduct.title,
      image: dbProduct.media?.[0]?.url || item.image || '',
      size: item.size || '',
      variantLabel: variantDoc?.title || item.variantLabel || item.size || '',
      attributes: item.attributes || [],
      modifiers: item.modifiers || [],
      quantity,
      unitPrice,
      totalPrice: itemTotal,
    });
  }

  // 3-Zone Delivery
  const deliveryZone: DeliveryZone =
    customer.deliveryZone === 'DHAKA_SUBURBS'
      ? 'DHAKA_SUBURBS'
      : customer.deliveryZone === 'OUTSIDE_DHAKA'
      ? 'OUTSIDE_DHAKA'
      : 'INSIDE_DHAKA';

  const isFreeShipping = calculatedSubtotal >= freeShippingThreshold && calculatedSubtotal > 0;
  const deliveryFee = isFreeShipping
    ? 0
    : deliveryZone === 'INSIDE_DHAKA'
    ? insideDhakaFee
    : deliveryZone === 'DHAKA_SUBURBS'
    ? dhakaSuburbsFee
    : outsideDhakaFee;

  // Coupon Validation
  let discountAmount = 0;
  let appliedCouponCode = '';
  if (couponCode && couponCode.trim()) {
    const couponValidation = await validateCoupon(
      couponCode,
      calculatedSubtotal,
      customer.phone
    );
    if (couponValidation.isValid) {
      discountAmount = couponValidation.discountAmount;
      appliedCouponCode = couponValidation.code;
    }
  }

  const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee - discountAmount);

  // Atomic stock decrement
  const initialStatus = status || 'PENDING';
  const inventoryResult = await deductOrderInventoryAtomic(normalizedItems);
  if (!inventoryResult.success) {
    return {
      success: false,
      error: `Sorry, "${inventoryResult.failedItemTitle || 'an item'}" is currently out of stock.`,
      code: 'OUT_OF_STOCK',
      status: 409,
    };
  }

  // Increment coupon usage after successful stock deduction
  if (appliedCouponCode) {
    await incrementCouponUsage(appliedCouponCode);
  }

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `AUR-${randomSuffix}`;

  const newOrder = await Order.create({
    orderNumber,
    idempotencyKey: idempotencyKey || undefined,
    customer: {
      name: customer.name.trim(),
      phone: normalizeBDPhone(customer.phone),
      altPhone: customer.altPhone?.trim() || '',
      email: customer.email?.trim() || '',
      address: customer.address.trim(),
      deliveryZone,
      district: customer.district?.trim() || '',
      thana: customer.thana?.trim() || '',
      note: note || '',
    },
    items: normalizedItems,
    subtotal: calculatedSubtotal,
    deliveryFee,
    discountAmount,
    couponCode: appliedCouponCode || undefined,
    totalAmount,
    financials: {
      subtotal: calculatedSubtotal,
      deliveryFee,
      discount: discountAmount,
      totalAmount,
      isAdvancePaid: false,
      advanceAmount: 0,
    },
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING_VERIFICATION',
      amountDue: totalAmount,
      amountPaid: 0,
      senderPhone: senderPhone?.trim() || '',
      trxId: trxId?.trim()?.toUpperCase() || '',
    },
    orderStatus: initialStatus,
    status: initialStatus,
    inventoryState: 'DEDUCTED',
    courier: {
      provider: 'STEADFAST',
      consignmentId: `SF-${Date.now().toString().slice(-6)}`,
    },
    createdBy,
    updatedBy,
  });

  // Upsert Customer profile in background
  upsertCustomerOnOrder({
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    deliveryZone,
    district: customer.district,
    totalAmount,
  }).catch(() => {});

  try {
    revalidatePath('/', 'page');
    revalidatePath('/shop', 'page');
    revalidatePath('/admin', 'page');
    revalidatePath('/admin/orders', 'page');
  } catch (revErr) {
    console.warn('Revalidation notice:', revErr);
  }

  return {
    success: true,
    data: newOrder,
    status: 201,
  };
}

/**
 * Captures silent abandoned cart leads (INCOMPLETE state) upon checkout phone blur.
 */
export async function createOrderLead(params: {
  name?: string;
  phone: string;
  address?: string;
  deliveryZone?: DeliveryZone;
  cartItems?: CreateOrderInputItem[];
}): Promise<{ success: boolean; leadId?: string }> {
  await connectDB();
  const phone = normalizeBDPhone(params.phone);
  if (!isValidBDPhone(phone)) return { success: false };

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Look for existing recent INCOMPLETE lead for this phone
  let existingLead = await Order.findOne({
    'customer.phone': phone,
    orderStatus: 'INCOMPLETE',
    createdAt: { $gte: twoHoursAgo },
  });

  if (existingLead) {
    if (params.name) existingLead.customer.name = params.name;
    if (params.address) existingLead.customer.address = params.address;
    if (params.deliveryZone) existingLead.customer.deliveryZone = params.deliveryZone;
    await existingLead.save();
    return { success: true, leadId: existingLead.orderNumber };
  }

  const orderNumber = `LEAD-${Math.floor(10000 + Math.random() * 90000)}`;

  const lead = await Order.create({
    orderNumber,
    customer: {
      name: params.name || 'Checkout Guest',
      phone,
      address: params.address || 'Address pending',
      deliveryZone: params.deliveryZone || 'INSIDE_DHAKA',
    },
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    totalAmount: 0,
    financials: {
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      totalAmount: 0,
      isAdvancePaid: false,
      advanceAmount: 0,
    },
    payment: {
      method: 'COD',
      status: 'UNPAID',
    },
    orderStatus: 'INCOMPLETE',
    status: 'INCOMPLETE',
    inventoryState: 'NONE', // Never reserve stock for leads
    createdBy: 'LEAD_CAPTURE',
  });

  return { success: true, leadId: lead.orderNumber };
}

/**
 * IDOR-safe public guest order tracking (requires orderNumber + last 4 digits of phone).
 */
export async function trackOrder(
  orderNumber: string,
  phoneLast4: string
): Promise<{ success: boolean; order?: Record<string, unknown>; error?: string }> {
  await connectDB();

  if (!orderNumber || !phoneLast4) {
    return { success: false, error: 'Order Number and phone verification digits are required' };
  }

  const order = await Order.findOne({
    orderNumber: orderNumber.trim(),
  })
    .select('orderNumber customer.name customer.phone deliveryFee totalAmount orderStatus payment.status courier createdAt items')
    .lean();

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  const phone = order.customer?.phone || '';
  if (!phone.endsWith(phoneLast4.trim())) {
    return { success: false, error: 'Verification failed. Last 4 digits of phone do not match.' };
  }

  // Sanitize full phone number for privacy
  const sanitizedCustomer = {
    name: order.customer.name,
    phoneMasked: phone.slice(0, 3) + '****' + phone.slice(-4),
  };

  return {
    success: true,
    order: {
      orderNumber: order.orderNumber,
      customer: sanitizedCustomer,
      orderStatus: order.orderStatus,
      paymentStatus: order.payment?.status,
      totalAmount: order.totalAmount,
      courier: order.courier,
      createdAt: order.createdAt,
      itemCount: order.items?.length || 0,
    },
  };
}

/**
 * Domain Service: Fetches orders list with bounded pagination, status filtering and search
 */
export async function getOrdersList(params: {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}) {
  await connectDB();

  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
  const page = Math.max(Number(params.page) || 1, 1);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (params.status && params.status !== 'ALL') {
    query.$or = [{ orderStatus: params.status }, { status: params.status }];
  }

  if (params.q && params.q.trim()) {
    const regex = new RegExp(params.q.trim(), 'i');
    query.$or = [
      { orderNumber: regex },
      { 'customer.name': regex },
      { 'customer.phone': regex },
      { 'courier.consignmentId': regex },
      { 'courier.trackingCode': regex },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        'orderNumber customer items financials payment orderStatus status inventoryState courier createdAt totalAmount deliveryFee subtotal discountAmount'
      )
      .lean(),
    Order.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    orders,
    pagination: {
      total,
      page,
      pages,
      limit,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Domain Service: Status transition with atomic inventory replenishment on cancellation
 */
export async function updateOrderStatus(
  orderIdOrNumber: string,
  targetStatus: OrderStatus,
  updatedBy: string = 'SYSTEM'
): Promise<OrderServiceResult> {
  await connectDB();

  const query = mongoose.Types.ObjectId.isValid(orderIdOrNumber)
    ? { _id: orderIdOrNumber }
    : { orderNumber: orderIdOrNumber };

  const order = await Order.findOne(query);
  if (!order) {
    return { success: false, error: 'Order not found', code: 'NOT_FOUND', status: 404 };
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = targetStatus;
  order.status = targetStatus;
  order.updatedBy = updatedBy;

  // Rollback stock on cancellation or return
  if (
    (targetStatus === 'CANCELLED' || targetStatus === 'RETURNED') &&
    order.inventoryState === 'DEDUCTED'
  ) {
    await rollbackDeductions(
      order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        qty: item.quantity,
      }))
    );
    order.inventoryState = 'RESTORED';
  }

  // Update customer delivery metrics if reaching terminal statuses
  if (previousStatus !== targetStatus && order.customer?.phone) {
    if (targetStatus === 'DELIVERED') {
      updateCustomerDeliveryMetrics(order.customer.phone, 'DELIVERED').catch(() => {});
    } else if (targetStatus === 'RETURNED') {
      updateCustomerDeliveryMetrics(order.customer.phone, 'RETURNED').catch(() => {});
    } else if (targetStatus === 'CANCELLED') {
      updateCustomerDeliveryMetrics(order.customer.phone, 'CANCELLED').catch(() => {});
    }
  }

  await order.save();

  try {
    revalidatePath('/', 'page');
    revalidatePath('/shop', 'page');
    revalidatePath('/admin', 'page');
    revalidatePath('/admin/orders', 'page');
  } catch (revErr) {
    console.warn('Revalidation notice:', revErr);
  }

  return { success: true, data: order, status: 200 };
}
