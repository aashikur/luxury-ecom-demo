import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order, { IOrderItem } from '@/models/Order';
import Product from '@/models/Product';
import StoreConfig from '@/models/StoreConfig';

/**
 * ============================================================================
 * LESSON: Bangladesh 1-Page COD Order Endpoint (with Multi-Niche Support)
 * ============================================================================
 * 
 * 1. ZERO-REGISTRATION:
 *    Guest orders directly with Name, 11-Digit BD Phone, and Address.
 * 
 * 2. MULTI-NICHE ORDER SNAPSHOTS:
 *    Captures optional size, variantLabel, attributes, sku, and modifier add-ons.
 * 
 * 3. ATOMIC INVENTORY DEDUCTION ON ORDER CONFIRMATION:
 *    - Regular product (hasVariants === false): decrements root `totalStock`.
 *    - Variant product (hasVariants === true): atomically decrements both `variants.$.stock`
 *      and root `totalStock`.
 */

export async function deductOrderInventory(items: IOrderItem[]) {
  for (const item of items) {
    if (!item.productId) continue;
    const qty = Number(item.quantity) || 1;

    if (item.variantId) {
      // Atomic deduction for variant + root totalStock
      await Product.updateOne(
        { _id: item.productId, 'variants._id': item.variantId },
        {
          $inc: {
            'variants.$.stock': -qty,
            totalStock: -qty,
          },
        }
      );
    } else if (item.sku) {
      // Try matching by variant sku
      const res = await Product.updateOne(
        { _id: item.productId, 'variants.sku': item.sku },
        {
          $inc: {
            'variants.$.stock': -qty,
            totalStock: -qty,
          },
        }
      );

      // If no variant matched the sku, decrement root totalStock
      if (res.matchedCount === 0) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { totalStock: -qty } }
        );
      }
    } else {
      // Regular single SKU product without variants
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { totalStock: -qty } }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { customer, items, paymentMethod, senderPhone, trxId, note, status } = body;

    // 1. Validations
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { success: false, error: 'Customer Name, Phone, and Address are required.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your shopping cart is empty.' },
        { status: 400 }
      );
    }

    // 2. Fetch active StoreConfig for delivery charges
    const config = await StoreConfig.findOne({ isActive: true });
    const insideDhakaFee = config?.logistics?.insideDhakaFee ?? 70;
    const outsideDhakaFee = config?.logistics?.outsideDhakaFee ?? 130;
    const freeShippingThreshold = config?.logistics?.freeShippingThreshold ?? 2500;

    // 3. Normalize items snapshot (Backward-compatible with Clothing, Gadgets, Regular items)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedItems: IOrderItem[] = items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId || null,
      sku: item.sku || '',
      title: item.title,
      image: item.image,
      size: item.size || '',
      variantLabel: item.variantLabel || item.size || '',
      attributes: item.attributes || [],
      modifiers: item.modifiers || [],
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }));

    // 4. Compute Financials server-side
    const subtotal = normalizedItems.reduce(
      (sum: number, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const isFreeShipping = subtotal >= freeShippingThreshold;
    const deliveryFee = isFreeShipping
      ? 0
      : customer.deliveryZone === 'INSIDE_DHAKA'
      ? insideDhakaFee
      : outsideDhakaFee;

    const totalAmount = subtotal + deliveryFee;

    // 5. Generate Unique Order Number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomSuffix}`;

    const orderStatus = status || 'PENDING';

    // 6. Create Order Document in MongoDB
    const newOrder = await Order.create({
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address,
        deliveryZone: customer.deliveryZone || 'INSIDE_DHAKA',
        note: note || '',
      },
      items: normalizedItems,
      financials: {
        subtotal,
        deliveryFee,
        discount: 0,
        totalAmount,
        isAdvancePaid: false,
        advanceAmount: 0,
      },
      payment: {
        method: paymentMethod || 'COD',
        senderPhone: senderPhone || '',
        trxId: trxId || '',
        status: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING_VERIFICATION',
      },
      status: orderStatus,
      courier: {
        provider: config?.courier?.provider || 'STEADFAST',
        consignmentId: `SF-${Date.now().toString().slice(-6)}`,
      },
      createdBy: body.createdBy || 'CUSTOMER',
      updatedBy: body.updatedBy || 'CUSTOMER',
    });

    // If order was created in CONFIRMED state directly, deduct inventory
    if (orderStatus === 'CONFIRMED') {
      await deductOrderInventory(normalizedItems);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully!',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Order Placement Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to place order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH: Update order status (e.g. to 'CONFIRMED', 'CANCELLED', etc.)
 * Deducts inventory atomically when transitioning to 'CONFIRMED'.
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { orderId, orderNumber, status, updatedBy } = body;

    const query = orderId ? { _id: orderId } : { orderNumber };
    const order = await Order.findOne(query);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const previousStatus = order.status;

    if (status) {
      order.status = status;
    }
    if (updatedBy) {
      order.updatedBy = updatedBy;
    }

    await order.save();

    // Deduct stock if status changed from unconfirmed to CONFIRMED
    if (previousStatus !== 'CONFIRMED' && status === 'CONFIRMED') {
      await deductOrderInventory(order.items);
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${order.status}`,
      data: order,
    });
  } catch (error: unknown) {
    console.error('Order PATCH Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * GET: Retrieve list of orders (Merchant Dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Orders GET Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
