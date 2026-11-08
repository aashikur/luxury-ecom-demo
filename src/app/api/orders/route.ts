import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import StoreConfig from '@/models/StoreConfig';

/**
 * ============================================================================
 * LESSON: Bangladesh 1-Page COD Order Endpoint (with Auto-Lead Capture)
 * ============================================================================
 * 
 * 1. ZERO-REGISTRATION:
 *    Guest orders directly with Name, 11-Digit BD Phone, and Address.
 * 
 * 2. UNIQUE READABLE INVOICE NUMBER:
 *    Generates readable order numbers: e.g. "ORD-10482"
 * 
 * 3. DYNAMIC DELIVERY FEE:
 *    Fetches active delivery fee from StoreConfig in DB (no hardcoded fees).
 */

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { customer, items, paymentMethod, senderPhone, trxId, note } = body;

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

    // 3. Compute Financials server-side (prevent client price tampering)
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0
    );

    const isFreeShipping = subtotal >= freeShippingThreshold;
    const deliveryFee = isFreeShipping
      ? 0
      : customer.deliveryZone === 'INSIDE_DHAKA'
      ? insideDhakaFee
      : outsideDhakaFee;

    const totalAmount = subtotal + deliveryFee;

    // 4. Generate Unique Order Number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomSuffix}`;

    // 5. Create Order Document in MongoDB
    const newOrder = await Order.create({
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        deliveryZone: customer.deliveryZone || 'INSIDE_DHAKA',
        note: note || '',
      },
      items,
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
      status: 'PENDING',
      courier: {
        provider: config?.courier?.provider || 'STEADFAST',
        consignmentId: `SF-${Date.now().toString().slice(-6)}`,
      },
    });

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
