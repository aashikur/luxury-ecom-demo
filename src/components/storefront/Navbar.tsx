'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Truck,
  Search,
  Loader2,
} from 'lucide-react';
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
  parentSlug?: string | null;
  badgeText?: string;
}

export interface HeaderNavLinkItem {
  id: string;
  label: string;
  href: string;
  badgeText?: string;
  isActive?: boolean;
  order?: number;
  children?: HeaderNavLinkItem[];
}

interface NavbarProps {
  storeName: string;
  accentColor?: string;
  categories?: CategoryItem[];
  collections?: CollectionNavItem[];
  navLinks?: HeaderNavLinkItem[];
}

function DesktopMegaMenu({
  accentColor,
  navLinks,
}: {
  accentColor: string;
  navLinks?: HeaderNavLinkItem[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdownId(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 150);
  };

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/shop')) {
      const currentCollection = searchParams?.get('collection');
      const currentCategory = searchParams?.get('category');
      const currentBrand = searchParams?.get('brand');
      if (href === '/shop') {
        return pathname === '/shop' && !currentCollection && !currentCategory && !currentBrand;
      }
      return pathname.startsWith(href);
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
    <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase tracking-[0.16em] relative">
      {linksToRender.map((item) => {
        const active = isLinkActive(item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isDropdownOpen = openDropdownId === item.id;

        return (
          <div
            key={item.id || item.href}
            className="relative"
            onMouseEnter={() => hasChildren && handleMouseEnter(item.id)}
            onMouseLeave={() => hasChildren && handleMouseLeave()}
          >
            <Link
              href={item.href}
              style={{
                color: active ? accentColor : undefined,
                borderColor: active ? accentColor : 'transparent',
              }}
              className={`py-6.5 transition active:scale-[0.98] duration-75 cursor-pointer inline-flex items-center gap-1.5 ${
                active
                  ? 'font-bold border-b-2 text-zinc-950'
                  : 'font-medium text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <span>{item.label}</span>
              {hasChildren && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 ${
                    isDropdownOpen ? 'rotate-180 text-zinc-950' : ''
                  }`}
                />
              )}
              {item.badgeText && (
                <span
                  style={{ backgroundColor: accentColor }}
                  className="px-1.5 py-0.5 text-[8px] font-bold text-white rounded-full uppercase -ml-0.5"
                >
                  {item.badgeText}
                </span>
              )}
            </Link>

            {/* Mega-Menu Dropdown Panel */}
            {hasChildren && isDropdownOpen && (
              <div
                className="absolute top-full left-0 w-64 bg-white/98 backdrop-blur-md border border-zinc-200/90 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase border-b border-zinc-100 mb-1">
                  {item.label} Curation
                </div>
                {item.children!.map((sub) => (
                  <Link
                    key={sub.id || sub.href}
                    href={sub.href}
                    onClick={() => setOpenDropdownId(null)}
                    className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition active:scale-[0.98] duration-75"
                  >
                    <span>{sub.label}</span>
                    {sub.badgeText && (
                      <span
                        style={{ backgroundColor: accentColor }}
                        className="px-1.5 py-0.2 text-[8px] font-bold text-white rounded-full uppercase"
                      >
                        {sub.badgeText}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function Navbar({
  storeName,
  accentColor = '#B8860B',
  categories = [],
  collections = [],
  navLinks = [],
}: NavbarProps) {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const brandNameFirst = storeName.split(' ')[0] || 'Aurem';

  // Navigation states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mobile Accordion state for Drawer
  const [expandedNavId, setExpandedNavId] = useState<string | null>(null);

  // Close drawer & search on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer or search modal is open
  useEffect(() => {
    if (isDrawerOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, isSearchOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsSearchOpen(false);
        setIsTrackModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSearchResults(data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedNavId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* =========================================================
              DESKTOP SYMMETRY: [ Logo ─── Navlinks ─── Search·Track·Profile·Cart ]
              MOBILE SYMMETRY:  [ Menu ─── Logo ─────── Search·Profile·Cart ]
             ========================================================= */}

          {/* 1. Mobile Left: Hamburger Menu Icon */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 text-zinc-900 hover:text-zinc-600 transition active:scale-[0.98] duration-75 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-zinc-950" />
            </button>
          </div>

          {/* 2. Brand Monogram Logo (Left on Desktop, Center on Mobile) */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group transition active:scale-[0.98] duration-75"
            >
              <span
                style={{ color: accentColor }}
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

          {/* 3. Desktop Center: Mega-Menu Navlinks */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <Suspense fallback={null}>
              <DesktopMegaMenu accentColor={accentColor} navLinks={navLinks} />
            </Suspense>
          </div>

          {/* 4. Right Utility Actions: Search · Track · Profile · Cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
            {/* Search Icon Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition active:scale-[0.98] duration-75 cursor-pointer"
              title="Search Catalog"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop 1-Click Track Order Action */}
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded text-xs font-semibold uppercase tracking-wider transition active:scale-[0.98] duration-75 cursor-pointer"
              title="Track Order Status"
              aria-label="Track Order Status"
            >
              <Truck className="w-4 h-4 text-zinc-600" />
              <span>Track Order</span>
            </button>

            {/* Profile / Admin Icon */}
            <Link
              href="/admin"
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition active:scale-[0.98] duration-75 cursor-pointer"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 p-2 hover:opacity-75 transition active:scale-[0.98] duration-75 cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <span
                style={{ backgroundColor: accentColor }}
                className="w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center shadow-2xs"
              >
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          QUICK SEARCH MODAL (Instant Sub-100ms Live Results)
         ========================================================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search abayas, pret, khaddar, gift sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none font-medium"
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Container */}
            <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 p-2">
              {searchResults.length > 0 ? (
                searchResults.map((prod) => {
                  const thumb = prod.media?.[0]?.url || prod.images?.[0]?.url || '/placeholder.webp';
                  return (
                    <Link
                      key={prod._id}
                      href={`/products/${prod.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3.5 p-2.5 rounded-lg hover:bg-zinc-50 transition active:scale-[0.98] duration-75 group"
                    >
                      <div className="relative w-11 h-14 rounded overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        <Image src={thumb} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 truncate group-hover:text-emerald-800 transition">
                          {prod.title}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {prod.categoryName} •{' '}
                          <span className="font-bold text-zinc-900">৳{prod.basePrice?.toLocaleString()}</span>
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition" />
                    </Link>
                  );
                })
              ) : searchQuery.trim() ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  No luxury garments found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Type to explore the Aurem modest collection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MOBILE SLIDE-OVER DRAWER WITH ACCORDION SUB-COLLECTIONS
         ========================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300">
            {/* Drawer Header */}
            <div className="h-20 px-6 border-b border-zinc-200 flex items-center justify-between">
              <span
                style={{ color: accentColor }}
                className="text-lg font-serif font-bold tracking-[0.2em] uppercase"
              >
                {brandNameFirst}
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition active:scale-[0.98] duration-75 cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navlinks & Sub-Collections Accordion */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
              <Link
                href="/"
                onClick={() => setIsDrawerOpen(false)}
                className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2.5 border-b border-zinc-100 transition active:scale-[0.98] duration-75"
              >
                HOME
              </Link>

              <Link
                href="/shop"
                onClick={() => setIsDrawerOpen(false)}
                className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2.5 border-b border-zinc-100 transition active:scale-[0.98] duration-75"
              >
                ALL GARMENTS (CATALOG)
              </Link>

              {/* Nested Navlinks */}
              {navLinks.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedNavId === item.id;

                if (!hasChildren) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-2.5 border-b border-zinc-100 transition active:scale-[0.98] duration-75"
                    >
                      <span>{item.label}</span>
                      {item.badgeText && (
                        <span
                          style={{ backgroundColor: accentColor }}
                          className="px-2 py-0.5 text-[9px] font-bold text-white rounded-full uppercase"
                        >
                          {item.badgeText}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <div key={item.id} className="border-b border-zinc-100 pb-1">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center justify-between py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 transition active:scale-[0.98] duration-75 cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="pl-3 pb-2 space-y-1.5 animate-in fade-in duration-150">
                        {item.children!.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-zinc-950 py-1.5 transition active:scale-[0.98] duration-75"
                          >
                            <span>{sub.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 1-Click Track Order */}
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsTrackModalOpen(true);
                }}
                className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 py-3 border-b border-zinc-100 transition active:scale-[0.98] duration-75 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-zinc-700" />
                  TRACK ORDER
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </button>

              {/* Admin Portal Shortcut */}
              <div className="pt-3">
                <Link
                  href="/admin"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 p-3 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition active:scale-[0.98] duration-75"
                >
                  <span>ADMIN MANAGEMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
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
