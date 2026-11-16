import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import Collection, { ICollection } from '@/models/Collection';

export interface ICollectionNavItem {
  _id: string;
  title: string;
  slug: string;
  parentSlug?: string | null;
  badgeText?: string;
  isFeaturedHome?: boolean;
  displayOrder?: number;
}

export interface ICollectionDetail extends ICollectionNavItem {
  description?: string;
  bannerImage?: {
    url: string;
    key?: string;
  };
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
        .select('_id title slug parentSlug badgeText isFeaturedHome displayOrder')
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

/**
 * Fetch a single collection by slug
 * Cached per slug via Next.js unstable_cache with tag ['collections']
 */
export async function getCollectionBySlug(slug: string): Promise<ICollectionDetail | null> {
  const normalized = slug.toLowerCase().trim();
  return unstable_cache(
    async (): Promise<ICollectionDetail | null> => {
      try {
        await connectDB();
        const col = await Collection.findOne({ slug: normalized, isActive: true })
          .select('_id title slug parentSlug description bannerImage badgeText isFeaturedHome displayOrder')
          .lean();

        return col ? JSON.parse(JSON.stringify(col)) : null;
      } catch (err) {
        console.warn('Notice: Collection lookup deferred:', err instanceof Error ? err.message : err);
        return null;
      }
    },
    ['public-collection-by-slug', normalized],
    { tags: ['collections'], revalidate: 3600 }
  )();
}

/**
 * Fetch all active child collections under a given parent slug
 * Cached per parentSlug via Next.js unstable_cache with tag ['collections']
 */
export async function getChildCollections(parentSlug: string): Promise<ICollectionNavItem[]> {
  const normalized = parentSlug.toLowerCase().trim();
  return unstable_cache(
    async (): Promise<ICollectionNavItem[]> => {
      try {
        await connectDB();
        const children = await Collection.find({ parentSlug: normalized, isActive: true })
          .select('_id title slug parentSlug badgeText isFeaturedHome displayOrder')
          .sort({ displayOrder: 1, createdAt: -1 })
          .lean();

        return JSON.parse(JSON.stringify(children));
      } catch (err) {
        console.warn('Notice: Child collections lookup deferred:', err instanceof Error ? err.message : err);
        return [];
      }
    },
    ['public-child-collections', normalized],
    { tags: ['collections'], revalidate: 3600 }
  )();
}

/**
 * Fetch all active sibling collections under the same parent
 * Cached per parentSlug via Next.js unstable_cache with tag ['collections']
 */
export async function getSiblingCollections(parentSlug: string): Promise<ICollectionNavItem[]> {
  const normalized = parentSlug.toLowerCase().trim();
  return unstable_cache(
    async (): Promise<ICollectionNavItem[]> => {
      try {
        await connectDB();
        const siblings = await Collection.find({ parentSlug: normalized, isActive: true })
          .select('_id title slug parentSlug badgeText isFeaturedHome displayOrder')
          .sort({ displayOrder: 1, createdAt: -1 })
          .lean();

        return JSON.parse(JSON.stringify(siblings));
      } catch (err) {
        console.warn('Notice: Sibling collections lookup deferred:', err instanceof Error ? err.message : err);
        return [];
      }
    },
    ['public-sibling-collections', normalized],
    { tags: ['collections'], revalidate: 3600 }
  )();
}
