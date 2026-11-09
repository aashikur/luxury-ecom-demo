import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  ExternalLink,
  Search,
  Bell,
  Moon,
  Command,
  Plus,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'Aurem Dashboard | Management',
  description: 'Enterprise E-Commerce Management Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex antialiased font-sans">
      {/* 1. Left Fixed Enterprise Jet-Black Sidebar (Matching Reference Image 1 & 2) */}
      <aside className="w-64 border-r border-zinc-900 bg-[#09090B] text-zinc-300 flex flex-col justify-between shrink-0 hidden md:flex z-20">
        <div>
          {/* Top Brand Monogram (Clean Vector Icon + AUREM DASHBOARD) */}
          <div className="h-16 px-5 border-b border-zinc-900 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#00C885] flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-4 h-4 text-zinc-950 fill-amber-400 stroke-zinc-950 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white uppercase leading-none">
                  Aurem
                </span>
                <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase mt-1 leading-none">
                  DASHBOARD
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-6 text-xs">
            {/* Group: OVERVIEW */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                OVERVIEW
              </span>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Group: COMMERCE */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                COMMERCE
              </span>
              <Link
                href="/admin/orders"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-medium"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  <span>Orders</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  12
                </span>
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/90 text-white font-semibold border border-zinc-800 transition"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Products</span>
              </Link>
            </div>

            {/* Group: SYSTEM */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                SYSTEM
              </span>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition font-medium"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Settings</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User & Live Store Link */}
        <div className="p-3 border-t border-zinc-850 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition border border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>Live Storefront</span>
            </div>
            <span className="text-[10px] text-zinc-500">↗</span>
          </Link>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">Ashikur Rahaman</p>
              <p className="text-[10px] text-zinc-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main High-Clarity Canvas Area (Matching Apex Light Workspace) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
          {/* Global Search Box (⌘K) */}
          <div className="flex items-center gap-2 w-80 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 focus-within:border-emerald-500 focus-within:bg-white transition">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent w-full focus:outline-none text-slate-900 text-xs"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Right Header Action Icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Link>

            <button
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Toggle theme"
            >
              <Moon className="w-4 h-4" />
            </button>

            <button
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center">
              AS
            </div>
          </div>
        </header>

        {/* Main Canvas Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
