import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import Collection, { ICollection } from '@/models/Collection';

export interface ICollectionNavItem {
  _id: string;
  title: string;
  slug: string;
  badgeText?: string;
  isFeaturedHome?: boolean;
  displayOrder?: number;
}

/**
 * Triggers Dual Next.js Cache Invalidation for Collections
 */
export function invalidateCollectionCaches() {
  try {
    revalidateTag('collections', 'max');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/collections');
  } catch {
    // Non-request context safeguard
  }
}

/**
 * Fetch all active marketing collections for storefront navigation and showcase
 * Cached via Next.js unstable_cache with tag ['collections']
 */
export const getActiveCollections = unstable_cache(
  async (): Promise<ICollectionNavItem[]> => {
    try {
      await connectDB();
      const collections = await Collection.find({ isActive: true })
        .select('_id title slug badgeText isFeaturedHome displayOrder')
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      return JSON.parse(JSON.stringify(collections));
    } catch (err) {
      console.warn('Notice: Collections DB connection deferred:', err instanceof Error ? err.message : err);
      return [];
    }
  },
  ['public-active-collections'],
  { tags: ['collections'], revalidate: 3600 }
);
