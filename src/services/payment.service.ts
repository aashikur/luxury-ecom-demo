import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import StoreConfig from '@/models/StoreConfig';
import { PaymentMethod, PaymentStatus } from '@/types/domain';

export interface InitiatePaymentResult {
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  redirectUrl?: string | null;
  instructions?: string;
  walletNumber?: string;
}

export interface SmsParsedData {
  provider: 'BKASH' | 'NAGAD' | 'ROCKET' | 'UNKNOWN';
  trxId: string;
  amount: number;
  senderPhone?: string;
}

/**
 * Initiates payment session according to requested payment method.
 */
export async function initiatePayment(
  orderId: string,
  method: PaymentMethod,
  reqOrigin: string = 'http://localhost:3000'
): Promise<InitiatePaymentResult> {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found for payment initialization');

  // 1. Cash on Delivery (COD)
  if (method === 'COD') {
    order.payment = {
      method: 'COD',
      status: 'UNPAID',
      amountDue: order.totalAmount,
      amountPaid: 0,
    };
    await order.save();
    return {
      paymentMethod: 'COD',
      status: 'UNPAID',
      redirectUrl: null,
      instructions: 'Please pay cash to the Steadfast courier agent upon delivery.',
    };
  }

  // 2. Manual MFS Wallets (bKash / Nagad / Rocket)
  if (method === 'MANUAL_BKASH' || method === 'MANUAL_NAGAD' || method === 'MANUAL_ROCKET') {
    const config = await StoreConfig.findOne({ isActive: true }).lean();
    const walletNumber =
      config?.payment?.manualBkash?.walletNumber || '01700000000';

    order.payment = {
      ...order.payment,
      method,
      status: 'PENDING_VERIFICATION',
      amountDue: order.totalAmount,
    };
    await order.save();

    return {
      paymentMethod: method,
      status: 'PENDING_VERIFICATION',
      redirectUrl: null,
      walletNumber,
      instructions: `Send ৳${order.totalAmount} via Send Money or Payment to ${walletNumber} and provide the TrxID.`,
    };
  }

  // 3. SSLCommerz Payment Gateway
  if (method === 'SSLCOMMERZ') {
    const config = await StoreConfig.findOne({ isActive: true }).lean();
    const isSandbox = config?.payment?.sslCommerz?.isSandbox ?? true;

    // In local sandbox or when credentials unconfigured, return simulation link
    const redirectUrl = isSandbox
      ? `${reqOrigin}/checkout/ssl-sim?order=${order.orderNumber}&amount=${order.totalAmount}`
      : `${reqOrigin}/api/webhooks/sslcommerz/init?order=${order.orderNumber}`;

    order.payment = {
      ...order.payment,
      method: 'SSLCOMMERZ',
      status: 'PENDING_VERIFICATION',
      amountDue: order.totalAmount,
    };
    await order.save();

    return {
      paymentMethod: 'SSLCOMMERZ',
      status: 'PENDING_VERIFICATION',
      redirectUrl,
    };
  }

  return {
    paymentMethod: method,
    status: 'UNPAID',
    redirectUrl: null,
  };
}

/**
 * Validates SSLCommerz Server-to-Server IPN notification callback.
 */
