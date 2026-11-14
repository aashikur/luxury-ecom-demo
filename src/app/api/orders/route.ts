import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import {
  createOrder,
  getOrdersList,
  updateOrderStatus,
} from '@/services/order.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders
 * Thin Controller: Delegates guest checkout creation to order.service.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOrder(body);

    if (!result.success) {
      return apiError(
        result.error || 'Failed to place order',
        result.code || 'VALIDATION_ERROR',
        result.status || 400
      );
    }

    return apiSuccess(result.data, {
      message: 'Order placed successfully!',
      status: result.status || 201,
    });
  } catch (error: unknown) {
    console.error('Order Controller POST Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * GET /api/orders
 * Thin Controller: Bounded paginated order retrieval
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('orderStatus') || searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { orders, pagination } = await getOrdersList({ status, page, limit });

    return apiSuccess(orders, { pagination });
  } catch (error: unknown) {
    console.error('Order Controller GET Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * PATCH /api/orders
 * Thin Controller: Order status transitions with atomic stock safeguards
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderNumber, status, orderStatus, updatedBy } = body;

    const id = orderId || orderNumber;
    if (!id) {
      return apiError('orderId or orderNumber is required', 'VALIDATION_ERROR', 400);
    }

    const targetStatus = orderStatus || status;
    if (!targetStatus) {
      return apiError('target status is required', 'VALIDATION_ERROR', 400);
    }

    const result = await updateOrderStatus(id, targetStatus, updatedBy);

    if (!result.success) {
      return apiError(
        result.error || 'Failed to update order',
        result.code || 'INTERNAL_ERROR',
        result.status || 500
      );
    }

    return apiSuccess(result.data, {
      message: `Order status updated to ${targetStatus}`,
    });
  } catch (error: unknown) {
    console.error('Order Controller PATCH Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
