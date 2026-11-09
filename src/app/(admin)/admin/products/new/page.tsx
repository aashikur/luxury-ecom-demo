import React from 'react';
import NewProductClient from '@/components/admin/NewProductClient';

export const metadata = {
  title: 'Add New Garment | Aurem Admin',
  description: 'Upload new luxury garments to Cloudflare R2 and catalog',
};

export default function NewProductPage() {
  return <NewProductClient />;
}
