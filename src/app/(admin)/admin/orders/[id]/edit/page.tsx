import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderByIdOrNumber } from '@/services/order.service';
import EditOrderFormClient, { EditOrderData } from '@/components/admin/EditOrderFormClient';

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: EditOrderPageProps) {
  const { id } = await params;
  return {
    title: `Edit ${id} | Aurem Admin`,
    description: `Update order information for ${id}`,
  };
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;

  // In-memory zero-network call to Domain Service (Rule 2: No internal fetch loopback)
  const rawOrder = await getOrderByIdOrNumber(id);

  if (!rawOrder) {
    notFound();
  }

  // Clean serialization for Client Component boundary
  const cleanOrder: EditOrderData = JSON.parse(JSON.stringify(rawOrder));

  return <EditOrderFormClient order={cleanOrder} />;
}
