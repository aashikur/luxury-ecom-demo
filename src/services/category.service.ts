import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import Category, { ICategory } from '@/models/Category';

export interface ICategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  ancestors: string[];
  image?: { url: string; key: string };
  level: number;
  displayOrder: number;
  isFeaturedHome: boolean;
  isActive: boolean;
  children: ICategoryTreeNode[];
}

/**
 * Triggers Dual Next.js Cache Invalidation for Categories
 */
export function invalidateCategoryCaches() {
  try {
    revalidateTag('categories', 'max');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');
  } catch {
    // Non-request context safeguard
  }
}

/**
 * High-Performance Recursive Category Tree Fetcher
 * Cached via Next.js unstable_cache with tag ['categories']
 */
export const getCategoriesTree = unstable_cache(
  async (): Promise<ICategoryTreeNode[]> => {
    try {
      await connectDB();
      const categories = await Category.find({ isActive: true })
        .select('_id name slug description parentId ancestors image level displayOrder isFeaturedHome isActive')
        .sort({ level: 1, displayOrder: 1, name: 1 })
        .lean();

      if (!categories || categories.length === 0) return [];

      const map = new Map<string, ICategoryTreeNode>();
      const roots: ICategoryTreeNode[] = [];

      // 1. Initialize all nodes
      categories.forEach((cat: any) => {
        map.set(cat._id.toString(), {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          parentId: cat.parentId ? cat.parentId.toString() : null,
          ancestors: cat.ancestors || [],
          image: cat.image,
          level: cat.level,
          displayOrder: cat.displayOrder,
          isFeaturedHome: cat.isFeaturedHome,
          isActive: cat.isActive,
          children: [],
        });
      });

      // 2. Assemble tree hierarchy
      categories.forEach((cat: any) => {
        const node = map.get(cat._id.toString());
        if (node) {
          if (cat.parentId && map.has(cat.parentId.toString())) {
            map.get(cat.parentId.toString())!.children.push(node);
          } else {
            roots.push(node);
          }
        }
      });

      return JSON.parse(JSON.stringify(roots));
    } catch (err) {
      console.warn('Notice: Category tree DB connection deferred:', err instanceof Error ? err.message : err);
      return [];
    }
  },
  ['public-categories-tree'],
  { tags: ['categories'], revalidate: 3600 }
);

/**
 * Fetch all flat active categories for forms and filters
 */
export const getAllActiveCategories = unstable_cache(
  async () => {
    try {
      await connectDB();
      const categories = await Category.find({ isActive: true })
        .select('_id name slug level displayOrder ancestors parentId isFeaturedHome')
        .sort({ displayOrder: 1, name: 1 })
        .lean();
      return JSON.parse(JSON.stringify(categories));
    } catch (err) {
      console.warn('Notice: Active categories DB connection deferred:', err instanceof Error ? err.message : err);
      return [];
    }
  },
  ['public-all-active-categories'],
  { tags: ['categories'], revalidate: 3600 }
);
