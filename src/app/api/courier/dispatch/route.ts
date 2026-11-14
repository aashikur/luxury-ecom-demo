import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { dispatchOrderToSteadfast } from '@/services/courier.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/courier/dispatch
 * Thin Controller: 1-click order booking to Steadfast Courier
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderNumber, operator = 'ADMIN' } = body;

    const id = orderId || orderNumber;
    if (!id) {
      return apiError('orderId or orderNumber is required', 'VALIDATION_ERROR', 400);
    }

    const result = await dispatchOrderToSteadfast(id, operator);

    if (!result.success) {
      return apiError(
        result.error || 'Courier dispatch failed',
        'INTERNAL_ERROR',
        500
      );
    }

    return apiSuccess(result, {
      message: `Order successfully booked with ${result.provider}. Tracking: ${result.trackingCode}`,
    });
  } catch (error: unknown) {
    console.error('Courier Controller Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
