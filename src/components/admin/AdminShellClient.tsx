'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  ExternalLink,
  Search,
  Bell,
  Moon,
  Palette,
  Plus,
  Zap,
  LogOut,
} from 'lucide-react';

export default function AdminShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    {
      group: 'OVERVIEW',
      items: [
        {
          href: '/admin',
          label: 'Dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      group: 'COMMERCE',
      items: [
        {
          href: '/admin/orders',
          label: 'Orders',
          icon: ShoppingBag,
          badge: '12',
          exact: false,
        },
        {
          href: '/admin/products',
          label: 'Products',
          icon: Package,
          exact: false,
        },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        {
          href: '/admin/settings',
          label: 'Settings',
          icon: Settings,
          exact: false,
        },
      ],
    },
  ];

  const renderNav = (onItemClick?: () => void) => (
    <nav className="p-3 space-y-6 text-xs flex-1 overflow-y-auto">
      {navLinks.map((group) => (
        <div key={group.group} className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {group.group}
          </span>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-zinc-900 text-emerald-400 font-semibold border border-zinc-800 shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const brandHeader = (showCloseButton?: boolean) => (
    <div className="h-16 px-5 border-b border-zinc-900 flex items-center justify-between shrink-0">
      <Link
        href="/admin"
        onClick={() => setIsMobileMenuOpen(false)}
        className="flex items-center gap-3 group"
      >
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

      {showCloseButton && (
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  const bottomFooter = (onItemClick?: () => void) => (
    <div className="p-3 border-t border-zinc-900 space-y-2 shrink-0">
      <Link
        href="/"
        target="_blank"
        onClick={onItemClick}
        className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs transition border border-zinc-800"
      >
        <div className="flex items-center gap-2">
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          <span>Live Storefront</span>
        </div>
        <span className="text-[10px] text-zinc-500">↗</span>
      </Link>

      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
            AS
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">Ashikur Rahaman</p>
            <p className="text-[10px] text-zinc-500 truncate">Super Admin</p>
          </div>
        </div>

        <button
          type="button"
          title="Sign out"
          className="p-1.5 text-zinc-500 hover:text-zinc-300 transition rounded"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex antialiased font-sans">
      {/* 1. Desktop Fixed Enterprise Jet-Black Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-[#09090B] text-zinc-300 flex flex-col justify-between shrink-0 hidden md:flex z-20">
        <div>
          {brandHeader(false)}
          {renderNav()}
        </div>
        {bottomFooter()}
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over menu panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#09090B] text-zinc-300 shadow-2xl flex flex-col justify-between z-50 animate-slide-right">
            <div>
              {brandHeader(true)}
              {renderNav(() => setIsMobileMenuOpen(false))}
            </div>
            {bottomFooter(() => setIsMobileMenuOpen(false))}
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button (Matching Reference Image 1) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition md:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Global Search Box (⌘K) */}
            <div className="hidden sm:flex items-center gap-2 w-72 md:w-80 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 focus-within:border-emerald-500 focus-within:bg-white transition">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent w-full focus:outline-none text-slate-900 text-xs"
              />
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Header Action Icons (Matching Reference Image 1) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/orders/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Link>

            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Toggle theme"
            >
              <Moon className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Customize palette"
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
              AS
            </div>
          </div>
        </header>

        {/* Main Canvas Container (Full Width) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
