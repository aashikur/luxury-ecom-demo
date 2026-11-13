import React from 'react';
import { Breadcrumb } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Orders | Aurem Admin',
  description: 'Manage customer orders and dispatch status',
};

export default function OrdersPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Header with Breadcrumb, Title & Subtitle */}
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
          Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and track customer orders, delivery status, and payments.
        </p>
      </div>
    </div>
  );
}