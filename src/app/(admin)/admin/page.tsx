import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Truck,
  ArrowRight,
  Settings,
  Package,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { Breadcrumb } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Dashboard | Aurem Admin',
  description: 'Enterprise E-Commerce Operations Overview',
};

export default async function AdminDashboardPage() {
  await connectDB();

  const totalOrders = await Order.countDocuments({});
  const pendingOrders = await Order.countDocuments({ orderStatus: 'PENDING' });
  const totalProducts = await Product.countDocuments({ isActive: true });

  const kpis = [
    {
      title: 'Total Revenue',
      value: '৳ 0',
      change: '+0% vs last week',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Active Orders',
      value: String(totalOrders),
      change: `${pendingOrders} pending verification`,
      icon: ShoppingBag,
      iconBg: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Garments in Catalog',
      value: String(totalProducts),
      change: 'Active in archive',
      icon: TrendingUp,
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Steadfast Dispatches',
      value: '0',
      change: '100% success rate',
      icon: Truck,
      iconBg: 'bg-purple-50 text-purple-700',
    },
  ];

  const breadcrumbs = [{ label: 'Dashboard' }];

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Quick Actions (Shopify Token Standard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
            Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of store revenue, logistics, and incoming orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition"
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Products</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#076E46] hover:bg-[#055C3A] text-white text-xs font-semibold shadow-2xs transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Store Settings</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 KPI Metric Cards (Clean Unboxed White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="p-5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-md ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#060d11] tracking-tight">{kpi.value}</h3>
                <p className="text-xs text-slate-500 mt-1">{kpi.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Settings Quick Action Card */}
      <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-none tracking-tight text-[#060d11]">
            Configure Bangladesh Logistics &amp; Payments
          </h3>
          <p className="text-sm text-slate-500 max-w-xl">
            Update your Inside/Outside Dhaka courier delivery fees, free shipping threshold, and manual bKash merchant number.
          </p>
        </div>

        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#076E46] hover:bg-[#055C3A] text-white text-xs font-semibold transition shrink-0 shadow-2xs"
        >
          <span>Open Settings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}