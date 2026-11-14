import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import {
  parseSmsNotification,
  matchAndVerifySmsPayment,
} from '@/services/payment.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/sms-payment: Android SMS-forwarder webhook endpoint
 * Expected payload: { sender: string, message: string, timestamp?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sender || !body.message) {
      return apiError(
        'sender and message fields are required',
        'VALIDATION_ERROR',
        400
      );
    }

    const parsed = parseSmsNotification(body.sender, body.message);
    if (!parsed) {
      return apiSuccess(
        { matched: false },
        { message: 'SMS did not match recognized MFS payment pattern' }
      );
    }

    const result = await matchAndVerifySmsPayment(parsed);

    return apiSuccess(result, {
      message: result.matched
        ? `Payment verified for Order: ${result.orderNumber}`
        : 'Payment recorded but no matching pending order found',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'SMS Webhook processing failed';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
