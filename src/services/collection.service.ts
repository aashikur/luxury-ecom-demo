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
 * Cached via Next.js unstable_cache with tag ['collections']
 */
export const getCollectionBySlug = unstable_cache(
  async (slug: string): Promise<ICollectionDetail | null> => {
    try {
      await connectDB();
      const col = await Collection.findOne({ slug: slug.toLowerCase().trim(), isActive: true })
        .select('_id title slug parentSlug description bannerImage badgeText isFeaturedHome displayOrder')
        .lean();

      return col ? JSON.parse(JSON.stringify(col)) : null;
    } catch (err) {
      console.warn('Notice: Collection lookup deferred:', err instanceof Error ? err.message : err);
      return null;
    }
  },
  ['public-collection-by-slug'],
  { tags: ['collections'], revalidate: 3600 }
);

/**
 * Fetch all active child collections under a given parent slug
 * Cached via Next.js unstable_cache with tag ['collections']
 */
export const getChildCollections = unstable_cache(
  async (parentSlug: string): Promise<ICollectionNavItem[]> => {
    try {
      await connectDB();
      const children = await Collection.find({ parentSlug: parentSlug.toLowerCase().trim(), isActive: true })
        .select('_id title slug parentSlug badgeText isFeaturedHome displayOrder')
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      return JSON.parse(JSON.stringify(children));
    } catch (err) {
      console.warn('Notice: Child collections lookup deferred:', err instanceof Error ? err.message : err);
      return [];
    }
  },
  ['public-child-collections'],
  { tags: ['collections'], revalidate: 3600 }
);

/**
 * Fetch all active sibling collections under the same parent
 */
export const getSiblingCollections = unstable_cache(
  async (parentSlug: string): Promise<ICollectionNavItem[]> => {
    try {
      await connectDB();
      const siblings = await Collection.find({ parentSlug: parentSlug.toLowerCase().trim(), isActive: true })
        .select('_id title slug parentSlug badgeText isFeaturedHome displayOrder')
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      return JSON.parse(JSON.stringify(siblings));
    } catch (err) {
      console.warn('Notice: Sibling collections lookup deferred:', err instanceof Error ? err.message : err);
      return [];
    }
  },
  ['public-sibling-collections'],
  { tags: ['collections'], revalidate: 3600 }
);
