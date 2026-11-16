import React from 'react';
import { getPublicStoreConfig } from '@/services/config.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

export const revalidate = 60;

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, categoryTree, collections] = await Promise.all([
    getPublicStoreConfig(),
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

  const navCategories = categoryTree.map((cat) => ({
    id: cat._id,
    title: cat.name,
    slug: cat.slug,
    subcategories: cat.children?.map((child) => ({
      title: child.name,
      slug: child.slug,
    })),
  }));

  const navCollections = collections.map((col) => ({
    _id: col._id,
    title: col.title,
    slug: col.slug,
    parentSlug: col.parentSlug,
    badgeText: col.badgeText,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* 1. Global Announcement / Ticker TopBar */}
      <TopBar
        tagline={branding.tagline}
        freeShippingThreshold={logistics.freeShippingThreshold}
        supportPhone={logistics.supportPhone}
      />

      {/* 2. Symmetrical Luxury Navigation Bar & Mega-Menu */}
      <Navbar
        storeName={branding.storeName}
        accentColor={branding.colors?.accent}
        categories={navCategories}
        collections={navCollections}
        navLinks={config?.headerNavLinks}
      />

      {/* 3. Page Body */}
      <div className="flex-1">{children}</div>

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
