import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Truck,
  ArrowRight,
  Settings,
  Plus,
} from 'lucide-react';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

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
      color: 'text-emerald-400',
    },
    {
      title: 'Active Orders',
      value: String(totalOrders),
      change: `${pendingOrders} pending verification`,
      icon: ShoppingBag,
      color: 'text-blue-400',
    },
    {
      title: 'Garments in Catalog',
      value: String(totalProducts),
      change: 'Active in archive',
      icon: TrendingUp,
      color: 'text-amber-400',
    },
    {
      title: 'Steadfast Dispatches',
      value: '0',
      change: '100% success rate',
      icon: Truck,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-850">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Operations Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status of your store revenue, courier logistics, and incoming orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-semibold border border-zinc-800 transition"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Store Settings</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-850 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-md bg-zinc-800/80 ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{kpi.value}</h3>
                <p className="text-[11px] text-zinc-500 mt-1">{kpi.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings CTA Box */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Configure Bangladesh Delivery & bKash Wallet
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl">
            Update your Inside/Outside Dhaka courier fees, free shipping threshold, and personal bKash number in the settings panel.
          </p>
        </div>

        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-widest transition shrink-0"
        >
          <span>Open Settings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
