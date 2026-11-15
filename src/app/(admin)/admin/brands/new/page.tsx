import React from 'react';
import BrandFormClient from '@/components/admin/BrandFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Add Brand | Aurem Admin',
  description: 'Create a new brand or label partner',
};

export default function NewBrandPage() {
  return <BrandFormClient mode="create" />;
}
