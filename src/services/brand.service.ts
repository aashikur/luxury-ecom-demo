import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import Brand from '@/models/Brand';

export interface IBrandNavItem {
  _id: string;
  name: string;
  slug: string;
  logo?: { url: string; key: string };
  website?: string;
  featured: boolean;
  order: number;
}

/**
 * Triggers Dual Next.js Cache Invalidation for Brands
 */
export function invalidateBrandCaches() {
  try {
    revalidateTag('brands', 'max');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
  } catch {
    // Non-request context safeguard
  }
}

/**
 * Fetch all active brands for storefront showcase and catalog filtering
 * Cached via Next.js unstable_cache with tag ['brands']
 */
export const getActiveBrands = unstable_cache(
  async (): Promise<IBrandNavItem[]> => {
    try {
      await connectDB();
      const brands = await Brand.find({ isActive: true })
        .select('_id name slug logo website featured order')
        .sort({ order: 1, name: 1 })
        .lean();

      return JSON.parse(JSON.stringify(brands));
    } catch (err) {
      console.warn('Notice: Brands DB connection deferred:', err instanceof Error ? err.message : err);
      return [];
    }
  },
  ['public-active-brands'],
  { tags: ['brands'], revalidate: 3600 }
);
