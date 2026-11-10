import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailClient from '@/components/admin/ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Product Inspector | Aurem Admin',
  description: 'Inspect garment specs, photos, and inventory count',
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await connectDB();
  const { id } = await params;

  // Lookup by ObjectId or by slug
  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ _id: id }, { slug: id }] }
    : { slug: id };

  const rawProduct = await Product.findOne(query).lean();

  if (!rawProduct) {
    notFound();
  }

  const product = JSON.parse(JSON.stringify(rawProduct));

  return <ProductDetailClient product={product} />;
}
