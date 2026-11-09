import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

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

    const updated = await Product.findOneAndUpdate(
      query,
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Product not found to update' },
        { status: 404 }
      );
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

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
        deletedImageKeys: deleted.images.map((img) => img.key),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Product DELETE Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
