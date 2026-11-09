'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  storeName: string;
  accentColor: string;
}

function NavLinks({ accentColor }: { accentColor: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collection = searchParams?.get('collection');

  const isHome = pathname === '/';
  const isHoodies = pathname === '/shop' && collection === 'hoodies';
  const isTees = pathname === '/shop' && collection === 't-shirts';
  const isArchive = pathname === '/shop' && !collection;

  return (
    <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.14em]">
      <Link
        href="/"
        style={{
          color: isHome ? accentColor : undefined,
          borderColor: isHome ? accentColor : 'transparent',
        }}
        className={`py-1 transition cursor-pointer ${
          isHome
            ? 'font-black border-b-2'
            : 'font-medium text-zinc-600 hover:text-zinc-950'
        }`}
      >
        HOME
      </Link>
      <Link
        href="/shop?collection=hoodies"
        style={{
          color: isHoodies ? accentColor : undefined,
          borderColor: isHoodies ? accentColor : 'transparent',
        }}
        className={`hidden md:inline-block py-1 transition cursor-pointer ${
          isHoodies
            ? 'font-black border-b-2'
            : 'font-medium text-zinc-600 hover:text-zinc-950'
        }`}
      >
        HOODIES
      </Link>
      <Link
        href="/shop?collection=t-shirts"
        style={{
          color: isTees ? accentColor : undefined,
          borderColor: isTees ? accentColor : 'transparent',
        }}
        className={`hidden md:inline-block py-1 transition cursor-pointer ${
          isTees
            ? 'font-black border-b-2'
            : 'font-medium text-zinc-600 hover:text-zinc-950'
        }`}
      >
        OVERSIZED TEES
      </Link>
      <Link
        href="/shop"
        style={{
          color: isArchive ? accentColor : undefined,
          borderColor: isArchive ? accentColor : 'transparent',
        }}
        className={`hidden lg:inline-block py-1 transition cursor-pointer ${
          isArchive
            ? 'font-black border-b-2'
            : 'font-medium text-zinc-600 hover:text-zinc-950'
        }`}
      >
        ARCHIVE
      </Link>
    </nav>
  );
}

export default function Navbar({ storeName, accentColor }: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const brandNameFirst = storeName.split(' ')[0] || 'Aurem';

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 grid grid-cols-3 items-center">
        {/* Left Navigation Links */}
        <Suspense
          fallback={
            <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.14em]">
              <span className="font-bold text-zinc-950">HOME</span>
              <span className="hidden md:inline-block text-zinc-600">HOODIES</span>
            </nav>
          }
        >
          <NavLinks accentColor={accentColor} />
        </Suspense>

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
