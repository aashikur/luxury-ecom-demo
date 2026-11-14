import React from 'react';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import StoreConfig from '@/models/StoreConfig';
import Product from '@/models/Product';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import ProductCard from '@/components/storefront/ProductCard';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShopPageProps {
  searchParams: Promise<{
    collection?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  await connectDB();
  const { collection, category, sort } = await searchParams;

  // 1. Fetch StoreConfig
  const config = await StoreConfig.findOne({ isActive: true }).lean();

  const branding = config?.branding || {
    storeName: 'Aurem Luxury',
    tagline: 'Engineered Streetwear & Minimal Garments',
    colors: { accent: '#B8860B' },
  };

  const logistics = config?.logistics || {
    freeShippingThreshold: 2500,
    supportPhone: '01700000000',
    showroomAddress: 'Banani 11, Dhaka, Bangladesh',
    whatsappNumber: '8801700000000',
    insideDhakaFee: 70,
    outsideDhakaFee: 130,
  };

  // 2. Build Query Filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { isActive: true };

  if (collection) {
    filter.collections = collection;
  }

  if (category) {
    const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { categorySlug: new RegExp(`^${escaped}$`, 'i') },
      { categoryPath: new RegExp(`^${escaped}$`, 'i') },
      { categoryName: new RegExp(`^${escaped}$`, 'i') },
    ];
  }

  // 3. Sorting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortOption: Record<string, any> = { isPinned: -1, priority: -1, createdAt: -1 };
  if (sort === 'price-asc') sortOption = { basePrice: 1 };
  if (sort === 'price-desc') sortOption = { basePrice: -1 };

  const rawProducts = await Product.find(filter).sort(sortOption).lean();
  const products = JSON.parse(JSON.stringify(rawProducts));

  const filterTabs = [
    { label: 'ALL PRODUCTS', href: '/shop', active: !collection && !category },
    { label: 'HEAVYWEIGHT HOODIES', href: '/shop?collection=hoodies', active: collection === 'hoodies' },
    { label: 'OVERSIZED TEES', href: '/shop?collection=t-shirts', active: collection === 't-shirts' },
    { label: 'WINTER DROP 2026', href: '/shop?collection=winter-drop-2026', active: collection === 'winter-drop-2026' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* 1. Slim Top Bar */}
      <TopBar
        tagline={branding.tagline}
        freeShippingThreshold={logistics.freeShippingThreshold}
        supportPhone={logistics.supportPhone}
      />

      {/* 2. Navbar */}
      <Navbar
        storeName={branding.storeName}
        accentColor={branding.colors?.accent || '#B8860B'}
      />

      {/* 3. Catalog Header & Filters */}
      <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-8 py-10 w-full">
        {/* Title & Product Count */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
              {collection ? collection.replace(/-/g, ' ') : category ? category.replace(/-/g, ' ') : 'STORE ARCHIVE'}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 tracking-wider uppercase">
              Showing {products.length} engineered garments
            </p>
          </div>

          {/* Price Sorting Links */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400 font-medium uppercase tracking-wider">Sort:</span>
            <Link
              href={`/shop?${collection ? `collection=${collection}&` : ''}sort=price-asc`}
              className={`hover:text-zinc-950 transition ${
                sort === 'price-asc' ? 'font-bold text-zinc-950 underline underline-offset-4' : 'text-zinc-500'
              }`}
            >
              Price: Low to High
            </Link>
            <span>•</span>
            <Link
              href={`/shop?${collection ? `collection=${collection}&` : ''}sort=price-desc`}
              className={`hover:text-zinc-950 transition ${
                sort === 'price-desc' ? 'font-bold text-zinc-950 underline underline-offset-4' : 'text-zinc-500'
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-6 no-scrollbar border-b border-zinc-200/60 mb-8">
          {filterTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap border transition ${
                tab.active
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-950'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* 4-Column Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 border border-zinc-200 p-8 my-8">
            <p className="text-sm text-zinc-500">No products found in this category.</p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {products.map((product: { _id: string; title: string; slug: string; basePrice: number; discountPrice?: number; images: { url: string; key: string }[] }) => (
              <ProductCard
                key={product._id}
                product={product}
                accentColor={branding.colors?.accent || '#B8860B'}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. Slide-Over 1-Page COD Checkout Drawer */}
      <CartDrawer
        insideDhakaFee={logistics.insideDhakaFee}
        outsideDhakaFee={logistics.outsideDhakaFee}
        freeShippingThreshold={logistics.freeShippingThreshold}
        manualBkashNumber={config?.payment?.manualBkash?.number || logistics.supportPhone}
        accentColor={branding.colors?.accent}
      />

      {/* 5. Luxury Footer */}
      <Footer
        storeName={branding.storeName}
        tagline={branding.tagline}
        showroomAddress={logistics.showroomAddress}
        supportPhone={logistics.supportPhone}
        whatsappNumber={logistics.whatsappNumber}
        accentColor={branding.colors?.accent}
      />
    </div>
  );
}
