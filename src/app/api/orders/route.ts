import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import {
  createOrder,
  createManualAdminOrder,
  deleteOrder,
  getOrdersList,
  updateOrderStatus,
  updateOrderDetails,
} from '@/services/order.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders
 * Thin Controller: Delegates guest checkout creation or manual admin order to order.service.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support manual order creation from Admin Dashboard
    if (body.isManualOrder) {
      const result = await createManualAdminOrder({
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || body.phone,
        customerAddress: body.customerAddress || body.address,
        productName: body.productName,
        amount: body.amount,
        status: body.status,
        createdBy: body.createdBy || 'ADMIN',
      });

      if (!result.success) {
        return apiError(
          result.error || 'Failed to create manual order',
          result.code || 'VALIDATION_ERROR',
          result.status || 400
        );
      }

      return apiSuccess(result.data, {
        message: 'Order created successfully!',
        status: 201,
      });
    }

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

    const { orders, pagination } = await getOrdersList({
      status: status || undefined,
      page,
      limit,
    });

    return apiSuccess(orders, { pagination });
  } catch (error: unknown) {
    console.error('Order Controller GET Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * PATCH /api/orders
 * Thin Controller: Order status transitions and detail updates with atomic stock safeguards
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

    // If order details (customer, product, amount) are provided, update them
    if (
      body.customerName !== undefined ||
      body.customerPhone !== undefined ||
      body.phone !== undefined ||
      body.customerAddress !== undefined ||
      body.address !== undefined ||
      body.customerEmail !== undefined ||
      body.email !== undefined ||
      body.productName !== undefined ||
      body.amount !== undefined
    ) {
      const result = await updateOrderDetails({
        orderIdOrNumber: id,
        customerName: body.customerName,
        customerEmail: body.customerEmail || body.email,
        customerPhone: body.customerPhone || body.phone,
        customerAddress: body.customerAddress || body.address,
        productName: body.productName,
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        status: targetStatus,
        updatedBy: updatedBy || 'ADMIN',
      });

      if (!result.success) {
        return apiError(
          result.error || 'Failed to update order details',
          result.code || 'INTERNAL_ERROR',
          result.status || 500
        );
      }

      return apiSuccess(result.data, {
        message: 'Order updated successfully!',
      });
    }

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

/**
 * DELETE /api/orders: Admin deletion with atomic inventory restoration
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id') || searchParams.get('orderId');

    if (!orderId) {
      return apiError('Order ID or order number is required', 'VALIDATION_ERROR', 400);
    }

    const result = await deleteOrder(orderId);

    if (!result.success) {
      return apiError(
        result.error || 'Failed to delete order',
        result.code || 'INTERNAL_ERROR',
        result.status || 500
      );
    }

    return apiSuccess(result.data, {
      message: 'Order deleted and inventory restored successfully.',
    });
  } catch (error: unknown) {
    console.error('Order Controller DELETE Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
