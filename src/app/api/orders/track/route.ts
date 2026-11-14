import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { trackOrder } from '@/services/order.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/track?orderNumber=AUR-XXXXX&phoneLast4=1234
 * IDOR-safe public guest order tracking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const phoneLast4 = searchParams.get('phoneLast4');

    if (!orderNumber || !phoneLast4) {
      return apiError(
        'orderNumber and phoneLast4 query parameters are required',
        'VALIDATION_ERROR',
        400
      );
    }

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
