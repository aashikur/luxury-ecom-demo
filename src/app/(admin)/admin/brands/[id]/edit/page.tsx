import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Brand from '@/models/Brand';
import BrandFormClient from '@/components/admin/BrandFormClient';

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Edit Brand | Aurem Admin',
  description: 'Update brand details, logo, or website',
};

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  await connectDB();
  const { id } = await params;

  // Lookup by ObjectId or by slug
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ _id: id }, { slug: id }] }
    : { slug: id };

  const rawBrand = await Brand.findOne(query).lean();

  if (!rawBrand) {
    notFound();
  }

  const initialData = {
    _id: String(rawBrand._id),
    name: rawBrand.name,
    slug: rawBrand.slug,
    description: rawBrand.description || '',
    logo: rawBrand.logo || { url: '', key: '' },
    website: rawBrand.website || '',
    order: rawBrand.order ?? 0,
    featured: Boolean(rawBrand.featured),
    isActive: Boolean(rawBrand.isActive),
  };

  return <BrandFormClient mode="edit" initialData={initialData} />;
}
