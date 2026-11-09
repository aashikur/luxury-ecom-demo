import React from 'react';
import AdminShellClient from '@/components/admin/AdminShellClient';

export const metadata = {
  title: 'Aurem Dashboard | Management',
  description: 'Enterprise E-Commerce Management Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShellClient>{children}</AdminShellClient>;
}
