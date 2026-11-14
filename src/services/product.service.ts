import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import { deleteFromR2 } from '@/lib/storage';
import { ProductStatus } from '@/types/domain';
import { ApiPaginationMeta } from '@/types/api';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  collection?: string;
  category?: string;
  categorySlug?: string;
  brand?: string;
  status?: ProductStatus;
  isPinned?: boolean;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  all?: boolean; // Admin bypass for drafts
}

export interface ProductsListResult {
  products: IProduct[];
  pagination: ApiPaginationMeta;
}

/**
 * Triggers Dual Next.js Cache Invalidation (Tag + Paths)
 */
export function invalidateProductCaches(slug?: string) {
  try {
    revalidateTag('products');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    if (slug) {
      revalidatePath(`/products/${slug}`);
    }
  } catch {
    // Graceful no-op in non-request contexts (e.g. background tasks or seeds)
  }
}

/**
 * Queries catalog products with bounded pagination, ESR index matching, and lean projection.
 */
export async function getProductsList(
  params: GetProductsParams = {}
): Promise<ProductsListResult> {
  await connectDB();

  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
  const page = Math.max(Number(params.page) || 1, 1);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  // Status Filter: Public callers default to PUBLISHED / isActive: true
  if (params.all) {
    if (params.status) query.status = params.status;
  } else {
    query.isActive = true;
    query.status = 'PUBLISHED';
  }

  // Merchandising Collections filter
  if (params.collection) {
    query.collections = params.collection;
  }

  // Category filter: checks categorySlug, ancestors path, or categoryName
  const catParam = params.categorySlug || params.category;
  if (catParam) {
    query.$or = [
      { categorySlug: catParam },
      { categoryPath: catParam },
      { categoryName: new RegExp(`^${catParam}$`, 'i') },
    ];
  }

  // Brand filter
  if (params.brand) {
    query.$or = [
      { brandSlug: params.brand },
      { brandName: new RegExp(`^${params.brand}$`, 'i') },
    ];
  }

  // Pinned filter
  if (params.isPinned !== undefined) {
    query.isPinned = params.isPinned;
  }

  // Stock filter
  if (params.inStock !== undefined) {
    query.inStock = params.inStock;
  }

  // Price Range filter
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    query.basePrice = {};
    if (params.minPrice !== undefined) query.basePrice.$gte = params.minPrice;
    if (params.maxPrice !== undefined) query.basePrice.$lte = params.maxPrice;
  }

  // Free-text Search
  if (params.q && params.q.trim()) {
    const regex = new RegExp(params.q.trim(), 'i');
    query.$or = [
      { title: regex },
      { description: regex },
      { categoryName: regex },
      { 'variants.sku': regex },
      { 'variants.title': regex },
    ];
  }

  // Zero-waterfall execution
  const [rawProducts, total] = await Promise.all([
    Product.find(query)
      .sort({ isPinned: -1, priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        'title slug productType categorySlug categoryName collections basePrice discountPrice maxPrice totalStock inStock status isPinned priority media variants variantOptions sizeChart specifications highlights createdAt'
      )
      .lean(),
    Product.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;
  const products = JSON.parse(JSON.stringify(rawProducts)) as IProduct[];

  return {
    products,
    pagination: {
      total,
      page,
      pages,
      limit,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Single Product PDP retrieval by unique slug with lean hydration.
 */
export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  await connectDB();
  const rawProduct = await Product.findOne({ slug }).lean();
  if (!rawProduct) return null;
  return JSON.parse(JSON.stringify(rawProduct)) as IProduct;
}

/**
 * Product lookup by Mongo _id.
 */
export async function getProductById(id: string): Promise<IProduct | null> {
  await connectDB();
  const rawProduct = await Product.findById(id).lean();
  if (!rawProduct) return null;
  return JSON.parse(JSON.stringify(rawProduct)) as IProduct;
}

/**
 * Creates a new Product with auto-slug generation and pre-save variant computation.
 */
export async function createProduct(
  dto: Partial<IProduct>,
  actor: string = 'ADMIN'
): Promise<IProduct> {
  await connectDB();

  // Auto-generate slug if omitted
  let slug = dto.slug;
  if (!slug && dto.title) {
    slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Check slug uniqueness
  const existing = await Product.findOne({ slug }).select('_id').lean();
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const productData = {
    ...dto,
    slug,
    createdBy: actor,
    updatedBy: actor,
  };

  const newProduct = new Product(productData);
  await newProduct.save();

  invalidateProductCaches(newProduct.slug);
  return JSON.parse(JSON.stringify(newProduct)) as IProduct;
}

/**
 * Updates an existing product by slug or _id with cache busting.
 */
export async function updateProduct(
  idOrSlug: string,
  dto: Partial<IProduct>,
  actor: string = 'ADMIN'
): Promise<IProduct | null> {
  await connectDB();

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(query);
  if (!product) return null;

  Object.assign(product, dto, { updatedBy: actor });
  await product.save();

  invalidateProductCaches(product.slug);
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

/**
 * Deletes a product and purges associated media from Cloudflare R2 bucket.
 */
export async function deleteProduct(
  idOrSlug: string,
  _actor: string = 'ADMIN'
): Promise<{ success: boolean; deletedSlug?: string }> {
  await connectDB();

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(query);
  if (!product) return { success: false };

  const slug = product.slug;

  // 1. Gather all R2 asset keys from root media and variant images
  const keysToDelete: string[] = [];
  if (product.media && Array.isArray(product.media)) {
    product.media.forEach((m) => {
      if (m.key) keysToDelete.push(m.key);
    });
  }
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      if (v.image?.key) keysToDelete.push(v.image.key);
    });
  }

  // 2. Cascade asynchronous R2 deletion in parallel
  if (keysToDelete.length > 0) {
    Promise.allSettled(keysToDelete.map((k) => deleteFromR2(k))).catch(() => {});
  }

  // 3. Delete document from MongoDB
  await Product.deleteOne({ _id: product._id });

  invalidateProductCaches(slug);
  return { success: true, deletedSlug: slug };
}

/**
 * Granular atomic stock correction for a specific variant or root product.
 */
export async function adjustProductStock(
  productId: string,
  variantId: string | null,
  qtyDelta: number,
  actor: string = 'ADMIN'
): Promise<boolean> {
  await connectDB();

  if (variantId) {
    const res = await Product.updateOne(
      { _id: productId, 'variants._id': variantId },
      {
        $inc: {
          'variants.$.stock': qtyDelta,
          totalStock: qtyDelta,
        },
        $set: { updatedBy: actor },
      }
    );
    if (res.modifiedCount > 0) {
      // Re-trigger pre-save logic to update inStock
      const p = await Product.findById(productId);
      if (p) await p.save();
      invalidateProductCaches(p?.slug);
      return true;
    }
  } else {
    const res = await Product.updateOne(
      { _id: productId },
      {
        $inc: { totalStock: qtyDelta },
        $set: { updatedBy: actor },
      }
    );
    if (res.modifiedCount > 0) {
      const p = await Product.findById(productId);
      if (p) await p.save();
      invalidateProductCaches(p?.slug);
      return true;
    }
  }

  return false;
}
