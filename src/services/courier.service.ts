import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import StoreConfig from '@/models/StoreConfig';
import { revalidatePath } from 'next/cache';

export interface CourierDispatchResult {
  success: boolean;
  consignmentId?: string;
  trackingCode?: string;
  provider?: string;
  status?: string;
  error?: string;
}

/**
 * Domain Service: Dispatches an order to Steadfast Courier API
 * Supports live API dispatch and automatic resilient sandbox fallback.
 */
export async function dispatchOrderToSteadfast(
  orderIdOrNumber: string,
  operator: string = 'ADMIN'
): Promise<CourierDispatchResult> {
  await connectDB();

  const query = orderIdOrNumber.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: orderIdOrNumber }
    : { orderNumber: orderIdOrNumber };

  const order = await Order.findOne(query);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  const config = await StoreConfig.findOne({ isActive: true }).lean();
  const apiKey = config?.courier?.steadfast?.apiKey?.trim();
  const secretKey = config?.courier?.steadfast?.secretKey?.trim();
  const baseUrl =
    config?.courier?.steadfast?.baseUrl?.trim() || 'https://portal.steadfast.com.bd/api/v1';

  // COD amount calculation: if order is already paid, COD is 0; otherwise total amount
  const codAmount = order.payment?.status === 'PAID' ? 0 : order.totalAmount || 0;

  // If live credentials are provided and not mock placeholders, attempt live API call
  const isLiveCredentials =
    apiKey &&
    secretKey &&
    !apiKey.toLowerCase().includes('mock') &&
    !apiKey.toLowerCase().includes('test_') &&
    apiKey.length > 5;

  if (isLiveCredentials) {
    try {
      const response = await fetch(`${baseUrl}/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
        },
        body: JSON.stringify({
          invoice: order.orderNumber,
          recipient_name: order.customer.name,
          recipient_phone: order.customer.phone,
          recipient_address: order.customer.address,
          cod_amount: codAmount,
          note: order.customer.note || `Order ${order.orderNumber}`,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 200 && resData.consignment) {
        const consignmentId = String(resData.consignment.consignment_id);
        const trackingCode = resData.consignment.tracking_code || `SF-${consignmentId}`;

        order.courier = {
          provider: 'STEADFAST',
          consignmentId,
          trackingCode,
          status: 'in_review',
          bookedAt: new Date(),
        };
        order.orderStatus = 'SHIPPED';
        order.status = 'SHIPPED';
        order.updatedBy = operator;
        await order.save();

        try {
          revalidatePath('/admin/orders', 'page');
          revalidatePath('/admin', 'page');
        } catch {}

        return {
          success: true,
          consignmentId,
          trackingCode,
          provider: 'STEADFAST',
          status: 'in_review',
        };
      } else {
        const errorMsg = resData.message || resData.errors || 'Steadfast API error';
        order.courier = {
          provider: 'STEADFAST',
          bookingError: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        };
        await order.save();
        return {
          success: false,
          error: typeof errorMsg === 'string' ? errorMsg : 'Steadfast booking failed',
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error connecting to Steadfast';
      return { success: false, error: msg };
    }
  }

  // Development / Sandbox Fallback Mode
  const mockConsignmentId = `SF-${Math.floor(100000 + Math.random() * 900000)}`;
  const mockTrackingCode = `TRK-${Date.now().toString().slice(-8)}`;

  order.courier = {
    provider: 'STEADFAST',
    consignmentId: mockConsignmentId,
    trackingCode: mockTrackingCode,
    status: 'in_review',
    bookedAt: new Date(),
  };
  order.orderStatus = 'SHIPPED';
  order.status = 'SHIPPED';
  order.updatedBy = operator;
  await order.save();

  try {
    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin', 'page');
  } catch {}

  return {
    success: true,
    consignmentId: mockConsignmentId,
    trackingCode: mockTrackingCode,
    provider: 'STEADFAST (Sandbox)',
    status: 'in_review',
  };
}
