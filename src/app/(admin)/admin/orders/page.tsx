import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Breadcrumb, Button } from '@/components/ui';
import { getOrdersList } from '@/services/order.service';
import OrdersTableClient, { OrderRow } from '@/components/admin/OrdersTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Orders | Aurem Admin',
  description: 'Manage and track all customer orders.',
};

export default async function OrdersPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders' },
  ];

  // In-memory zero-network call to Domain Service (Rule 2: No internal fetch loopback)
  const { orders, pagination } = await getOrdersList({ limit: 200 });

  // Clean serialization for client component boundary
  const serializedOrders: OrderRow[] = JSON.parse(JSON.stringify(orders));

  return (
    <div className="w-full space-y-6">
      {/* 1. Header with Breadcrumb, Title & Subtitle + New Order CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
            Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track all customer orders.
          </p>
        </div>

        <Link href="/admin/orders/new">
          <Button className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-9 px-3.5 font-semibold gap-1.5 shadow-2xs shrink-0 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Button>
        </Link>
      </div>

      {/* 2. Interactive Orders Table */}
      <OrdersTableClient
        initialOrders={serializedOrders}
        totalCount={pagination.total}
      />
    </div>
  );
}
