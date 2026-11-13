import React from 'react';
import { Menu, ShoppingBag, User } from 'lucide-react';

export default function ProductLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* 1. Slim Announcement TopBar Shell */}
      <div className="bg-zinc-950 text-zinc-300 text-[11px] tracking-wider border-b border-zinc-900 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-9 flex items-center justify-between gap-4">
          <div className="h-3 w-48 bg-zinc-800 rounded animate-pulse" />
          <div className="hidden sm:flex items-center gap-5 text-zinc-400">
            <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. Navbar Shell */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 grid grid-cols-3 items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-2 p-1.5 -ml-1 text-zinc-950">
              <Menu className="w-5 h-5 text-zinc-950" />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">MENU</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-[0.22em] uppercase text-[#B8860B]">
              AUREM
            </span>
          </div>
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            <div className="p-2 text-zinc-700">
              <User className="w-5 h-5" />
            </div>
            <div className="inline-flex items-center gap-2 p-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
            </div>
          </div>
        </div>
      </header>

      {/* 3. PDP Main Shell (2-Column Gallery + Details Skeleton) */}
      <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-zinc-100 rounded mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-3/4 w-full bg-zinc-100 rounded-sm" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-zinc-100 rounded-sm" />
              ))}
            </div>
          </div>

          {/* Right Column: Buy Box & Options */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category Eyebrow */}
            <div className="h-3 w-28 bg-zinc-200 rounded" />
            {/* Title */}
            <div className="h-8 w-4/5 bg-zinc-200 rounded" />
            {/* Price Row */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-7 w-24 bg-zinc-200 rounded" />
              <div className="h-5 w-16 bg-zinc-100 rounded" />
            </div>

            <div className="h-px bg-zinc-100 my-6" />

            {/* Size Options Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="h-11 w-14 bg-zinc-100 rounded border border-zinc-200" />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <div className="h-13 w-full bg-zinc-900 rounded-sm" />
              <div className="h-13 w-full bg-zinc-100 rounded-sm border border-zinc-200" />
            </div>

            {/* Delivery & Assurance Details */}
            <div className="pt-6 border-t border-zinc-100 space-y-3">
              <div className="h-4 w-3/4 bg-zinc-100 rounded" />
              <div className="h-4 w-1/2 bg-zinc-100 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
