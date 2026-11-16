import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { trackOrder } from '@/services/order.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/track?orderNumber=AUR-XXXXX&phone=017XXXXXXXX (or phoneLast4=1234)
 * IDOR-safe public guest order tracking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const rawPhone = searchParams.get('phone')?.trim() || searchParams.get('phoneLast4')?.trim();

    if (!orderNumber || !rawPhone) {
      return apiError(
        'orderNumber and phone (or last 4 digits) query parameters are required',
        'VALIDATION_ERROR',
        400
      );
    }

    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (digitsOnly.length < 4) {
      return apiError(
        'Please provide a valid phone number or the last 4 digits for verification',
        'VALIDATION_ERROR',
        400
      );
    }

    const phoneLast4 = digitsOnly.slice(-4);
    const result = await trackOrder(orderNumber, phoneLast4);

    if (!result.success) {
      return apiError(result.error || 'Order not found', 'NOT_FOUND', 404);
    }

    return apiSuccess(result.order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to track order';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
