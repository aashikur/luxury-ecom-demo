import React from 'react';
import ProductFormClient from '@/components/admin/ProductFormClient';

export const metadata = {
  title: 'New Product | Aurem Admin',
  description: 'Add a new product to the catalog',
};

export default function NewProductPage() {
  return <ProductFormClient mode="create" />;
}
