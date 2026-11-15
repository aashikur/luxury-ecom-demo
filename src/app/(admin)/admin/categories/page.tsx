import React from 'react';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import CategoriesClient from '@/components/admin/CategoriesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Categories & Taxonomy | Aurem Admin',
  description: 'Manage catalog hierarchy, root departments, and sub-categories',
};

export default async function AdminCategoriesPage() {
  await connectDB();

  // In-memory zero-network call to MongoDB singletons
  const categoriesRaw = await Category.find()
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  // Count active products assigned to each category for live catalog badges
  const productCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$categorySlug', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  productCounts.forEach((pc: { _id: string; count: number }) => {
    if (pc._id) countMap.set(pc._id.toLowerCase(), pc.count);
  });

  const categories = categoriesRaw.map((cat: any) => ({
    _id: String(cat._id),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    parentId: cat.parentId ? String(cat.parentId) : null,
    ancestors: cat.ancestors || [],
    image: cat.image || { url: '', key: '' },
    level: typeof cat.level === 'number' ? cat.level : 0,
    displayOrder: typeof cat.displayOrder === 'number' ? cat.displayOrder : 0,
    isFeaturedHome: Boolean(cat.isFeaturedHome),
    isActive: Boolean(cat.isActive),
    productCount: countMap.get(cat.slug.toLowerCase()) || 0,
    createdAt: cat.createdAt ? new Date(cat.createdAt).toISOString() : new Date().toISOString(),
  }));

  return <CategoriesClient initialCategories={categories} />;
}
