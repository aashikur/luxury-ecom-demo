import React from 'react';
import { connectDB } from '@/lib/db';
import StoreConfig, { IHomeSection } from '@/models/StoreConfig';
import Product from '@/models/Product';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import HeroBanner from '@/components/storefront/HeroBanner';
import PromoCard from '@/components/storefront/PromoCard';
import CollectionSection from '@/components/storefront/CollectionSection';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

/**
 * ============================================================================
 * LESSON: React Server Component (RSC) Driven Homepage
 * ============================================================================
 * 
 * WHY RSC FOR STOREFRONT HOME?
 * 1. 0ms Client Fetching: The database query runs on the server directly.
 * 2. Perfect SEO: Fully rendered HTML is delivered to Google and Facebook bots.
 * 3. Zero Client JS Overhead: MongoDB drivers and queries stay on the server.
 */

async function getStoreData() {
  await connectDB();

  // 1. Fetch StoreConfig
  let config = await StoreConfig.findOne({ isActive: true }).lean();
  if (!config) {
    // If not seeded yet, fetch from our API
    const res = await fetch('http://localhost:3000/api/config', { cache: 'no-store' });
    const json = await res.json();
    config = json.data;
  }

  // 2. Fetch Products
  let products = await Product.find({ isActive: true })
    .sort({ isPinned: -1, priority: -1, createdAt: -1 })
    .lean();

  if (products.length === 0) {
    const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
    const json = await res.json();
    products = json.data;
  }

  return { config, products };
}

export default async function HomePage() {
  const { config, products } = await getStoreData();

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

  // Convert Mongoose Documents to plain objects for React Props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanProducts = JSON.parse(JSON.stringify(products));

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

      {/* 2. Luxury Center-Logo Navbar */}
      <Navbar
        storeName={branding.storeName}
        accentColor={branding.colors?.accent || '#B8860B'}
      />

      {/* 3. Shopify-Style Dynamic Sections Engine */}
      <main className="flex-1 pb-16">
        {activeSections.map((section: IHomeSection) => {
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
                description={section.subtitle || section.description || `On all orders above ৳${logistics.freeShippingThreshold.toLocaleString()} • Inside Dhaka ৳${logistics.insideDhakaFee} • Outside Dhaka ৳${logistics.outsideDhakaFee}`}
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
            // Filter products matching this section's collection
            const matchedProducts = section.collectionSlug
              ? cleanProducts.filter((p: { collections?: string[] }) =>
                  p.collections?.includes(section.collectionSlug || '')
                )
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
        })}
      </main>

      {/* 4. Slide-Over 1-Page Bangladesh Checkout Drawer */}
      <CartDrawer
        insideDhakaFee={logistics.insideDhakaFee}
        outsideDhakaFee={logistics.outsideDhakaFee}
        freeShippingThreshold={logistics.freeShippingThreshold}
        manualBkashNumber={config?.payment?.manualBkash?.number || logistics.supportPhone}
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
