import React from 'react';
import Link from 'next/link';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductsList } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import ProductCard from '@/components/storefront/ProductCard';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

// Incremental Static Regeneration (ISR) - 60s fallback window paired with dual revalidation (Rule #7)
export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    collection?: string;
    category?: string;
    brand?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { collection, category, brand, sort } = await searchParams;

  // Zero-Waterfall Concurrent Domain Service Queries
  const [config, productsResult, categoryTree, collections] = await Promise.all([
    getPublicStoreConfig(),
    getProductsList({
      collection,
      category,
      categorySlug: category,
      brand,
      sort,
      limit: 50,
    }),
    getCategoriesTree(),
    getActiveCollections(),
  ]);

  const branding = config?.branding || {
    storeName: 'Aurem Luxury',
    tagline: 'Engineered Streetwear & Minimal Garments',
    colors: { accent: '#B8860B' },
  };

  const logistics = {
    freeShippingThreshold: config?.logistics?.freeShippingThreshold ?? 2500,
    supportPhone: config?.logistics?.supportPhone || '01700000000',
    showroomAddress: config?.logistics?.showroomAddress || 'Banani 11, Dhaka, Bangladesh',
    whatsappNumber: config?.logistics?.whatsappNumber || '8801700000000',
    insideDhakaFee: config?.logistics?.insideDhakaFee ?? 70,
    dhakaSuburbsFee: config?.logistics?.suburbsDhakaFee ?? 100,
    outsideDhakaFee: config?.logistics?.outsideDhakaFee ?? 130,
  };

  // Map category tree to Navbar category item structure
  const navCategories = categoryTree.map((cat) => ({
    id: cat._id,
    title: cat.name,
    slug: cat.slug,
    subcategories: cat.children?.map((child) => ({
      title: child.name,
      slug: child.slug,
    })) || [],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = productsResult.products.map((p: any) => ({
    ...p,
    _id: String(p._id),
  }));

  // Dynamic filter tabs derived from active database collections & categories
  const filterTabs = [
    { label: 'ALL PRODUCTS', href: '/shop', active: !collection && !category && !brand },
    ...collections.map((col) => ({
      label: col.title.toUpperCase(),
      href: `/shop?collection=${col.slug}`,
      active: collection === col.slug,
    })),
  ];

  const getSortUrl = (sortType: string) => {
    const params = new URLSearchParams();
    if (collection) params.set('collection', collection);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    params.set('sort', sortType);
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* 1. Slim Top Bar */}
      <TopBar
        tagline={branding.tagline}
        freeShippingThreshold={logistics.freeShippingThreshold}
        supportPhone={logistics.supportPhone}
      />

      {/* 2. Dynamic Navbar */}
      <Navbar
        storeName={branding.storeName}
        accentColor={branding.colors?.accent || '#B8860B'}
        categories={navCategories}
        collections={collections}
        navLinks={config?.headerNavLinks}
      />

      {/* 3. Catalog Header & Filters */}
      <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-8 py-10 w-full">
        {/* Title & Product Count */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
              {collection
                ? collection.replace(/-/g, ' ')
                : category
                ? category.replace(/-/g, ' ')
                : brand
                ? brand.replace(/-/g, ' ')
                : 'STORE ARCHIVE'}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 tracking-wider uppercase">
              Showing {products.length} engineered garments
            </p>
          </div>

          {/* Price Sorting Links */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400 font-medium uppercase tracking-wider">Sort:</span>
            <Link
              href={getSortUrl('price-asc')}
              className={`hover:text-zinc-950 transition ${
                sort === 'price-asc' ? 'font-bold text-zinc-950 underline underline-offset-4' : 'text-zinc-500'
              }`}
            >
              Price: Low to High
            </Link>
            <span>•</span>
            <Link
              href={getSortUrl('price-desc')}
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
            {products.map((product) => (
              <ProductCard
                key={String(product._id)}
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
        dhakaSuburbsFee={logistics.dhakaSuburbsFee}
        outsideDhakaFee={logistics.outsideDhakaFee}
        freeShippingThreshold={logistics.freeShippingThreshold}
        manualBkashNumber={config?.payment?.manualBkash?.walletNumber || logistics.supportPhone}
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
