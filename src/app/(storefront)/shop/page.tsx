import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductsList, getCatalogFacets } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import ProductCard from '@/components/storefront/ProductCard';
import CatalogFilter from '@/components/storefront/catalog/CatalogFilter';

// Incremental Static Regeneration (ISR) - 60s fallback paired with dual cache tags
export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    collection?: string;
    category?: string;
    brand?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    inStock?: string;
    stockStatus?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const {
    collection,
    category,
    brand,
    sort,
    minPrice,
    maxPrice,
    size,
    inStock,
    stockStatus,
    q,
    page,
  } = await searchParams;

  // Zero-Waterfall Concurrent Domain Service Queries
  const [config, facets, categoryTree, collections, productsResult] = await Promise.all([
    getPublicStoreConfig(),
    getCatalogFacets(),
    getCategoriesTree(),
    getActiveCollections(),
    getProductsList({
      collection,
      category,
      categorySlug: category,
      brand,
      sort,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sizes: size,
      inStock: inStock === 'true' ? true : undefined,
      stockStatus: stockStatus || undefined,
      q,
      page: page ? parseInt(page, 10) : 1,
      limit: 48,
    }),
  ]);

  const branding = config?.branding || {
    storeName: 'Aurem Luxury',
    tagline: 'Engineered Streetwear & Minimal Garments',
    colors: { accent: '#076E46' },
  };

  const products = productsResult.products || [];

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* 1. Page Header & Breadcrumbs */}
      <div className="pb-6 mb-6 border-b border-zinc-200/80">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
          <Link href="/" className="hover:text-zinc-900 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold">Catalog</span>
          {collection && (
            <>
              <span>/</span>
              <span className="text-[#076E46] font-bold">{collection.replace(/-/g, ' ')}</span>
            </>
          )}
          {category && (
            <>
              <span>/</span>
              <span className="text-[#076E46] font-bold">{category.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
          {collection
            ? collection.replace(/-/g, ' ')
            : category
            ? category.replace(/-/g, ' ')
            : brand
            ? brand.replace(/-/g, ' ')
            : 'All Garments'}
        </h1>
      </div>

      {/* 2. Universal Catalog Filter with Responsive Sidebar & Grid */}
      <CatalogFilter
        categories={categoryTree}
        collections={collections}
        facets={facets}
        totalResults={productsResult.pagination.total}
        accentColor={branding.colors?.accent || '#076E46'}
      >
        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-lg p-8 my-4">
            <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              No garments found
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No garments match your active filters. Try resetting the price slider or clearing selected sizes.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-5 py-2.5 bg-zinc-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition active:scale-[0.98] duration-75"
            >
              Reset All Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product, idx) => (
              <ProductCard
                key={String(product._id)}
                product={product}
                index={idx}
                accentColor={branding.colors?.accent || '#076E46'}
                showAddToCart={config?.features?.showCardAddToCart}
              />
            ))}
          </div>
        )}
      </CatalogFilter>
    </main>
  );
}
