'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShoppingBag, Menu, X, User, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  storeName: string;
  accentColor: string;
}

// Static Demo Categories for the Shopify-Style Accordion
interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  subcategories: { title: string; slug: string }[];
}

const DEMO_CATEGORIES: CategoryItem[] = [
  {
    id: 'men',
    title: 'Men',
    slug: 'men',
    subcategories: [
      { title: 'All Men Garments', slug: 'men' },
      { title: 'Tops & Tees', slug: 'men-tops' },
      { title: 'Bottoms & Trousers', slug: 'men-bottoms' },
      { title: 'Hoodies & Fleece', slug: 'hoodies' },
    ],
  },
  {
    id: 'women',
    title: 'Women',
    slug: 'women',
    subcategories: [
      { title: 'All Women Collection', slug: 'women' },
      { title: 'Hijab & Modest Wear', slug: 'hijab' },
      { title: 'Tops & Co-ords', slug: 'women-tops' },
      { title: 'Modest Wear', slug: 'women-modest-wear' },
    ],
  },
  {
    id: 'unisex',
    title: 'Unisex',
    slug: 'unisex',
    subcategories: [
      { title: 'All Unisex Drops', slug: 'unisex' },
      { title: 'Oversized Tees', slug: 't-shirts' },
      { title: 'Heavyweight Fleece', slug: 'hoodies' },
    ],
  },
];

function NavLinks({ accentColor }: { accentColor: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collection = searchParams?.get('collection');

  const isHome = pathname === '/';
  const isHoodies = pathname === '/shop' && collection === 'hoodies';
  const isTees = pathname === '/shop' && collection === 't-shirts';
  const isArchive = pathname === '/shop' && !collection && !searchParams?.get('category');

  return (
    <div className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-[0.14em]">
      <Link
        href="/"
        style={{
          color: isHome ? accentColor : undefined,
          borderColor: isHome ? accentColor : 'transparent',
        }}
        className={`py-1 transition cursor-pointer ${
          isHome
            ? 'font-bold border-b-2'
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
        className={`py-1 transition cursor-pointer ${
          isHoodies
            ? 'font-bold border-b-2'
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
        className={`py-1 transition cursor-pointer ${
          isTees
            ? 'font-bold border-b-2'
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
        className={`py-1 transition cursor-pointer ${
          isArchive
            ? 'font-bold border-b-2'
            : 'font-medium text-zinc-600 hover:text-zinc-950'
        }`}
      >
        ARCHIVE
      </Link>
    </div>
  );
}

export default function Navbar({ storeName, accentColor }: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const brandNameFirst = storeName.split(' ')[0] || 'Aurem';

  // Mobile / Slide-Over Menu Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'MENU'>('CATEGORIES');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    men: true, // Default open first category for nice UX
  });

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 grid grid-cols-3 items-center">
          {/* Left: Menu Button & Responsive Desktop Collection Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 p-1.5 -ml-1 text-zinc-900 hover:text-zinc-600 transition cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-zinc-950" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-950">
                MENU
              </span>
            </button>

            <Suspense fallback={null}>
              <NavLinks accentColor={accentColor} />
            </Suspense>
          </div>

          {/* Center: Luxury Brand Monogram */}
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

          {/* Right: Profile Icon (Admin Link) & Shopping Bag */}
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            {/* Profile Icon -> Links directly to Admin */}
            <Link
              href="/admin"
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition cursor-pointer"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Button */}
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

      {/* Shopify-Style Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300">
            {/* Header: Brand & Close Button */}
            <div className="h-20 px-6 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  style={{ color: accentColor || '#B8860B' }}
                  className="text-lg font-serif font-bold tracking-[0.2em] uppercase"
                >
                  {brandNameFirst}
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">
                  EXPLORE
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Tabs: CATEGORIES | MENU */}
            <div className="grid grid-cols-2 border-b border-zinc-200 text-xs font-bold tracking-[0.16em] uppercase">
              <button
                onClick={() => setActiveTab('CATEGORIES')}
                className={`py-3.5 transition cursor-pointer border-b-2 text-center ${
                  activeTab === 'CATEGORIES'
                    ? 'text-zinc-950 border-zinc-950 bg-zinc-50/50'
                    : 'text-zinc-400 border-transparent hover:text-zinc-700'
                }`}
              >
                CATEGORIES
              </button>
              <button
                onClick={() => setActiveTab('MENU')}
                className={`py-3.5 transition cursor-pointer border-b-2 text-center ${
                  activeTab === 'MENU'
                    ? 'text-zinc-950 border-zinc-950 bg-zinc-50/50'
                    : 'text-zinc-400 border-transparent hover:text-zinc-700'
                }`}
              >
                MENU
              </button>
            </div>

            {/* Content Area (Scrollable Accordion & Links) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-zinc-100">
              {activeTab === 'CATEGORIES' ? (
                /* Categories Accordion */
                <div className="space-y-4">
                  {DEMO_CATEGORIES.map((cat) => {
                    const isOpen = !!expandedCategories[cat.id];
                    return (
                      <div key={cat.id} className="border-b border-zinc-100 pb-3">
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="w-full flex items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 transition cursor-pointer"
                        >
                          <span>{cat.title}</span>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                          )}
                        </button>

                        {/* Collapsible Subcategories */}
                        {isOpen && (
                          <div className="pl-3 pt-2 pb-1 space-y-2">
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub.slug}
                                href={`/shop?category=${sub.slug}`}
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex items-center justify-between text-[16px] font-light text-zinc-600 hover:text-zinc-950 py-1.5 transition cursor-pointer group"
                              >
                                <span>{sub.title}</span>
                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Quick Shortcut to Full Catalog */}
                  <div className="pt-4">
                    <Link
                      href="/shop"
                      onClick={() => setIsDrawerOpen(false)}
                      className="inline-flex items-center justify-center w-full py-3 px-4 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-800 transition rounded-sm cursor-pointer"
                    >
                      BROWSE ALL CATEGORIES
                    </Link>
                  </div>
                </div>
              ) : (
                /* Menu Tab */
                <div className="space-y-3 pt-1">
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    HOME
                  </Link>
                  <Link
                    href="/shop?collection=winter-drop-2026"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    WINTER DROP 2026
                  </Link>
                  <Link
                    href="/shop?collection=hoodies"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    HEAVYWEIGHT HOODIES
                  </Link>
                  <Link
                    href="/shop?collection=t-shirts"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    OVERSIZED TEES
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    ALL PRODUCTS (ARCHIVE)
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/70 p-3 rounded border border-emerald-200 hover:bg-emerald-100/70 transition"
                  >
                    <span>ADMIN MANAGEMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-700 uppercase tracking-wider">
                {storeName} SHOWROOM
              </p>
              <p>Banani 11, Dhaka, Bangladesh</p>
              <p className="pt-1 text-zinc-400">Toll-Free Express Dispatch</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}