import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { getPublicStoreConfig } from '@/services/config.service';
import {
  getCollectionBySlug,
  getChildCollections,
  getSiblingCollections,
} from '@/services/collection.service';
import { getProductsList } from '@/services/product.service';
import ProductCard from '@/components/storefront/ProductCard';
import CollectionSiblingPills from '@/components/storefront/CollectionSiblingPills';
import CatalogFilter from '@/components/storefront/catalog/CatalogFilter';
import { getCatalogFacets } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';

export const revalidate = 60;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    inStock?: string;
    stockStatus?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    category?: string;
    page?: string;
  }>;
}

/**
 * High-Performance SEO Metadata Generator
 */
export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: 'Collection Not Found | Aurem Luxury',
      robots: { index: false, follow: false },
    };
  }

  const title = `${collection.title} | Luxury Collection Drop`;
  const description =
    collection.description ||
    `Explore the ${collection.title} collection at Aurem Luxury. Engineered garments and minimal modest couture in Bangladesh.`;
  const bannerImage =
    collection.bannerImage?.url ||
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop';

  return {
    title,
    description,
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/collections/${collection.slug}`,
      images: [
        {
          url: bannerImage,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [bannerImage],
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const { sort, inStock, stockStatus, minPrice, maxPrice, size, category } = await searchParams;

  // Zero-waterfall: Fetch config, target collection, facets, and category tree in parallel
  const [config, collection, facets, categoryTree] = await Promise.all([
    getPublicStoreConfig(),
    getCollectionBySlug(slug),
    getCatalogFacets(),
    getCategoriesTree(),
  ]);

  if (!collection) {
    notFound();
  }

  const branding = config?.branding || {
    storeName: 'Aurem Luxury',
    colors: { accent: '#076E46' },
  };

  const isParent = !collection.parentSlug;

  // Fetch sibling or child taxonomy
  let parentCollection = null;
  let pillsData: { title: string; slug: string; badgeText?: string }[] = [];
  let childShowcases: {
    collection: { title: string; slug: string; badgeText?: string; description?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: any[];
  }[] = [];

  if (isParent) {
    // Current is Parent: Get child collections
    const children = await getChildCollections(collection.slug);
    pillsData = children.map((c) => ({
      title: c.title,
      slug: c.slug,
      badgeText: c.badgeText,
    }));

    // If parent has children, fetch top 4 garments per child for Section Showcase
    if (children.length > 0) {
      const showcaseResults = await Promise.all(
        children.map(async (child) => {
          const res = await getProductsList({
            collection: child.slug,
            limit: 4,
          });
          return {
            collection: child,
            products: res.products,
          };
        })
      );
      childShowcases = showcaseResults.filter((sc) => sc.products.length > 0);
    }
  } else {
    // Current is Child: Get parent and sibling collections
    const [parent, siblings] = await Promise.all([
      getCollectionBySlug(collection.parentSlug!),
      getSiblingCollections(collection.parentSlug!),
    ]);
    parentCollection = parent;
    pillsData = siblings.map((s) => ({
      title: s.title,
      slug: s.slug,
      badgeText: s.badgeText,
    }));
  }

  // Fetch main products grid for current collection (with Solution A Parent Aggregation + Facet filters)
  const productsResult = await getProductsList({
    collection: collection.slug,
    category,
    sizes: size,
    sort,
    inStock: inStock === 'true' ? true : undefined,
    stockStatus: stockStatus || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    limit: 60,
  });

  const products = productsResult.products || [];

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Breadcrumbs */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-950 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/shop" className="hover:text-zinc-950 transition">
            Collections
          </Link>
          {parentCollection && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <Link
                href={`/collections/${parentCollection.slug}`}
                className="hover:text-zinc-950 transition"
              >
                {parentCollection.title}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-900">{collection.title}</span>
        </nav>
      </div>

      {/* 2. Collection Hero Banner Header */}
      <header className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
          <div className="max-w-2xl space-y-2">
            {collection.badgeText && (
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: branding.colors?.accent || '#076E46' }}
                  className="text-[10px] uppercase font-bold tracking-wider text-white px-2 py-0.5 rounded"
                >
                  {collection.badgeText}
                </span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-950">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-sm text-zinc-600 leading-relaxed pt-1">
                {collection.description}
              </p>
            )}
          </div>

          {/* Optional Collection Banner Thumbnail */}
          {collection.bannerImage?.url && (
            <div className="relative w-full md:w-64 h-36 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
              <Image
                src={collection.bannerImage.url}
                alt={collection.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* 3. The Sunnah Store Sub-Collection Sibling Pills */}
      {pillsData.length > 0 && (
        <CollectionSiblingPills
          parentTitle={parentCollection?.title || (isParent ? collection.title : undefined)}
          parentSlug={isParent ? collection.slug : collection.parentSlug}
          currentSlug={collection.slug}
          pills={pillsData}
          accentColor={branding.colors?.accent}
        />
      )}

      {/* 4. Parent Collection Section-by-Section Showcase */}
      {isParent && childShowcases.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-8 pb-14 space-y-12">
          {childShowcases.map((sc) => (
            <div key={sc.collection.slug} className="border-b border-zinc-200/80 pb-10">
              <div className="flex items-baseline justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950">
                      {sc.collection.title}
                    </h2>
                    {sc.collection.badgeText && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                        {sc.collection.badgeText}
                      </span>
                    )}
                  </div>
                  {sc.collection.description && (
                    <p className="text-xs text-zinc-500 mt-1">{sc.collection.description}</p>
                  )}
                </div>
                <Link
                  href={`/collections/${sc.collection.slug}`}
                  style={{ color: branding.colors?.accent || '#B8860B' }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:opacity-80 transition active:scale-[0.98] duration-75 shrink-0"
                >
                  <span>Explore All {sc.collection.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {sc.products.map((product, idx) => (
                  <ProductCard
                    key={String(product._id)}
                    product={product}
                    index={idx}
                    accentColor={branding.colors?.accent}
                    showAddToCart={config?.features?.showCardAddToCart}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 5. Main Catalog Grid with Universal CatalogFilter */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isParent && childShowcases.length > 0 && (
          <div className="pt-4 pb-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900">
              All {collection.title} Garments
            </h3>
          </div>
        )}

        <CatalogFilter
          categories={categoryTree}
          facets={facets}
          totalResults={productsResult.pagination.total}
          lockedDimension="collection"
          accentColor={branding.colors?.accent}
        >
          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-300 rounded-lg p-8 my-6">
              <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                No garments found
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No garments currently match your selected filters. Try resetting price range or clearing sizes.
              </p>
              <Link
                href={`/collections/${collection.slug}`}
                className="inline-block mt-4 px-5 py-2.5 bg-zinc-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition active:scale-[0.98] duration-75"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product, idx) => (
                <ProductCard
                  key={String(product._id)}
                  product={product}
                  index={idx}
                  accentColor={branding.colors?.accent}
                  showAddToCart={config?.features?.showCardAddToCart}
                />
              ))}
            </div>
          )}
        </CatalogFilter>
      </main>
    </div>
  );
}
