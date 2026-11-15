import React from 'react';
import { connectDB } from '@/lib/db';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
import BrandsClient from '@/components/admin/BrandsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Brands | Aurem Admin',
  description: 'Manage brand manufacturers and fashion labels',
};

export default async function AdminBrandsPage() {
  await connectDB();

  // In-memory zero-network call to MongoDB
  const brandsRaw = await Brand.find()
    .sort({ order: 1, name: 1 })
    .lean();

  // Aggregate product counts for each brandName
  const productCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$brandName', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  productCounts.forEach((pc: { _id: string; count: number }) => {
    if (pc._id) countMap.set(pc._id.toLowerCase(), pc.count);
  });

  const brands = brandsRaw.map((b: any) => ({
    _id: String(b._id),
    name: b.name,
    slug: b.slug,
    description: b.description || '',
    logo: b.logo || { url: '', key: '' },
    website: b.website || '',
    order: typeof b.order === 'number' ? b.order : 0,
    featured: Boolean(b.featured),
    isActive: Boolean(b.isActive),
    productCount: countMap.get(b.name.toLowerCase()) || 0,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
  }));

  return <BrandsClient initialBrands={brands} />;
}
