import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import { deleteFromR2 } from '@/lib/storage';
import { ProductStatus } from '@/types/domain';
import { ApiPaginationMeta } from '@/types/api';
import { getChildCollections } from './collection.service';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  collection?: string | string[];
  category?: string | string[];
  categorySlug?: string;
  brand?: string;
  status?: ProductStatus;
  isPinned?: boolean;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  stockStatus?: string;
  sizes?: string | string[];
  sort?: string;
  all?: boolean; // Admin bypass for drafts
}

export interface ProductsListResult {
  products: IProduct[];
  pagination: ApiPaginationMeta;
}

export interface CatalogFilterFacets {
  minCatalogPrice: number;
  maxCatalogPrice: number;
  availableSizes: string[];
  categoryCounts: Record<string, number>;
  collectionCounts: Record<string, number>;
}

/**
 * Triggers Dual Next.js Cache Invalidation (Tag + Paths)
 */
export function invalidateProductCaches(slug?: string) {
  try {
    revalidateTag('products', 'max');
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
  const maxAllowed = params.all ? 500 : 50;
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), maxAllowed);
  const page = Math.max(Number(params.page) || 1, 1);
  const skip = (page - 1) * limit;

  try {
    await connectDB();
  } catch (err) {
    console.warn('Notice: Products DB connection deferred:', err instanceof Error ? err.message : err);
    return {
      products: [],
      pagination: {
        total: 0,
        page,
        pages: 1,
        limit,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  // Status Filter: Public callers default to PUBLISHED / isActive: true
  if (params.all) {
    if (params.status) query.status = params.status;
  } else {
    query.isActive = true;
    query.status = 'PUBLISHED';
  }

  // Merchandising Collections filter (Solution A: Automatic Parent Collection Aggregation)
  if (params.collection) {
    if (Array.isArray(params.collection)) {
      query.collections = { $in: params.collection };
    } else {
      const colSlug = params.collection.toLowerCase().trim();
      const childCols = await getChildCollections(colSlug);
      if (childCols && childCols.length > 0) {
        query.collections = { $in: [colSlug, ...childCols.map((c) => c.slug)] };
      } else {
        query.collections = colSlug;
      }
    }
  }

  // Category filter: checks categorySlug, ancestors path, or categoryName (supports multi-select)
  const catParam = params.categorySlug || params.category;
  if (catParam) {
    const catList = Array.isArray(catParam)
      ? catParam
      : catParam.includes(',')
      ? catParam.split(',').map((s) => s.trim().toLowerCase())
      : [catParam.trim().toLowerCase()];

    if (catList.length === 1) {
      query.$or = [
        { categorySlug: catList[0] },
        { categoryPath: catList[0] },
        { categoryName: new RegExp(`^${catList[0]}$`, 'i') },
      ];
    } else {
      query.$or = [
        { categorySlug: { $in: catList } },
        { categoryPath: { $in: catList } },
        { categoryName: { $in: catList.map((c) => new RegExp(`^${c}$`, 'i')) } },
      ];
    }
  }

  // Sizes filter: checks variant option matching e.g. ['S', 'M', 'L']
  if (params.sizes) {
    const sizeList = Array.isArray(params.sizes)
      ? params.sizes
      : params.sizes.includes(',')
      ? params.sizes.split(',').map((s) => s.trim())
      : [params.sizes.trim()];

    if (sizeList.length > 0) {
      query.variants = {
        $elemMatch: {
          'selectedOptions.name': new RegExp('^size$', 'i'),
          'selectedOptions.value': { $in: sizeList },
          stock: { $gt: 0 },
        },
      };
    }
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

  // Stock & Availability filter
  if (params.inStock !== undefined) {
    query.inStock = params.inStock;
  }
  if (params.stockStatus) {
    query.stockStatus = params.stockStatus;
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

  // Sorting strategy (Admin defaults strictly to newest-first, storefront defaults to merchandising priorities)
  let sortOption: Record<string, 1 | -1> = params.all
    ? { createdAt: -1, _id: -1 }
    : { isPinned: -1, priority: -1, createdAt: -1 };

  if (params.sort === 'price-asc') {
    sortOption = { basePrice: 1 };
  } else if (params.sort === 'price-desc') {
    sortOption = { basePrice: -1 };
  } else if (params.sort === 'title-asc' || params.sort === 'alpha-asc') {
    sortOption = { title: 1 };
  } else if (params.sort === 'title-desc' || params.sort === 'alpha-desc') {
    sortOption = { title: -1 };
  } else if (params.sort === 'date-asc' || params.sort === 'oldest') {
    sortOption = { createdAt: 1, _id: 1 };
  } else if (params.sort === 'date-desc' || params.sort === 'newest') {
    sortOption = { createdAt: -1, _id: -1 };
  } else if (params.sort === 'best-selling') {
    sortOption = { isPinned: -1, totalStock: -1, createdAt: -1 };
  } else if (params.sort === 'relevant') {
    sortOption = { isPinned: -1, createdAt: -1 };
  }

  // Zero-waterfall execution
  const [rawProducts, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
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
  try {
    await connectDB();
    const rawProduct = await Product.findOne({ slug }).lean();
    if (!rawProduct) return null;
    return JSON.parse(JSON.stringify(rawProduct)) as IProduct;
  } catch (err) {
    console.warn('Notice: Product lookup deferred:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Product lookup by Mongo _id.
 */
export async function getProductById(id: string): Promise<IProduct | null> {
  try {
    await connectDB();
    const rawProduct = await Product.findById(id).lean();
    if (!rawProduct) return null;
    return JSON.parse(JSON.stringify(rawProduct)) as IProduct;
  } catch (err) {
    console.warn('Notice: Product lookup deferred:', err instanceof Error ? err.message : err);
    return null;
  }
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

/**
 * Pre-computes and caches filter facets (Price boundaries, sizes, category & collection counts)
 * Cached with Next.js unstable_cache with tags ['products', 'categories', 'collections']
 */
export const getCatalogFacets = unstable_cache(
  async (): Promise<CatalogFilterFacets> => {
    try {
      await connectDB();
      const activeProducts = await Product.find({ isActive: true, status: 'PUBLISHED' })
        .select('basePrice maxPrice categorySlug categoryName collections variantOptions.name variantOptions.values.label')
        .lean();

      if (!activeProducts || activeProducts.length === 0) {
        return {
          minCatalogPrice: 0,
          maxCatalogPrice: 20000,
          availableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
          categoryCounts: {},
          collectionCounts: {},
        };
      }

      let minPrice = Infinity;
      let maxPrice = 0;
      const sizeSet = new Set<string>();
      const categoryCounts: Record<string, number> = {};
      const collectionCounts: Record<string, number> = {};

      activeProducts.forEach((p) => {
        const bp = p.basePrice || 0;
        const mp = p.maxPrice || bp;
        if (bp < minPrice) minPrice = bp;
        if (mp > maxPrice) maxPrice = mp;

        // Count categories
        if (p.categorySlug) {
          categoryCounts[p.categorySlug] = (categoryCounts[p.categorySlug] || 0) + 1;
        }

        // Count collections
        if (p.collections && Array.isArray(p.collections)) {
          p.collections.forEach((c: string) => {
            collectionCounts[c] = (collectionCounts[c] || 0) + 1;
          });
        }

        // Extract sizes
        if (p.variantOptions && Array.isArray(p.variantOptions)) {
          p.variantOptions.forEach((grp: any) => {
            if (/^size$/i.test(grp.name) && Array.isArray(grp.values)) {
              grp.values.forEach((v: any) => {
                if (v.label) sizeSet.add(v.label);
              });
            }
          });
        }
      });

      // Standardize size order
      const standardOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'Free Size', 'Custom'];
      const sortedSizes = Array.from(sizeSet).sort((a, b) => {
        const idxA = standardOrder.indexOf(a);
        const idxB = standardOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });

      return {
        minCatalogPrice: minPrice === Infinity ? 0 : Math.floor(minPrice),
        maxCatalogPrice: maxPrice === 0 ? 20000 : Math.ceil(maxPrice),
        availableSizes: sortedSizes.length > 0 ? sortedSizes : ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
        categoryCounts,
        collectionCounts,
      };
    } catch (err) {
      console.warn('Notice: Catalog facets deferred:', err instanceof Error ? err.message : err);
      return {
        minCatalogPrice: 0,
        maxCatalogPrice: 20000,
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
        categoryCounts: {},
        collectionCounts: {},
      };
    }
  },
  ['public-catalog-facets'],
  { tags: ['products', 'categories', 'collections'], revalidate: 3600 }
);
