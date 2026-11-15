import React from 'react';
import type { IHomeSection } from '@/models/StoreConfig';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductsList } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import HeroBanner from '@/components/storefront/HeroBanner';
import PromoCard from '@/components/storefront/PromoCard';
import CollectionSection from '@/components/storefront/CollectionSection';
import ProductDetailView from '@/components/storefront/ProductDetailView';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

// Incremental Static Regeneration (ISR) - 60s fallback window paired with dual revalidation (Rule #7)
export const revalidate = 60;

/**
 * ============================================================================
 * HIGH-PERFORMANCE STOREFRONT HOMEPAGE (Rule #7, #10 & #21)
 * ============================================================================
 * 
 * 1. Zero-Waterfall: StoreConfig, Products, CategoryTree & Collections query concurrently via Promise.all.
 * 2. 4-Tier Clean Architecture: Pure domain services in-memory at 0ms latency.
 * 3. Tagged Cache: Next.js unstable_cache tagged ['store-config', 'categories', 'collections'].
 */
export default async function HomePage() {
  const [config, productsResult, categoryTree, collections] = await Promise.all([
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
  const cleanProducts = productsResult.products.map((p: any) => ({
    ...p,
    _id: String(p._id),
  }));

  const activeSections: IHomeSection[] = (config?.homeSections || [])
    .filter((sec: IHomeSection) => sec.isActive)
    .sort((a: IHomeSection, b: IHomeSection) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* 1. Slim High-Contrast Announcement Bar */}
      <TopBar
        tagline={branding.tagline}
        freeShippingThreshold={logistics.freeShippingThreshold}
        supportPhone={logistics.supportPhone}
      />

      {/* 2. Luxury Center-Logo Dynamic Navbar */}
      <Navbar
        storeName={branding.storeName}
        accentColor={branding.colors?.accent || '#B8860B'}
        categories={navCategories}
        collections={collections}
        navLinks={config?.headerNavLinks}
      />

      {/* 3. Shopify-Style Dynamic Sections Engine / Single Product Funnel */}
      <main className="flex-1 pb-16">
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
                  subtitle={`${branding.storeName.toUpperCase()} // ARCHIVE`}
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

      {/* 4. Slide-Over 1-Page Bangladesh Checkout Drawer */}
      <CartDrawer
        insideDhakaFee={logistics.insideDhakaFee}
        dhakaSuburbsFee={logistics.dhakaSuburbsFee}
        outsideDhakaFee={logistics.outsideDhakaFee}
        freeShippingThreshold={logistics.freeShippingThreshold}
        manualBkashNumber={config?.payment?.manualBkash?.walletNumber || logistics.supportPhone}
        accentColor={branding.colors?.accent}
      />

      {/* 5. Luxury High-Contrast Black Footer */}
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
