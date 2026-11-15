import React from 'react';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import CategoryFormClient from '@/components/admin/CategoryFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Add Category | Aurem Admin',
  description: 'Create a new catalog category or sub-category',
};

export default async function NewCategoryPage() {
  await connectDB();

  const categoriesRaw = await Category.find()
    .select('_id name slug level parentId ancestors')
    .sort({ level: 1, displayOrder: 1, name: 1 })
    .lean();

  const parents = categoriesRaw.map((c: any) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    level: typeof c.level === 'number' ? c.level : 0,
    parentId: c.parentId ? String(c.parentId) : null,
  }));

  return <CategoryFormClient mode="create" availableParents={parents} />;
}
