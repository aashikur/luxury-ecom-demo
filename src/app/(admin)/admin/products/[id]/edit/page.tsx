import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import EditProductClient from '@/components/admin/EditProductClient';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Product | Aurem Admin',
  description: 'Update garment details, pricing, and stock',
};

export default async function EditProductPage({ params }: EditProductPageProps) {
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

  return <EditProductClient product={product} />;
}
