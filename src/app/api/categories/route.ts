import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category, { ICategory } from '@/models/Category';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// Helper: slugify string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

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
 * Build recursive category tree from a flat list
 */
function buildTree(categories: ICategory[]): ICategoryTreeNode[] {
  const map = new Map<string, ICategoryTreeNode>();
  const roots: ICategoryTreeNode[] = [];

  // 1. Initialize map
  categories.forEach((cat) => {
    map.set(cat._id.toString(), {
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
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

  // 2. Link children to parents
  categories.forEach((cat) => {
    const node = map.get(cat._id.toString())!;
    if (cat.parentId && map.has(cat.parentId.toString())) {
      map.get(cat.parentId.toString())!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 3. Sort children by displayOrder
  const sortNodes = (nodes: ICategoryTreeNode[]) => {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

/**
 * GET /api/categories
 * Query options:
 * ?tree=true -> returns hierarchical tree (roots with nested children)
 * ?featured=true -> returns only featured categories for storefront homepage
 * ?parentId=<id|null> -> returns direct children
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const parentId = searchParams.get('parentId');

    const filter: Record<string, any> = {};

    if (featured) {
      filter.isFeaturedHome = true;
      filter.isActive = true;
    }

    if (parentId !== null && parentId !== undefined) {
      filter.parentId = parentId === 'null' ? null : parentId;
    }

    const categories = await Category.find(filter)
      .sort({ level: 1, displayOrder: 1, name: 1 })
      .lean();

    if (tree) {
      const treeData = buildTree(categories as unknown as ICategory[]);
      return NextResponse.json({ success: true, count: categories.length, data: treeData });
    }

    return NextResponse.json({ success: true, count: categories.length, data: categories });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/categories
 * Creates a new category with auto-slug, level calculation, and ancestors derivation.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // 1. Slug handling
    let baseSlug = body.slug ? slugify(body.slug) : slugify(body.name);
    if (!baseSlug) baseSlug = 'category';

    let finalSlug = baseSlug;
    let counter = 1;
    while (await Category.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // 2. Parent & Ancestor derivation
    let level = 0;
    let ancestors: string[] = [];
    let validParentId: mongoose.Types.ObjectId | null = null;

    if (body.parentId && mongoose.Types.ObjectId.isValid(body.parentId)) {
      const parent = await Category.findById(body.parentId);
      if (parent) {
        validParentId = parent._id as mongoose.Types.ObjectId;
        level = (parent.level || 0) + 1;
        ancestors = [...(parent.ancestors || []), parent.slug];
      }
    }

    const newCategory = await Category.create({
      name: body.name.trim(),
      slug: finalSlug,
      description: body.description || '',
      parentId: validParentId,
      ancestors,
      image: body.image || { url: '', key: '' },
      level,
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 0,
      isFeaturedHome: Boolean(body.isFeaturedHome),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating category:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/categories
 * Updates a category with circular dependency safeguards.
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid category ID is required' }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Circular dependency check
    if (updates.parentId) {
      if (updates.parentId === id) {
        return NextResponse.json({ success: false, error: 'A category cannot be its own parent' }, { status: 400 });
      }

      // Check if candidate parent has current category in its ancestors
      const candidateParent = await Category.findById(updates.parentId);
      if (candidateParent && candidateParent.ancestors.includes(category.slug)) {
        return NextResponse.json(
          { success: false, error: 'Circular hierarchy detected: cannot set descendant as parent' },
          { status: 400 }
        );
      }

      if (candidateParent) {
        category.parentId = candidateParent._id as mongoose.Types.ObjectId;
        category.level = (candidateParent.level || 0) + 1;
        category.ancestors = [...(candidateParent.ancestors || []), candidateParent.slug];
      }
    } else if (updates.parentId === null) {
      category.parentId = null;
      category.level = 0;
      category.ancestors = [];
    }

    if (updates.name) category.name = updates.name.trim();
    if (updates.description !== undefined) category.description = updates.description;
    if (updates.image !== undefined) category.image = updates.image;
    if (typeof updates.displayOrder === 'number') category.displayOrder = updates.displayOrder;
    if (updates.isFeaturedHome !== undefined) category.isFeaturedHome = Boolean(updates.isFeaturedHome);
    if (updates.isActive !== undefined) category.isActive = Boolean(updates.isActive);

    await category.save();

    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    console.error('Error updating category:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/categories?id=<id>
 * Deletion safeguards: Checks for child categories and assigned active products.
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid category ID is required' }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // 1. Safeguard: Check if it has child subcategories
    const childCount = await Category.countDocuments({ parentId: id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete "${category.name}". It contains ${childCount} subcategories. Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    // 2. Safeguard: Check if any active products are assigned to this category
    const productCount = await Product.countDocuments({
      $or: [{ categoryId: id }, { categorySlug: category.slug }, { categoryPath: category.slug }],
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete "${category.name}". ${productCount} active products are currently assigned to it. Please reassign those products first.`,
        },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
