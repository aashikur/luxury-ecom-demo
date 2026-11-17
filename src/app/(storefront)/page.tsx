import React from 'react';
import type { IHomeSection } from '@/models/StoreConfig';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductsList } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import HeroBanner from '@/components/storefront/HeroBanner';
import PromoCard from '@/components/storefront/PromoCard';
import CollectionSection from '@/components/storefront/CollectionSection';
import CategoryPillsSection from '@/components/storefront/CategoryPillsSection';
import ProductDetailView from '@/components/storefront/ProductDetailView';
import ProductCard from '@/components/storefront/ProductCard';
import Image from 'next/image';
import Link from 'next/link';

// Incremental Static Regeneration (ISR) - 60s fallback window paired with dual revalidation (Rule #7)
export const revalidate = 60;

/**
 * ============================================================================
 * HIGH-PERFORMANCE STOREFRONT HOMEPAGE (Rule #7, #10 & #21)
 * ============================================================================
 * 
 * 1. Zero-Waterfall: StoreConfig, Products, Categories, Collections query
 *    concurrently via Promise.all at 0ms in-memory latency.
 * 2. 4-Tier Clean Architecture: Pure domain services with tagged cache.
 * 3. Polymorphic Block Dispatch: Hero Carousels, Circular Category Pills,
 *    Dual-Mode CTAs, Product Grids, and Split Showcases.
 */
