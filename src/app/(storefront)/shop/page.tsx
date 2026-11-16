import React from 'react';
import Link from 'next/link';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductsList } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import ProductCard from '@/components/storefront/ProductCard';

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

  const products = productsResult.products || [];

  // Filter navigation tabs
  const filterTabs = [
    { label: 'ALL PRODUCTS', href: '/shop', active: !collection && !category && !brand },
    ...collections.map((col) => ({
      label: col.title.toUpperCase(),
      href: `/shop?collection=${col.slug}`,
      active: collection === col.slug,
    })),
    ...categoryTree.map((cat) => ({
      label: cat.name.toUpperCase(),
      href: `/shop?category=${cat.slug}`,
      active: category === cat.slug,
    })),
  ];

  // Sorting query builder
  const getSortUrl = (sortType: string) => {
    const params = new URLSearchParams();
    if (collection) params.set('collection', collection);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    params.set('sort', sortType);
    return `/shop?${params.toString()}`;
  };

  return (
    <main className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 w-full">
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
            className={`hover:text-zinc-950 transition active:scale-[0.98] duration-75 ${
              sort === 'price-asc' ? 'font-bold text-zinc-950 underline underline-offset-4' : 'text-zinc-500'
            }`}
          >
            Price: Low to High
          </Link>
          <span>•</span>
          <Link
            href={getSortUrl('price-desc')}
            className={`hover:text-zinc-950 transition active:scale-[0.98] duration-75 ${
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
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap border transition active:scale-[0.98] duration-75 ${
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
            className="inline-block mt-4 px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] duration-75"
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
  );
}
