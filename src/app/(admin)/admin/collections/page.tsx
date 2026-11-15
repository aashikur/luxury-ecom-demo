import React from 'react';
import { connectDB } from '@/lib/db';
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import CollectionsClient from '@/components/admin/CollectionsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Collections | Aurem Admin',
  description: 'Manage marketing collections, seasonal drops, and campaigns',
};

export default async function AdminCollectionsPage() {
  await connectDB();

  // In-memory zero-network call to MongoDB
  const collectionsRaw = await Collection.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();

  // Aggregate product counts for each collection slug
  const productCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$collections' },
    { $group: { _id: '$collections', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  productCounts.forEach((pc: { _id: string; count: number }) => {
    if (pc._id) countMap.set(pc._id.toLowerCase(), pc.count);
  });

  const collections = collectionsRaw.map((col: any) => ({
    _id: String(col._id),
    title: col.title,
    slug: col.slug,
    description: col.description || '',
    bannerImage: col.bannerImage || { url: '', key: '' },
    badgeText: col.badgeText || '',
    displayOrder: typeof col.displayOrder === 'number' ? col.displayOrder : 0,
    isFeaturedHome: Boolean(col.isFeaturedHome),
    isActive: Boolean(col.isActive),
    productCount: countMap.get(col.slug.toLowerCase()) || 0,
    startDate: col.startDate ? new Date(col.startDate).toISOString() : null,
    endDate: col.endDate ? new Date(col.endDate).toISOString() : null,
    createdAt: col.createdAt ? new Date(col.createdAt).toISOString() : new Date().toISOString(),
  }));

  return <CollectionsClient initialCollections={collections} />;
}
