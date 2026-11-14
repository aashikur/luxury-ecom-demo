import React from 'react';
import { getProductsList } from '@/services/product.service';
import ProductsTableClient from '@/components/admin/ProductsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Garments Catalog | Aurem Admin',
  description: 'Manage garment inventory, prices, and variants',
};

export default async function AdminProductsPage() {
  // In-memory zero-network call to Domain Service (Rule 2: No internal fetch loopback, Rule 8: Bounded limit)
  const { products } = await getProductsList({ all: true, limit: 50 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanProducts = products.map((p: any) => ({
    ...p,
    _id: String(p._id),
  }));

  return <ProductsTableClient initialProducts={cleanProducts} />;
}
