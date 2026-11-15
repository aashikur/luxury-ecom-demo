import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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
 * GET /api/brands
 * ?featured=true -> returns only featured brands
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';

    const filter: Record<string, any> = {};
    if (featured) {
      filter.featured = true;
      filter.isActive = true;
    }

    const brands = await Brand.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, count: brands.length, data: brands });
  } catch (err: any) {
    console.error('Error fetching brands:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/brands
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }

    let baseSlug = body.slug ? slugify(body.slug) : slugify(body.name);
    if (!baseSlug) baseSlug = 'brand';

    let finalSlug = baseSlug;
    let counter = 1;
    while (await Brand.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const newBrand = await Brand.create({
      name: body.name.trim(),
      slug: finalSlug,
      description: body.description || '',
      logo: body.logo || { url: '', key: '' },
      website: body.website || '',
      order: typeof body.order === 'number' ? body.order : 0,
      featured: Boolean(body.featured),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin/products', 'page');
      revalidatePath('/admin/brands', 'page');
    } catch {}

    return NextResponse.json({ success: true, data: newBrand }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating brand:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/brands
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid brand ID is required' }, { status: 400 });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    const oldName = brand.name;

    if (updates.name) brand.name = updates.name.trim();
    if (updates.description !== undefined) brand.description = updates.description;
    if (updates.logo !== undefined) brand.logo = updates.logo;
    if (updates.website !== undefined) brand.website = updates.website;
    if (typeof updates.order === 'number') brand.order = updates.order;
    if (updates.featured !== undefined) brand.featured = Boolean(updates.featured);
    if (updates.isActive !== undefined) brand.isActive = Boolean(updates.isActive);

    await brand.save();

    // If brand name changed, cascade update assigned products
    if (updates.name && updates.name.trim() !== oldName) {
      await Product.updateMany(
        { brandName: oldName },
        { $set: { brandName: updates.name.trim() } }
      );
    }

    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin/products', 'page');
      revalidatePath('/admin/brands', 'page');
    } catch {}

    return NextResponse.json({ success: true, data: brand });
  } catch (err: any) {
    console.error('Error updating brand:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/brands?id=<id>
 * Removes brand and cleanly unlinks from assigned products.
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid brand ID is required' }, { status: 400 });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    // Safely detach brandName from any assigned products
    const updateResult = await Product.updateMany(
      { brandName: new RegExp(`^${brand.name}$`, 'i') },
      { $set: { brandName: '' } }
    );

    await Brand.findByIdAndDelete(id);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin/products', 'page');
      revalidatePath('/admin/brands', 'page');
    } catch {}

    const detachedMsg =
      updateResult.modifiedCount > 0
        ? ` (${updateResult.modifiedCount} product(s) unlinked)`
        : '';

    return NextResponse.json({
      success: true,
      message: `Brand "${brand.name}" deleted successfully${detachedMsg}`,
    });
  } catch (err: any) {
    console.error('Error deleting brand:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
