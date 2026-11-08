import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

/**
 * ============================================================================
 * LESSON: Products Collection API (Query Engine & Auto-Seeding)
 * ============================================================================
 * 
 * 1. QUERY ENGINE:
 *    - ?collection=hoodies -> Queries indexed `collections` array
 *    - ?category=T-Shirt  -> Queries primaryCategory
 *    - Compound sorting: isPinned (-1) -> priority (-1) -> createdAt (-1)
 * 
 * 2. AUTO-SEEDING:
 *    If Product collection is empty, seeds 3 realistic luxury garments products 
 *    with size variants, stock, measurements, and Cloudflare R2 images.
 */

const SEED_PRODUCTS = [
  {
    title: 'Vintage Heavyweight Acid-Wash Hoodie',
    slug: 'vintage-heavyweight-acid-wash-hoodie',
    description:
      '450 GSM French Terry Cotton. Custom vintage acid wash with dropped shoulders, double-layered hood, and raw distressing.',
    primaryCategory: 'Hoodie',
    collections: ['hoodies', 'winter-drop-2026', 'featured'],
    basePrice: 1850,
    discountPrice: 1450,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        key: 'seed/hoodie-1.webp',
      },
      {
        url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        key: 'seed/hoodie-2.webp',
      },
    ],
    video: {
      provider: 'YOUTUBE',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
    },
    variants: [
      { size: 'M', stock: 12, sku: 'HD-ACID-M', colorName: 'Acid Black' },
      { size: 'L', stock: 8, sku: 'HD-ACID-L', colorName: 'Acid Black' },
      { size: 'XL', stock: 0, sku: 'HD-ACID-XL', colorName: 'Acid Black' }, // Out of stock demo
    ],
    sizeChart: [
      { size: 'M', chest: '44', length: '28', sleeve: '25' },
      { size: 'L', chest: '46', length: '29', sleeve: '26' },
      { size: 'XL', chest: '48', length: '30', sleeve: '27' },
    ],
    isPinned: true,
    priority: 10,
    isActive: true,
  },
  {
    title: 'Oversized Minimalist Boxy Tee 240 GSM',
    slug: 'oversized-minimalist-boxy-tee-240-gsm',
    description:
      '240 GSM Combed Cotton with high-density silicone chest branding. Boxy streetwear fit with ribbed crew collar.',
    primaryCategory: 'T-Shirt',
    collections: ['t-shirts', 'essentials', 'featured'],
    basePrice: 950,
    discountPrice: 790,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        key: 'seed/tee-1.webp',
      },
    ],
    video: {
      provider: 'YOUTUBE',
      url: '',
    },
    variants: [
      { size: 'S', stock: 15, sku: 'TEE-BOXY-S', colorName: 'Bone White' },
      { size: 'M', stock: 20, sku: 'TEE-BOXY-M', colorName: 'Bone White' },
      { size: 'L', stock: 6, sku: 'TEE-BOXY-L', colorName: 'Bone White' },
    ],
    sizeChart: [
      { size: 'S', chest: '40', length: '27', sleeve: '9' },
      { size: 'M', chest: '42', length: '28', sleeve: '9.5' },
      { size: 'L', chest: '44', length: '29', sleeve: '10' },
    ],
    isPinned: false,
    priority: 5,
    isActive: true,
  },
  {
    title: 'Relaxed Fit Utility Cargo Trousers',
    slug: 'relaxed-fit-utility-cargo-trousers',
    description:
      'Engineered Ripstop Cotton with 6-pocket utility layout, adjustable ankle drawstrings, and matte black hardware.',
    primaryCategory: 'Bottoms',
    collections: ['pants', 'winter-drop-2026'],
    basePrice: 1650,
    discountPrice: 1350,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        key: 'seed/cargo-1.webp',
      },
    ],
    variants: [
      { size: 'M', stock: 10, sku: 'CRG-UTL-M', colorName: 'Matte Olive' },
      { size: 'L', stock: 7, sku: 'CRG-UTL-L', colorName: 'Matte Olive' },
      { size: 'XL', stock: 4, sku: 'CRG-UTL-XL', colorName: 'Matte Olive' },
    ],
    sizeChart: [
      { size: 'M', chest: '30-32', length: '39' },
      { size: 'L', chest: '33-35', length: '40' },
      { size: 'XL', chest: '36-38', length: '41' },
    ],
    isPinned: false,
    priority: 0,
    isActive: true,
  },
];

/**
 * GET: Retrieve products with collection/category filters and auto-seeding
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const collection = searchParams.get('collection');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // 1. Check if database is empty -> Auto-seed if 0 products exist
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('⚡ No products found in MongoDB. Seeding initial garments catalog...');
      await Product.insertMany(SEED_PRODUCTS);
    }

    // 2. Build MongoDB query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (collection) {
      filter.collections = collection;
    }

    if (category) {
      filter.primaryCategory = new RegExp(`^${category}$`, 'i');
    }

    // 3. Query with compound index sorting (isPinned -> priority -> createdAt)
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ isPinned: -1, priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Products GET Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST: Create a new garment product (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Required field validations
    if (!body.title || !body.basePrice || !body.primaryCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, basePrice, and primaryCategory are required.',
        },
        { status: 400 }
      );
    }

    // 2. Auto-generate URL slug if not provided
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Check slug collision
    const existing = await Product.findOne({ slug: body.slug });
    if (existing) {
      body.slug = `${body.slug}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Create product
    const product = await Product.create(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: product,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Product POST Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
