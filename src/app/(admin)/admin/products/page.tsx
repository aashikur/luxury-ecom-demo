import React from 'react';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import ProductsTableClient from '@/components/admin/ProductsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Garments Catalog | Aurem Admin',
  description: 'Manage garment inventory, prices, and variants',
};

export default async function AdminProductsPage() {
  await connectDB();

  const rawProducts = await Product.find({})
    .sort({ isPinned: -1, priority: -1, createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(rawProducts));

  return <ProductsTableClient initialProducts={products} />;
}
