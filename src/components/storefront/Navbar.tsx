'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  storeName: string;
  accentColor: string;
}

export default function Navbar({ storeName, accentColor }: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const brandNameFirst = storeName.split(' ')[0] || 'VectroFit';

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 grid grid-cols-3 items-center">
        {/* Left Navigation Links */}
        <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/" className="hover:opacity-70 transition text-zinc-900">
            HOME
          </Link>
          <Link
            href="/shop?collection=hoodies"
            className="hidden md:inline-block hover:opacity-70 transition text-zinc-600 hover:text-zinc-950"
          >
            HOODIES
          </Link>
          <Link
            href="/shop?collection=t-shirts"
            className="hidden md:inline-block hover:opacity-70 transition text-zinc-600 hover:text-zinc-950"
          >
            OVERSIZED TEES
          </Link>
          <Link
            href="/shop"
            className="hidden lg:inline-block hover:opacity-70 transition text-zinc-600 hover:text-zinc-950"
          >
            ALL PRODUCTS
          </Link>
        </nav>

        {/* Centered Luxury Brand Monogram */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 group">
            <span
              style={{ color: accentColor || '#B8860B' }}
              className="text-xl sm:text-2xl font-serif font-bold tracking-[0.22em] uppercase"
            >
              {brandNameFirst}
            </span>
            <span className="h-5 w-px bg-zinc-300 hidden sm:inline-block" />
            <span className="hidden sm:inline-block text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-medium">
              LUXURY
            </span>
          </Link>
        </div>

        {/* Right Shopping Bag Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 p-2 hover:opacity-75 transition cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5 text-zinc-900" />
            <span
              style={{ backgroundColor: accentColor || '#B8860B' }}
              className="w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
            >
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
