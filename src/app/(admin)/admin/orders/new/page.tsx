import React from 'react';
import { Breadcrumb } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Create Order | Aurem Admin',
  description: 'Create a new customer order',
};

export default function NewOrderPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'New Order' },
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
          Create Order
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manually enter a new order and generate tracking details.
        </p>
      </div>
    </div>
  );
}