import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import {
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
} from '@/services/product.service';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET: Fetch single product details by slug or _id
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const product = isObjectId
      ? await getProductById(slug)
      : await getProductBySlug(slug);

    if (!product) {
      return apiError('Product not found', 'NOT_FOUND', 404);
    }

    return apiSuccess(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * PUT: Update an existing product
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const updated = await updateProduct(slug, body, body.updatedBy || 'ADMIN');

    if (!updated) {
      return apiError('Product not found to update', 'NOT_FOUND', 404);
    }

    return apiSuccess(updated, { message: 'Product updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * DELETE: Remove product by slug or id and cascade R2 storage purge
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const result = await deleteProduct(slug, 'ADMIN');

    if (!result.success) {
      return apiError('Product not found to delete', 'NOT_FOUND', 404);
    }

    return apiSuccess(result, {
      message: 'Product and associated storage assets deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
