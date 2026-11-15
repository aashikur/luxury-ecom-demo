import React from 'react';
import NewOrderFormClient from '@/components/admin/NewOrderFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'New Order | Aurem Admin',
  description: 'Create a new customer order',
};

export default function NewOrderPage() {
  return <NewOrderFormClient />;
}
