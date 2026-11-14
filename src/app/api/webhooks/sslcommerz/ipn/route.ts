import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentIPN } from '@/services/payment.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/sslcommerz/ipn: SSLCommerz Server-to-Server IPN Callback
 */
export async function POST(request: NextRequest) {
  try {
    let payload: Record<string, string> = {};

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = String(value);
      });
    } else {
      payload = await request.json().catch(() => ({}));
    }

    const result = await verifyPaymentIPN(payload);

    if (!result.success) {
      console.warn('SSLCommerz IPN verification failure:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'IPN processed successfully', orderNumber: result.orderNumber },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('SSLCommerz IPN Handler Error:', error);
    const message = error instanceof Error ? error.message : 'IPN processing exception';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
