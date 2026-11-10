import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import StoreConfig from '@/models/StoreConfig';
import Product from '@/models/Product';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import ProductDetailView from '@/components/storefront/ProductDetailView';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connectDB();
  const { slug } = await params;

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

  // 2. Fetch Active Product by Slug
  const rawProduct = await Product.findOne({ slug, isActive: true }).lean();

  if (!rawProduct) {
    notFound();
  }

  // 3. Fetch Related Products
  const rawRelated = await Product.find({
    _id: { $ne: rawProduct._id },
    isActive: true,
  })
    .limit(4)
    .lean();

  const product = JSON.parse(JSON.stringify(rawProduct));
  const relatedProducts = JSON.parse(JSON.stringify(rawRelated));

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* 1. Top Bar */}
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

      {/* 3. Interactive Detail View */}
      <main className="flex-1">
        <ProductDetailView
          product={product}
          relatedProducts={relatedProducts}
          accentColor={branding.colors?.accent || '#B8860B'}
          insideDhakaFee={logistics.insideDhakaFee}
          outsideDhakaFee={logistics.outsideDhakaFee}
          showroomAddress={logistics.showroomAddress}
        />
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
