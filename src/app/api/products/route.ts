import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getProductsList, createProduct } from '@/services/product.service';
import { ProductStatus } from '@/types/domain';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products: Catalog Query Engine with Bounded Pagination & ESR Indexes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const collection = searchParams.get('collection') || undefined;
    const category = searchParams.get('category') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const status = (searchParams.get('status') as ProductStatus) || undefined;
    const q = searchParams.get('q') || undefined;
    const all = searchParams.get('all') === 'true';

    const minPrice = searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined;

    const inStock = searchParams.has('inStock')
      ? searchParams.get('inStock') === 'true'
      : undefined;

    const isPinned = searchParams.has('isPinned')
      ? searchParams.get('isPinned') === 'true'
      : undefined;

    const { products, pagination } = await getProductsList({
      page,
      limit,
      collection,
      category,
      categorySlug,
      brand,
      status,
      isPinned,
      q,
      minPrice,
      maxPrice,
      inStock,
      all,
    });

    return apiSuccess(products, { pagination });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/products: Create a new product (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.basePrice || !body.categoryName) {
      return apiError(
        'Title, basePrice, and categoryName are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    const product = await createProduct(body, body.createdBy || 'ADMIN');

    return apiSuccess(product, {
      message: 'Product created successfully',
      status: 201,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
