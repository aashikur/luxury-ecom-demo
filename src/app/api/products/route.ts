import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

/**
 * ============================================================================
 * LESSON: Products Collection API (Query Engine & Auto-Seeding)
 * ============================================================================
 * 
 * 1. QUERY ENGINE:
 *    - ?collection=hoodies -> Queries indexed `collections` array
 *    - ?category=t-shirts -> Queries categorySlug
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
    categoryName: 'Hoodie',
    collections: ['hoodies', 'winter-drop-2026', 'featured'],
    basePrice: 1850,
    discountPrice: 1450,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        key: 'seed/hoodie-1.webp',
        type: 'IMAGE',
      },
      {
        url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        key: 'seed/hoodie-2.webp',
        type: 'IMAGE',
      },
    ],
    variantOptions: [
      { name: 'Size', values: [{ label: 'M' }, { label: 'L' }, { label: 'XL' }] },
      { name: 'Color', values: [{ label: 'Acid Black', meta: '#18181B' }] },
    ],
    variants: [
      {
        title: 'M / Acid Black',
        sku: 'HD-ACID-M',
        stock: 12,
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Acid Black' },
        ],
      },
      {
        title: 'L / Acid Black',
        sku: 'HD-ACID-L',
        stock: 8,
        selectedOptions: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Acid Black' },
        ],
      },
      {
        title: 'XL / Acid Black',
        sku: 'HD-ACID-XL',
        stock: 0,
        selectedOptions: [
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'Acid Black' },
        ],
      },
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
    categoryName: 'T-Shirt',
    collections: ['t-shirts', 'essentials', 'featured'],
    basePrice: 950,
    discountPrice: 790,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        key: 'seed/tee-1.webp',
        type: 'IMAGE',
      },
    ],
    variantOptions: [
      { name: 'Size', values: [{ label: 'S' }, { label: 'M' }, { label: 'L' }] },
      { name: 'Color', values: [{ label: 'Bone White', meta: '#F5F5F0' }] },
    ],
    variants: [
      {
        title: 'S / Bone White',
        sku: 'TEE-BOXY-S',
        stock: 15,
        selectedOptions: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'Bone White' },
        ],
      },
      {
        title: 'M / Bone White',
        sku: 'TEE-BOXY-M',
        stock: 20,
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Bone White' },
        ],
      },
      {
        title: 'L / Bone White',
        sku: 'TEE-BOXY-L',
        stock: 6,
        selectedOptions: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Bone White' },
        ],
      },
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
    categoryName: 'Bottoms',
    collections: ['pants', 'winter-drop-2026'],
    basePrice: 1650,
    discountPrice: 1350,
    media: [
      {
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        key: 'seed/cargo-1.webp',
        type: 'IMAGE',
      },
    ],
    variantOptions: [
      { name: 'Size', values: [{ label: 'M' }, { label: 'L' }, { label: 'XL' }] },
      { name: 'Color', values: [{ label: 'Matte Olive', meta: '#556B2F' }] },
    ],
    variants: [
      {
        title: 'M / Matte Olive',
        sku: 'CRG-UTL-M',
        stock: 10,
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Matte Olive' },
        ],
      },
      {
        title: 'L / Matte Olive',
        sku: 'CRG-UTL-L',
        stock: 7,
        selectedOptions: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'Matte Olive' },
        ],
      },
      {
        title: 'XL / Matte Olive',
        sku: 'CRG-UTL-XL',
        stock: 4,
        selectedOptions: [
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'Matte Olive' },
        ],
      },
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
    const categorySlug = searchParams.get('categorySlug');
    const all = searchParams.get('all') === 'true';
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
    const filter: Record<string, any> = {};
    if (!all) {
      filter.isActive = true;
    }

    if (collection) {
      filter.collections = collection;
    }

    if (categorySlug) {
      filter.$or = [
        { categorySlug: categorySlug },
        { categoryPath: categorySlug },
      ];
    } else if (category) {
      filter.categoryName = new RegExp(`^${category}$`, 'i');
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

    // 1. Required field validations (Strict Step 2 Standard: No legacy aliases)
    if (!body.title || !body.basePrice || !body.categoryName) {
      return apiError(
        'Title, basePrice, and categoryName are required.',
        'VALIDATION_ERROR',
        400
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

    // 3. Assign Audit Actor Defaults
    body.createdBy = body.createdBy || 'ADMIN';
    body.updatedBy = body.updatedBy || 'ADMIN';

    // 4. Create product
    const product = await Product.create(body);

    // Revalidate all caches across storefront and admin
    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/admin/products', 'page');
      if (product.slug) {
        revalidatePath(`/products/${product.slug}`, 'page');
      }
    } catch (revErr) {
      console.warn('Revalidation notice:', revErr);
    }

    return apiSuccess(product, {
      message: 'Product created successfully',
      status: 201,
    });
  } catch (error: unknown) {
    console.error('Product POST Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
