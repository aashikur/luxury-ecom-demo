import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { deleteFromR2 } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * ============================================================================
 * LESSON: Dynamic Slug Route Handler in Next.js App Router
 * ============================================================================
 * 
 * In App Router, folder `[slug]` provides `context.params`:
 * Example: GET /api/products/vintage-heavyweight-acid-wash-hoodie
 * -> params.slug = 'vintage-heavyweight-acid-wash-hoodie'
 */

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET: Fetch single product details by slug (Storefront Product Detail Page)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;

    // Search by ObjectId if valid 24-char hex, otherwise by slug
    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: slug }, { slug }] }
      : { slug };

    const product = await Product.findOne(query).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: unknown) {
    console.error('Product Detail GET Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT: Update an existing product (Admin)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;
    const body = await request.json();

    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: slug }, { slug }] }
      : { slug };

    const product = await Product.findOne(query);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found to update' },
        { status: 404 }
      );
    }

    body.updatedBy = body.updatedBy || 'ADMIN';
    Object.assign(product, body);
    const updated = await product.save();

    // Revalidate all caches across storefront and admin
    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/admin/products', 'page');
      if (updated.slug) {
        revalidatePath(`/products/${updated.slug}`, 'page');
      }
      revalidatePath(`/admin/products/${updated._id}`, 'page');
      revalidatePath(`/admin/products/${updated._id}/edit`, 'page');
    } catch (revErr) {
      console.warn('Revalidation notice:', revErr);
    }

    return NextResponse.json(
      { success: true, message: 'Product updated successfully', data: updated },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Product PUT Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE: Soft delete or remove product by slug (Admin)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;

    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: slug }, { slug }] }
      : { slug };

    const deleted = await Product.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found to delete' },
        { status: 404 }
      );
    }

    // Cascade delete associated assets from Cloudflare R2 (skip seed assets)
    const mediaList = deleted.media || [];
    if (mediaList.length > 0) {
      const keysToDelete = mediaList
        .map((m: { key?: string }) => m.key)
        .filter((key: any): key is string => Boolean(key && !key.startsWith('seed/')));

      if (keysToDelete.length > 0) {
        await Promise.allSettled(keysToDelete.map((key: string) => deleteFromR2(key)));
      }
    }

    // Revalidate all caches across storefront and admin
    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/admin/products', 'page');
      if (deleted.slug) {
        revalidatePath(`/products/${deleted.slug}`, 'page');
      }
      revalidatePath(`/admin/products/${deleted._id}`, 'page');
    } catch (revErr) {
      console.warn('Revalidation notice:', revErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product and associated storage assets deleted successfully',
        deletedMediaKeys: mediaList.map((m: any) => m.key).filter(Boolean),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Product DELETE Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
