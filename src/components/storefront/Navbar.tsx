'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShoppingBag, Menu, X, User, ChevronDown, ChevronRight, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import TrackOrderModal from './TrackOrderModal';

export interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  subcategories?: { title: string; slug: string }[];
}

export interface CollectionNavItem {
  _id?: string;
  title: string;
  slug: string;
  badgeText?: string;
}

export interface HeaderNavLinkItem {
  id: string;
  label: string;
  href: string;
  badgeText?: string;
  isActive?: boolean;
  order?: number;
}

interface NavbarProps {
  storeName: string;
  accentColor: string;
  categories?: CategoryItem[];
  collections?: CollectionNavItem[];
  navLinks?: HeaderNavLinkItem[];
}

function NavLinks({
  accentColor,
  navLinks,
}: {
  accentColor: string;
  navLinks?: HeaderNavLinkItem[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active link helper
  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href.startsWith('/shop')) {
      const hrefUrl = new URL(href, 'http://localhost');
      const hrefCollection = hrefUrl.searchParams.get('collection');
      const hrefCategory = hrefUrl.searchParams.get('category');
      const hrefBrand = hrefUrl.searchParams.get('brand');
      const currentCollection = searchParams?.get('collection');
      const currentCategory = searchParams?.get('category');
      const currentBrand = searchParams?.get('brand');

      if (hrefCollection) return currentCollection === hrefCollection;
      if (hrefCategory) return currentCategory === hrefCategory;
      if (hrefBrand) return currentBrand === hrefBrand;
      if (!hrefCollection && !hrefCategory && !hrefBrand) return pathname === '/shop' && !currentCollection && !currentCategory && !currentBrand;
    }
    return pathname.startsWith(href);
  };

  const linksToRender =
    navLinks && navLinks.length > 0
      ? navLinks
      : [
          { id: 'nav-home', label: 'HOME', href: '/' },
          { id: 'nav-shop', label: 'CATALOG', href: '/shop' },
        ];

  return (
    <div className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-[0.14em]">
      {linksToRender.map((item) => {
        const active = isLinkActive(item.href);

        return (
          <Link
            key={item.id || item.href}
            href={item.href}
            style={{
              color: active ? accentColor : undefined,
              borderColor: active ? accentColor : 'transparent',
            }}
            className={`py-1 transition cursor-pointer flex items-center gap-1.5 ${
              active
                ? 'font-bold border-b-2'
                : 'font-medium text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <span>{item.label}</span>
            {item.badgeText && (
              <span
                style={{ backgroundColor: accentColor }}
                className="px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full uppercase"
              >
                {item.badgeText}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function Navbar({
  storeName,
  accentColor,
  categories = [],
  collections = [],
  navLinks = [],
}: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const brandNameFirst = storeName.split(' ')[0] || 'Aurem';

  // Mobile / Slide-Over Menu Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'MENU'>('CATEGORIES');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Initialize first category expanded if categories exist
  useEffect(() => {
    if (categories.length > 0 && Object.keys(expandedCategories).length === 0) {
      setExpandedCategories({ [categories[0].id]: true });
    }
  }, [categories, expandedCategories]);

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
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsTrackModalOpen(false);
      }
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
              <NavLinks accentColor={accentColor} navLinks={navLinks} />
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

          {/* Right: Track Order, Profile Icon & Shopping Bag */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {/* Quick Track Order Action */}
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded text-xs font-medium uppercase tracking-wider transition cursor-pointer"
              title="Track Order Status"
              aria-label="Track Order Status"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden md:inline">Track Order</span>
            </button>

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

      {/* Slide-Over Drawer */}
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
                COLLECTIONS
              </button>
            </div>

            {/* Content Area (Scrollable Accordion & Links) */}
            <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-zinc-100">
              {activeTab === 'CATEGORIES' ? (
                /* Dynamic Categories Accordion */
                <div className="space-y-4">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const isOpen = !!expandedCategories[cat.id];
                      const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                      return (
                        <div key={cat.id} className="border-b border-zinc-100 pb-3">
                          <button
                            onClick={() => toggleCategory(cat.id)}
                            className="w-full flex items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 transition cursor-pointer"
                          >
                            <span>{cat.title}</span>
                            {hasSubs && (
                              isOpen ? (
                                <ChevronDown className="w-4 h-4 text-zinc-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                              )
                            )}
                          </button>

                          {/* Collapsible Subcategories */}
                          {hasSubs && isOpen && (
                            <div className="pl-3 pt-2 pb-1 space-y-2">
                              {cat.subcategories!.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={`/shop?category=${sub.slug}`}
                                  onClick={() => setIsDrawerOpen(false)}
                                  className="flex items-center justify-between text-[14px] font-normal text-zinc-600 hover:text-zinc-950 py-1.5 transition cursor-pointer group"
                                >
                                  <span>{sub.title}</span>
                                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-zinc-400 uppercase tracking-widest">
                      Catalog Loading...
                    </div>
                  )}

                  {/* Quick Shortcut to Full Catalog */}
                  <div className="pt-4">
                    <Link
                      href="/shop"
                      onClick={() => setIsDrawerOpen(false)}
                      className="inline-flex items-center justify-center w-full py-3 px-4 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-800 transition rounded-sm cursor-pointer"
                    >
                      BROWSE ALL PRODUCTS
                    </Link>
                  </div>
                </div>
              ) : (
                /* Dynamic Marketing Collections & Main Navigation */
                <div className="space-y-3 pt-1">
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    HOME
                  </Link>

                  <Link
                    href="/shop"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition"
                  >
                    ALL PRODUCTS (CATALOG)
                  </Link>

                  {/* Dynamic Database Collections */}
                  {collections.map((col) => (
                    <Link
                      key={col.slug}
                      href={`/shop?collection=${col.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition group"
                    >
                      <span>{col.title}</span>
                      {col.badgeText && (
                        <span
                          style={{ backgroundColor: accentColor }}
                          className="px-2 py-0.5 text-[9px] font-bold text-white rounded-full uppercase"
                        >
                          {col.badgeText}
                        </span>
                      )}
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsTrackModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2 border-b border-zinc-100 transition text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-zinc-600" />
                      TRACK ORDER
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </button>

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

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        accentColor={accentColor}
      />
    </>
  );
}
