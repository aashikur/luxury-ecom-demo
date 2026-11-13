import React from 'react';
import { Menu, ShoppingBag, User } from 'lucide-react';

export default function ShopLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* 1. Exact TopBar */}
      <div className="bg-zinc-950 text-zinc-300 text-[11px] tracking-wider border-b border-zinc-900 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-9 flex items-center justify-between gap-4">
          <div className="flex-1 overflow-hidden min-w-0">
            {React.createElement(
              'marquee',
              {
                className: 'font-normal tracking-[0.18em] uppercase text-amber-400 text-[11px]',
                scrollamount: 6,
              },
              'NOTICE: SITE IS CURRENTLY UNDER DEVELOPMENT • DEMO & TESTING ACTIVE'
            )}
          </div>
          <div className="hidden sm:flex items-center gap-5 text-zinc-400 shrink-0">
            <span>
              Free Shipping Over <strong className="text-white">৳2,500</strong>
            </span>
            <span>•</span>
            <span>Hotline: 01580663853</span>
          </div>
        </div>
      </div>

      {/* 2. Exact Navbar Shell */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 grid grid-cols-3 items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-2 p-1.5 -ml-1 text-zinc-950">
              <Menu className="w-5 h-5 text-zinc-950" />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">MENU</span>
            </div>
            <div className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-[0.14em] text-zinc-600 font-medium">
              <span className="py-1">HOME</span>
              <span className="py-1">HOODIES</span>
              <span className="py-1">OVERSIZED TEES</span>
              <span className="text-[#B8860B] font-bold border-b-2 border-[#B8860B] py-1">ARCHIVE</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2.5">
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-[0.22em] uppercase text-[#B8860B]">
                AUREM
              </span>
              <span className="h-5 w-px bg-zinc-300 hidden sm:inline-block" />
              <span className="hidden sm:inline-block text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-medium">
                LUXURY
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 sm:gap-5">
            <div className="p-2 text-zinc-700">
              <User className="w-5 h-5" />
            </div>
            <div className="inline-flex items-center gap-2 p-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <span className="w-5 h-5 rounded-full text-[11px] font-bold text-white bg-[#B8860B] flex items-center justify-center">
                0
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Catalog Header & Filters Skeleton */}
      <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-8 py-10 w-full animate-pulse">
        {/* Title & Product Count Skeleton */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 pb-6 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-zinc-200 rounded" />
            <div className="h-3 w-40 bg-zinc-100 rounded" />
          </div>
          <div className="h-4 w-28 bg-zinc-100 rounded" />
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="flex items-center gap-3 overflow-x-auto py-5 border-b border-zinc-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-32 bg-zinc-100 rounded shrink-0" />
          ))}
        </div>

        {/* 4-Column Product Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <div className="aspect-3/4 w-full bg-zinc-100 rounded-sm" />
              <div className="space-y-2 pt-1">
                <div className="h-3 w-20 bg-zinc-100 rounded" />
                <div className="h-4 w-4/5 bg-zinc-200 rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-zinc-200 rounded" />
                  <div className="h-3 w-12 bg-zinc-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}