import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import CategoryFormClient from '@/components/admin/CategoryFormClient';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Edit Category | Aurem Admin',
  description: 'Update category details, parent department, or visual media',
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await connectDB();
  const { id } = await params;

  // Lookup by ObjectId or by slug
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ _id: id }, { slug: id }] }
    : { slug: id };

  const rawCategory = await Category.findOne(query).lean();

  if (!rawCategory) {
    notFound();
  }

  // Fetch available parent options (excluding self)
  const categoriesRaw = await Category.find({ _id: { $ne: rawCategory._id } })
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

  const initialData = {
    _id: String(rawCategory._id),
    name: rawCategory.name,
    slug: rawCategory.slug,
    description: rawCategory.description || '',
    parentId: rawCategory.parentId ? String(rawCategory.parentId) : null,
    image: rawCategory.image || { url: '', key: '' },
    level: rawCategory.level,
    displayOrder: rawCategory.displayOrder,
    isFeaturedHome: rawCategory.isFeaturedHome,
    isActive: rawCategory.isActive,
  };

  return (
    <CategoryFormClient
      mode="edit"
      initialData={initialData}
      availableParents={parents}
    />
  );
}
