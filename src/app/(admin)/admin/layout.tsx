import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  ExternalLink,
  ShieldCheck,
  Search,
  Bell,
  SunMoon,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Studio | Aurem Luxury',
  description: 'Enterprise E-Commerce Management Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* 1. Left Fixed Enterprise Dark Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Top Brand Monogram */}
          <div className="h-16 px-6 border-b border-zinc-900 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-md bg-emerald-500 text-zinc-950 font-black flex items-center justify-center text-sm shadow-md">
                A
              </span>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white uppercase">Aurem Admin</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Management</p>
              </div>
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="p-4 space-y-6 text-xs">
            {/* Group: OVERVIEW */}
            <div className="space-y-1.5">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                OVERVIEW
              </span>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Group: COMMERCE */}
            <div className="space-y-1.5">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                COMMERCE
              </span>
              <Link
                href="/admin/orders"
                className="flex items-center justify-between px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  <span>Orders</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition"
              >
                <Package className="w-4 h-4 text-zinc-400" />
                <span>Products</span>
              </Link>
            </div>

            {/* Group: SYSTEM */}
            <div className="space-y-1.5">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                SYSTEM
              </span>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white bg-zinc-900 font-semibold border border-zinc-800 transition"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Settings</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User & Live Store Link */}
        <div className="p-4 border-t border-zinc-900 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition border border-zinc-850"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>View Storefront</span>
            </div>
            <span className="text-[10px] text-zinc-500">↗</span>
          </Link>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">
              AR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">Ashikur Rahaman</p>
              <p className="text-[10px] text-zinc-500 truncate">Store Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 sm:px-8 flex items-center justify-between shrink-0">
          {/* Search Box */}
          <div className="flex items-center gap-2 w-72 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search settings, config or orders..."
              className="bg-transparent w-full focus:outline-none text-zinc-200 text-xs"
            />
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MongoDB Connected</span>
            </div>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-medium border border-zinc-800 transition flex items-center gap-1.5"
            >
              <span>Live Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-zinc-950 text-zinc-100">
          {children}
        </main>
      </div>
    </div>
  );
}
