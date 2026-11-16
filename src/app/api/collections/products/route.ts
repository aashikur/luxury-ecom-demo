import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { invalidateCollectionCaches } from '@/services/collection.service';
import { invalidateProductCaches } from '@/services/product.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/collections/products
 * Bulk attaches or detaches a collection slug across an array of product IDs.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { collectionSlug, productIds, action = 'attach' } = body;

    if (!collectionSlug || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'collectionSlug and non-empty productIds array are required.' },
        { status: 400 }
      );
    }

    if (action === 'detach') {
      const res = await Product.updateMany(
        { _id: { $in: productIds } },
        { $pull: { collections: collectionSlug } }
      );
      invalidateProductCaches();
      invalidateCollectionCaches();
      return NextResponse.json({ success: true, count: res.modifiedCount, action: 'detach' });
    }

    // Default action: attach via atomic $addToSet
    const res = await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { collections: collectionSlug } }
    );
    invalidateProductCaches();
    invalidateCollectionCaches();
    return NextResponse.json({ success: true, count: res.modifiedCount, action: 'attach' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update collection products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
