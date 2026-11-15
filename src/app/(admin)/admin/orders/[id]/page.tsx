import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderByIdOrNumber } from '@/services/order.service';
import OrderDetailClient, { OrderDetailData } from '@/components/admin/OrderDetailClient';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return {
    title: `Order ${id} | Aurem Admin`,
    description: `Inspect order details, customer contact, and courier dispatch for order ${id}`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  // In-memory zero-network call to Domain Service (Rule 2: No internal fetch loopback)
  const rawOrder = await getOrderByIdOrNumber(id);

  if (!rawOrder) {
    notFound();
  }

  // Clean JSON serialization for Client Component boundary
  const cleanOrder: OrderDetailData = JSON.parse(JSON.stringify(rawOrder));

  return <OrderDetailClient initialOrder={cleanOrder} />;
}
