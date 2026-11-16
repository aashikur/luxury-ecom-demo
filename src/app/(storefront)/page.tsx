import React from 'react';
import type { IHomeSection } from '@/models/StoreConfig';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductsList } from '@/services/product.service';
import HeroBanner from '@/components/storefront/HeroBanner';
import PromoCard from '@/components/storefront/PromoCard';
import CollectionSection from '@/components/storefront/CollectionSection';
import ProductDetailView from '@/components/storefront/ProductDetailView';

// Incremental Static Regeneration (ISR) - 60s fallback window paired with dual revalidation (Rule #7)
export const revalidate = 60;

/**
 * ============================================================================
 * HIGH-PERFORMANCE STOREFRONT HOMEPAGE (Rule #7, #10 & #21)
 * ============================================================================
 * 
 * 1. Zero-Waterfall: StoreConfig & Products query concurrently via Promise.all.
 * 2. 4-Tier Clean Architecture: Pure domain services in-memory at 0ms latency.
 * 3. Tagged Cache: Next.js unstable_cache tagged ['store-config', 'products'].
 * 4. Shell decoupling: Layout handles TopBar, Navbar, CartDrawer, and Footer.
 */
export default async function HomePage() {
  const [config, productsResult] = await Promise.all([
    getPublicStoreConfig(),
    getProductsList({ limit: 50 }),
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
      id: 'default-collection',
      type: 'COLLECTION_SECTION',
      title: 'Signature Collection',
      subtitle: 'Artisanal Luxury Fabrics & Timeless Minimal Silhouettes',
      buttonText: 'SHOP ALL',
      buttonLink: '/shop',
      order: 2,
      isActive: true,
    },
    {
      id: 'default-promo',
      type: 'PROMO_CTA_CARD',
      title: 'Free Express Shipping Nationwide',
      subtitle: 'BANGLADESH LOGISTICS',
      description: `Fast 24-48h dispatch on all orders over ৳${logistics.freeShippingThreshold.toLocaleString()}`,
      buttonText: 'ORDER ONLINE',
      buttonLink: '/shop',
      order: 3,
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
          // Block 1: Hero Banner
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
                accentColor={branding.colors?.accent}
              />
            );
          }

          // Block 2: Promo / Shipping CTA Card
          if (section.type === 'PROMO_CTA_CARD' || (section.type as string) === 'PROMO_BANNER') {
            return (
              <PromoCard
                key={section.id}
                subtitle={`${config?.courier?.provider || 'STEADFAST'} EXPRESS DISPATCH`}
                title={section.title || 'FREE EXPRESS SHIPPING ACROSS BANGLADESH'}
                description={
                  section.subtitle ||
                  section.description ||
                  `On all orders above ৳${logistics.freeShippingThreshold.toLocaleString()} • Inside Dhaka ৳${logistics.insideDhakaFee} • Outside Dhaka ৳${logistics.outsideDhakaFee}`
                }
                buttonText={section.buttonText || 'VIEW BAG & SHIPPING'}
                accentColor={branding.colors?.accent}
              />
            );
          }

          // Block 3: Category / Collection Product Section
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
                accentColor={branding.colors?.accent}
              />
            );
          }

          return null;
        })
      )}
    </main>
  );
}
