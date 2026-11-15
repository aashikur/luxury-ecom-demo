import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Collection from '@/models/Collection';
import CollectionFormClient from '@/components/admin/CollectionFormClient';

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Edit Collection | Aurem Admin',
  description: 'Update collection details, campaign dates, or banner media',
};

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  await connectDB();
  const { id } = await params;

  // Lookup by ObjectId or by slug
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ _id: id }, { slug: id }] }
    : { slug: id };

  const rawCollection = await Collection.findOne(query).lean();

  if (!rawCollection) {
    notFound();
  }

  const initialData = {
    _id: String(rawCollection._id),
    title: rawCollection.title,
    slug: rawCollection.slug,
    description: rawCollection.description || '',
    bannerImage: rawCollection.bannerImage || { url: '', key: '' },
    badgeText: rawCollection.badgeText || '',
    displayOrder: rawCollection.displayOrder ?? 0,
    startDate: rawCollection.startDate ? new Date(rawCollection.startDate).toISOString() : null,
    endDate: rawCollection.endDate ? new Date(rawCollection.endDate).toISOString() : null,
    isActive: rawCollection.isActive,
  };

  return <CollectionFormClient mode="edit" initialData={initialData} />;
}
