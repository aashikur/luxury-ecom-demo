import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { validateCoupon } from '@/services/coupon.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/coupons/validate: Checkout coupon verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal, customerPhone } = body;

    if (!code || typeof subtotal !== 'number') {
      return apiError('Coupon code and numeric subtotal are required', 'VALIDATION_ERROR', 400);
    }

    const result = await validateCoupon(code, subtotal, customerPhone);

    if (!result.isValid) {
      return apiError(result.reason || 'Invalid coupon', 'COUPON_INVALID', 400);
    }

    return apiSuccess({
      code: result.code,
      discountAmount: result.discountAmount,
      discountType: result.coupon?.discountType,
      discountValue: result.coupon?.discountValue,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to validate coupon';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
