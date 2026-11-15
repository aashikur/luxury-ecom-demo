import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicStoreConfig } from '@/services/config.service';
import { getProductBySlug, getProductsList } from '@/services/product.service';
import { getCategoriesTree } from '@/services/category.service';
import { getActiveCollections } from '@/services/collection.service';
import TopBar from '@/components/storefront/TopBar';
import Navbar from '@/components/storefront/Navbar';
import ProductDetailView from '@/components/storefront/ProductDetailView';
import CartDrawer from '@/components/storefront/CartDrawer';
import Footer from '@/components/storefront/Footer';

// Incremental Static Regeneration (ISR) - 60s fallback window paired with dual cache invalidation (Rule #7 & #21)
export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * High-Performance SEO Metadata Generator (Rule #24 & docs/12-seo-metadata)
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    return {
      title: 'Product Not Found | Aurem Luxury',
      robots: { index: false, follow: false },
    };
  }

  const primaryImage = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop';
  const priceBDT = product.discountPrice ?? product.basePrice;

  return {
    title: `${product.title} | Engineered Luxury Garments`,
    description: product.description || `Buy ${product.title} in Bangladesh at ৳${priceBDT}. Premium streetwear craftsmanship with nationwide cash on delivery.`,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      url: `/products/${product.slug}`,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Zero-Waterfall Concurrent Domain Service Queries
  const [config, product, categoryTree, collections] = await Promise.all([
    getPublicStoreConfig(),
    getProductBySlug(slug),
    getCategoriesTree(),
    getActiveCollections(),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  // Fetch contextual related products
  const { products: rawRelated } = await getProductsList({
    categorySlug: product.categorySlug,
    limit: 5,
  });

  const relatedProducts = rawRelated.filter(
    (p) => String(p._id) !== String(product._id)
  ).slice(0, 4);

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

  // Structured Data (Schema.org JSON-LD) for Google Merchant & Rich Snippets
  const priceBDT = product.discountPrice ?? product.basePrice;
  const primaryImage = product.media?.[0]?.url || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: primaryImage ? [primaryImage] : [],
    brand: {
      '@type': 'Brand',
      name: branding.storeName,
    },
    offers: {
      '@type': 'Offer',
      price: priceBDT,
      priceCurrency: 'BDT',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `/products/${product.slug}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Top Bar */}
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

      {/* 4. Slide-Over COD Checkout Drawer */}
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
