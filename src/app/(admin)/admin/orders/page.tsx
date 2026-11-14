import React from 'react';
import { Breadcrumb } from '@/components/ui';
import { getOrdersList } from '@/services/order.service';
import OrdersTableClient, { OrderRow } from '@/components/admin/OrdersTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Orders | Aurem Admin',
  description: 'Manage customer orders and dispatch status',
};

export default async function OrdersPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders' },
  ];

  // In-memory zero-network call to Domain Service (Rule 2: No internal fetch loopback)
  const { orders, pagination } = await getOrdersList({ limit: 50 });

  // Clean serialization for client component boundary
  const serializedOrders: OrderRow[] = JSON.parse(JSON.stringify(orders));

  return (
    <div className="w-full space-y-6">
      {/* 1. Header with Breadcrumb, Title & Subtitle */}
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
          Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and track customer orders, delivery status, and Steadfast courier dispatches.
        </p>
      </div>

      {/* 2. Interactive Orders Table */}
      <OrdersTableClient
        initialOrders={serializedOrders}
        totalCount={pagination.total}
      />
    </div>
  );
}
