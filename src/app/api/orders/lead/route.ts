import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createOrderLead } from '@/services/order.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders/lead: Silent abandoned cart lead capture on phone blur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.phone) {
      return apiError('Phone number is required for lead capture', 'VALIDATION_ERROR', 400);
    }

    const result = await createOrderLead({
      name: body.name,
      phone: body.phone,
      address: body.address,
      deliveryZone: body.deliveryZone,
      cartItems: body.cartItems,
    });

    if (!result.success) {
      return apiError('Invalid phone number format', 'VALIDATION_ERROR', 400);
    }

    return apiSuccess({ leadId: result.leadId }, { message: 'Lead captured successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to capture lead';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