export default async function HomePage() {
  const [config, productsResult, categoriesTree, activeCollections] = await Promise.all([
    getPublicStoreConfig(),
    getProductsList({ limit: 50 }),
    getCategoriesTree(),
    getActiveCollections(),
  ]);

  const branding = config?.branding || {
    storeName: 'Aurem Luxury',
    tagline: 'Engineered Streetwear & Minimal Garments',
    storeNiche: 'CLOTHING' as const,
    storeMode: 'MULTI_PRODUCT' as const,
    featuredProductSlug: '',
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

  const cleanProducts = productsResult.products || [];

  // Generate fallback category discovery pills if none configured
  const defaultPillItems = [
    ...categoriesTree.map((cat) => ({
      id: cat._id,
      title: cat.name,
      slug: cat.slug,
      imageUrl: cat.image?.url || '',
      href: `/shop?category=${cat.slug}`,
    })),
    ...activeCollections.map((col) => ({
      id: col._id,
      title: col.title,
      slug: col.slug,
      imageUrl: '',
      href: `/collections/${col.slug}`,
    })),
  ].slice(0, 8);

  // Default Fallback sections if none configured in StoreConfig
  const defaultSections: IHomeSection[] = [
    {
      id: 'default-hero',
      type: 'HERO_BANNER',
      title: 'Aurem Luxury Modest Drop',
      subtitle: 'Winter Collection 2026',
      buttonText: 'EXPLORE CATALOG',
      buttonLink: '/shop',
      order: 1,
      isActive: true,
    },
    {
      id: 'default-pills',
      type: 'CATEGORY_PILLS',
      title: 'Aura Collections',
      subtitle: 'Curated Categories',
      cardShape: 'CIRCLE',
      showTitle: true,
      order: 2,
      isActive: true,
    },
    {
      id: 'default-collection',
      type: 'COLLECTION_SECTION',
      title: 'Signature Collection',
      subtitle: 'Artisanal Luxury Fabrics & Timeless Minimal Silhouettes',
      buttonText: 'SHOP ALL',
      buttonLink: '/shop',
      order: 3,
      isActive: true,
    },
    {
      id: 'default-promo',
      type: 'PROMO_CTA_CARD',
      title: 'Free Express Shipping Nationwide',
      subtitle: 'BANGLADESH LOGISTICS',
      description: `Fast 24-48h dispatch on all orders over ৳${logistics.freeShippingThreshold.toLocaleString()} • Inside Dhaka ৳${logistics.insideDhakaFee} • Outside Dhaka ৳${logistics.outsideDhakaFee}`,
      buttonText: 'ORDER ONLINE',
      buttonLink: '/shop',
      layoutWidth: 'WIDE_FULL',
      bgMode: 'SOLID_SURFACE',
      order: 4,
      isActive: true,
    },
  ];

  const activeSections = (
    config?.homeSections && config.homeSections.length > 0
      ? config.homeSections
      : defaultSections
  )
    .filter((s: IHomeSection) => s.isActive !== false)
    .sort((a: IHomeSection, b: IHomeSection) => (a.order || 0) - (b.order || 0));

  return (
    <main className="pb-16">
      {branding.storeMode === 'SINGLE_PRODUCT_FUNNEL' && cleanProducts.length > 0 ? (
        <div>
          {(() => {
            const featured =
              cleanProducts.find(
                (p: { slug: string }) => p.slug === branding.featuredProductSlug
              ) || cleanProducts[0];
            const related = cleanProducts.filter(
              (p: { _id: string | unknown }) => String(p._id) !== String(featured._id)
            );
            return (
              <ProductDetailView
                product={featured}
                relatedProducts={related}
                accentColor={branding.colors?.accent || '#B8860B'}
                insideDhakaFee={logistics.insideDhakaFee}
                outsideDhakaFee={logistics.outsideDhakaFee}
                showroomAddress={logistics.showroomAddress}
              />
            );
          })()}
        </div>
      ) : (
        activeSections.map((section: IHomeSection) => {
          // Block 1: Hero Banner / Multi-Slide Carousel
          if (section.type === 'HERO_BANNER' || (section.type as string) === 'HERO_CAROUSEL') {
            return (
              <HeroBanner
                key={section.id}
                storeName={branding.storeName}
                title={section.title || 'Winter Luxury Drop 2026'}
                subtitle={section.subtitle || branding.storeName.toUpperCase()}
                description={section.subtitle || section.description || 'Premium Acid-Wash & Heavyweight Fleece'}
                buttonText={section.buttonText || 'SHOP NOW'}
                buttonLink={section.buttonLink || section.linkUrl || '/shop'}
                imageUrl={section.bannerImage?.url}
                slides={section.slides || []}
                accentColor={branding.colors?.accent}
              />
            );
          }

          // Block 2: Category Discovery Pills (Story Bubbles / Rounded-full)
          if (section.type === 'CATEGORY_PILLS') {
            // Find matched pill items or fallback to top categories
            const pillItems = defaultPillItems;
            return (
              <CategoryPillsSection
                key={section.id}
                title={section.title || 'Aura Collections'}
                subtitle={section.subtitle}
                showTitle={section.showTitle !== false}
                cardShape={section.cardShape || 'CIRCLE'}
                items={pillItems}
              />
            );
          }

          // Block 3: Promo / Shipping CTA Card (Wide Edge-to-Edge or Boxed)
          if (section.type === 'PROMO_CTA_CARD' || (section.type as string) === 'PROMO_BANNER') {
            return (
              <PromoCard
                key={section.id}
                subtitle={section.subtitle || 'NATIONWIDE EXPRESS DISPATCH'}
                title={section.title || 'FREE EXPRESS SHIPPING ACROSS BANGLADESH'}
                description={
                  section.subtitle ||
                  section.description ||
                  `On all orders above ৳${logistics.freeShippingThreshold.toLocaleString()} • Inside Dhaka ৳${logistics.insideDhakaFee} • Outside Dhaka ৳${logistics.outsideDhakaFee}`
                }
                buttonText={section.buttonText || 'VIEW BAG & SHIPPING'}
                buttonLink={section.buttonLink || section.linkUrl || '/shop'}
                imageUrl={section.bannerImage?.url}
                layoutWidth={section.layoutWidth || 'WIDE_FULL'}
                bgMode={section.bgMode || (section.bannerImage?.url ? 'PHOTO_BG' : 'SOLID_SURFACE')}
                accentColor={branding.colors?.accent}
              />
            );
          }

          // Block 4: Category / Collection Product Section
          if (
            section.type === 'COLLECTION_SECTION' ||
            (section.type as string) === 'CATEGORY_GRID' ||
            (section.type as string) === 'CATEGORY_SLIDER'
          ) {
            const targetSlug = (section.collectionSlug || '').toLowerCase().trim();
            const matchedProducts = targetSlug
              ? cleanProducts.filter((p) => {
                  const inCollections = p.collections?.some((c: string) => c.toLowerCase() === targetSlug);
                  const inCatSlug = p.categorySlug?.toLowerCase() === targetSlug;
                  const inCatPath = p.categoryPath?.some((cp: string) => cp.toLowerCase() === targetSlug);
                  const normCat = (p.categoryName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const inCatName = normCat
                    ? normCat.includes(targetSlug) || targetSlug.includes(normCat)
                    : false;
                  return inCollections || inCatSlug || inCatPath || inCatName;
                })
              : cleanProducts;

            const isDarkBand =
              section.themeStyle === 'DARK_BAND' ||
              (section.type as string) === 'CATEGORY_SLIDER';

            return (
              <CollectionSection
                key={section.id}
                title={section.title || 'Collection'}
                description={section.subtitle || section.description}
                buttonText={section.buttonText || 'VIEW ALL'}
                buttonLink={section.buttonLink || `/shop?collection=${section.collectionSlug}`}
                products={matchedProducts.length > 0 ? matchedProducts : cleanProducts}
                themeStyle={isDarkBand ? 'DARK_BAND' : 'LIGHT'}
                showTitle={section.showTitle !== false}
                accentColor={branding.colors?.accent}
                showAddToCart={config?.features?.showCardAddToCart}
              />
            );
          }

          // Block 5: Editorial Split Showcase
          if (section.type === 'SPLIT_SHOWCASE') {
            const targetSlug = (section.collectionSlug || '').toLowerCase().trim();
            const matchedProducts = (
              targetSlug
                ? cleanProducts.filter((p) => {
                    const inCollections = p.collections?.some((c: string) => c.toLowerCase() === targetSlug);
                    const inCatSlug = p.categorySlug?.toLowerCase() === targetSlug;
                    return inCollections || inCatSlug;
                  })
                : cleanProducts
            ).slice(0, 2);

            const bannerImg =
              section.bannerImage?.url ||
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80';

            return (
              <section key={section.id} className="max-w-[1360px] mx-auto px-4 sm:px-8 my-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Campaign Image Card */}
                  <div className="lg:col-span-5 relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 group">
                    <Image
                      src={bannerImg}
                      alt={section.title || 'Campaign Showcase'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                      {section.subtitle && (
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
                          {section.subtitle}
                        </p>
                      )}
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 leading-tight">
                        {section.title}
                      </h3>
                      <Link
                        href={section.buttonLink || '/shop'}
                        className="inline-block px-6 py-2.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-[0.16em] hover:bg-zinc-200 transition active:scale-95 duration-75 w-fit"
                      >
                        {section.buttonText || 'DISCOVER'}
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: 2 Product Cards */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {matchedProducts.map((p, pIdx) => (
                      <ProductCard
                        key={String(p._id)}
                        product={p}
                        index={pIdx}
                        showAddToCart={config?.features?.showCardAddToCart}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })
      )}
    </main>
  );
}