export async function verifyPaymentIPN(
  payload: Record<string, string>
): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  await connectDB();

  const tranId = payload.tran_id;
  const status = payload.status;
  const valId = payload.val_id;
  const amount = Number(payload.amount);
  const currency = payload.currency;

  if (!tranId) return { success: false, error: 'Missing tran_id in IPN payload' };

  const order = await Order.findOne({
    $or: [{ orderNumber: tranId }, { _id: tranId.match(/^[0-9a-fA-F]{24}$/) ? tranId : null }],
  });

  if (!order) return { success: false, error: `Order not found for tran_id: ${tranId}` };

  if (status !== 'VALID' && status !== 'VALIDATED') {
    order.payment.status = 'FAILED';
    await order.save();
    return { success: false, error: `Payment not valid. Gateway reported: ${status}` };
  }

  // Currency & Amount check
  if (currency && currency.toUpperCase() !== 'BDT') {
    return { success: false, error: `Currency mismatch. Expected BDT, got ${currency}` };
  }
  if (amount && Math.abs(amount - order.totalAmount) > 1) {
    return { success: false, error: `Amount mismatch. Expected ৳${order.totalAmount}, got ৳${amount}` };
  }

  // Mark order as paid
  order.payment.status = 'PAID';
  order.payment.trxId = payload.bank_tran_id || valId || 'IPN-VERIFIED';
  order.payment.gatewayRef = valId;
  order.payment.verifiedBy = 'IPN';
  order.payment.verifiedAt = new Date();
  order.payment.amountPaid = order.totalAmount;
  order.payment.amountDue = 0;

  if (order.orderStatus === 'PENDING') {
    order.orderStatus = 'CONFIRMED';
  }

  await order.save();

  try {
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${order._id}`);
  } catch {}

  return { success: true, orderNumber: order.orderNumber };
}

/**
 * Admin manual 1-click verification of bKash/Nagad/Rocket transaction.
 */
export async function verifyManualPayment(
  orderId: string,
  trxId: string,
  senderPhone?: string,
  _actor: string = 'ADMIN'
): Promise<boolean> {
  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) return false;

  order.payment.status = 'PAID';
  order.payment.trxId = trxId.trim();
  if (senderPhone) order.payment.senderPhone = senderPhone.trim();
  order.payment.verifiedBy = 'ADMIN';
  order.payment.verifiedAt = new Date();
  order.payment.amountPaid = order.totalAmount;
  order.payment.amountDue = 0;

  if (order.orderStatus === 'PENDING') {
    order.orderStatus = 'CONFIRMED';
  }

  await order.save();

  try {
    revalidatePath('/admin/orders');
  } catch {}

  return true;
}

/**
 * Regex parser for incoming mobile SMS forwarder notifications.
 */
export function parseSmsNotification(sender: string, message: string): SmsParsedData | null {
  const cleanMsg = message.replace(/\n/g, ' ');

  // 1. bKash: "You have received Tk 1,450.00 from 017XXXXX. Ref ... TrxID 8A4D..."
  if (/bkash/i.test(sender) || /received.*tk.*trxid/i.test(cleanMsg)) {
    const trxMatch = cleanMsg.match(/TrxID\s+([A-Z0-9]+)/i);
    const amtMatch = cleanMsg.match(/Tk\s+([0-9,.]+)/i);
    const phoneMatch = cleanMsg.match(/from\s+(01[3-9]\d{8})/i);

    if (trxMatch) {
      const amount = amtMatch ? Number(amtMatch[1].replace(/,/g, '')) : 0;
      return {
        provider: 'BKASH',
        trxId: trxMatch[1].toUpperCase(),
        amount,
        senderPhone: phoneMatch ? phoneMatch[1] : undefined,
      };
    }
  }

  // 2. Nagad: "Money Received. Amount: Tk 1,450.00. Sender: 017XXXXX. TxnID: 7M3..."
  if (/nagad/i.test(sender) || /money received.*txnid/i.test(cleanMsg)) {
    const txnMatch = cleanMsg.match(/TxnID:\s*([A-Z0-9]+)/i);
    const amtMatch = cleanMsg.match(/Amount:\s*Tk\s*([0-9,.]+)/i);
    const phoneMatch = cleanMsg.match(/Sender:\s*(01[3-9]\d{8})/i);

    if (txnMatch) {
      const amount = amtMatch ? Number(amtMatch[1].replace(/,/g, '')) : 0;
      return {
        provider: 'NAGAD',
        trxId: txnMatch[1].toUpperCase(),
        amount,
        senderPhone: phoneMatch ? phoneMatch[1] : undefined,
      };
    }
  }

  return null;
}

/**
 * Auto-matches incoming SMS transaction to pending orders and confirms payment.
 */
export async function matchAndVerifySmsPayment(
  smsData: SmsParsedData
): Promise<{ matched: boolean; orderNumber?: string }> {
  await connectDB();

  // Search by exact TrxID if already entered by customer
  let order = await Order.findOne({
    'payment.trxId': smsData.trxId,
    'payment.status': { $ne: 'PAID' },
  });

  // Fallback: match by senderPhone and approximate totalAmount within last 4 hours
  if (!order && smsData.senderPhone && smsData.amount > 0) {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    order = await Order.findOne({
      $or: [
        { 'customer.phone': smsData.senderPhone },
        { 'payment.senderPhone': smsData.senderPhone },
      ],
      totalAmount: smsData.amount,
      'payment.status': { $ne: 'PAID' },
      createdAt: { $gte: fourHoursAgo },
    });
  }

  if (!order) return { matched: false };

  order.payment.status = 'PAID';
  order.payment.trxId = smsData.trxId;
  order.payment.verifiedBy = 'SMS_WEBHOOK';
  order.payment.verifiedAt = new Date();
  order.payment.amountPaid = order.totalAmount;
  order.payment.amountDue = 0;

  if (order.orderStatus === 'PENDING') {
    order.orderStatus = 'CONFIRMED';
  }

  await order.save();

  try {
    revalidatePath('/admin/orders');
  } catch {}

  return { matched: true, orderNumber: order.orderNumber };
}
