import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import mongoose from 'mongoose';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * GET /api/collections
 * ?featured=true -> returns only featured collections for homepage
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';

    const filter: Record<string, any> = {};
    if (featured) {
      filter.isFeaturedHome = true;
      filter.isActive = true;
    }

    const collections = await Collection.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: collections.length, data: collections });
  } catch (err: any) {
    console.error('Error fetching collections:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/collections
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ success: false, error: 'Collection title is required' }, { status: 400 });
    }

    let baseSlug = body.slug ? slugify(body.slug) : slugify(body.title);
    if (!baseSlug) baseSlug = 'collection';

    let finalSlug = baseSlug;
    let counter = 1;
    while (await Collection.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const newCollection = await Collection.create({
      title: body.title.trim(),
      slug: finalSlug,
      description: body.description || '',
      bannerImage: body.bannerImage || { url: '', key: '' },
      badgeText: body.badgeText || '',
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 0,
      isFeaturedHome: Boolean(body.isFeaturedHome),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });

    return NextResponse.json({ success: true, data: newCollection }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating collection:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/collections
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid collection ID is required' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    if (updates.title) collection.title = updates.title.trim();
    if (updates.description !== undefined) collection.description = updates.description;
    if (updates.bannerImage !== undefined) collection.bannerImage = updates.bannerImage;
    if (updates.badgeText !== undefined) collection.badgeText = updates.badgeText;
    if (typeof updates.displayOrder === 'number') collection.displayOrder = updates.displayOrder;
    if (updates.isFeaturedHome !== undefined) collection.isFeaturedHome = Boolean(updates.isFeaturedHome);
    if (updates.isActive !== undefined) collection.isActive = Boolean(updates.isActive);
    if (updates.startDate !== undefined) collection.startDate = updates.startDate ? new Date(updates.startDate) : undefined;
    if (updates.endDate !== undefined) collection.endDate = updates.endDate ? new Date(updates.endDate) : undefined;

    await collection.save();

    return NextResponse.json({ success: true, data: collection });
  } catch (err: any) {
    console.error('Error updating collection:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/collections?id=<id>
 * Removes collection and unlinks from any products.
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid collection ID is required' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    // Cleanly pull this collection slug from any tagged products
    await Product.updateMany(
      { collections: collection.slug },
      { $pull: { collections: collection.slug } }
    );

    await Collection.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Collection "${collection.title}" deleted and unlinked from products`,
    });
  } catch (err: any) {
    console.error('Error deleting collection:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
