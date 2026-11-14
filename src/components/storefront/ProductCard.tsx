'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { StockStatus } from '@/models/Product';

export interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    basePrice: number;
    discountPrice?: number;
    maxPrice?: number;
    sku?: string;
    hasVariants?: boolean;
    inStock?: boolean;
    stockStatus?: StockStatus;
    totalStock?: number;
    media?: { url: string; key?: string; type?: string }[];
    images?: { url: string; key?: string }[];
    variants?: {
      _id?: string;
      size?: string;
      stock: number;
      sku?: string;
      label?: string;
      price?: number;
      discountPrice?: number;
      stockStatus?: StockStatus;
      isDefault?: boolean;
      isActive?: boolean;
    }[];
  };
  accentColor?: string;
  darkSurface?: boolean;
}

export default function ProductCard({
  product,
  accentColor = '#B8860B',
  darkSurface = false,
}: ProductCardProps) {
  const { addToCart } = useCart();

  // Availability Check
  const isPreOrder = product.stockStatus === 'PRE_ORDER';
  const isAvailable = product.inStock !== false || isPreOrder;

  // Active Price Resolution
  const activePrice = product.discountPrice || product.basePrice;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.basePrice);
  const discountPct = hasDiscount
    ? Math.round(((product.basePrice - (product.discountPrice || 0)) / product.basePrice) * 100)
    : 0;

  // Show price range if variants have different pricing
  const hasPriceRange = Boolean(
    product.maxPrice && product.maxPrice > activePrice
  );

  const defaultImage =
    product.media?.[0]?.url ||
    (product as any).images?.[0]?.url ||
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';

  // Default Variant Selection
  const activeVariants = (product.variants || []).filter((v) => v.isActive !== false);
  const defaultVariant =
    activeVariants.find((v) => v.isDefault) ||
    activeVariants.find(
      (v) =>
        v.stockStatus !== 'FORCE_OUT_OF_STOCK' &&
        (v.stock > 0 || v.stockStatus === 'PRE_ORDER')
    ) ||
    activeVariants[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) return;

    if (product.hasVariants !== false && defaultVariant) {
      const effectivePrice =
        defaultVariant.discountPrice ??
        defaultVariant.price ??
        product.discountPrice ??
        product.basePrice;

      addToCart(
        {
          productId: product._id,
          variantId: defaultVariant._id?.toString(),
          sku: defaultVariant.sku || product.sku || '',
          title: product.title,
          slug: product.slug,
          image: defaultImage,
          size: defaultVariant.size || '',
          variantLabel: defaultVariant.label || defaultVariant.size || '',
          price: effectivePrice,
        },
        1,
        true // opens drawer
      );
    } else {
      // Regular product (single SKU)
      addToCart(
        {
          productId: product._id,
          sku: product.sku || '',
          title: product.title,
          slug: product.slug,
          image: defaultImage,
          size: '',
          variantLabel: '',
          price: activePrice,
        },
        1,
        true // opens drawer
      );
    }
  };

  return (
    <div
      className={`group flex flex-col justify-between rounded-sm transition-all duration-300 ${
        darkSurface ? 'bg-zinc-900/90' : 'bg-white'
      }`}
    >
      <div>
        {/* Clean 3:4 Portrait Image Container */}
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-[3/4] w-full block overflow-hidden bg-zinc-100 mb-4"
        >
          <Image
            src={defaultImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Badges (Top Left) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPct > 0 && isAvailable && (
              <span
                style={{ backgroundColor: accentColor }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white tracking-wide"
              >
                -{discountPct}%
              </span>
            )}
            {isPreOrder && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white">
                PRE-ORDER
              </span>
            )}
            {!isAvailable && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900/90 text-white backdrop-blur-xs">
                SOLD OUT
              </span>
            )}
          </div>
        </Link>

        {/* Centered Title & Clean Price Row */}
        <div className="text-center px-2">
          <Link
            href={`/products/${product.slug}`}
            className={`text-sm font-medium tracking-tight block transition-colors line-clamp-1 mb-1.5 ${
              darkSurface
                ? 'text-zinc-100 group-hover:text-white'
                : 'text-zinc-900 group-hover:opacity-75'
            }`}
          >
            {product.title}
          </Link>

          <div className="flex items-center justify-center gap-2 mb-4">
            {hasDiscount && (
              <span className="text-xs line-through text-zinc-400">
                {product.basePrice.toLocaleString()}৳
              </span>
            )}
            <span
              style={{ color: darkSurface ? '#FFFFFF' : accentColor }}
              className="text-sm font-bold"
            >
              {hasPriceRange
                ? `${activePrice.toLocaleString()}৳ - ${product.maxPrice?.toLocaleString()}৳`
                : `${activePrice.toLocaleString()}৳`}
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Action Button */}
      <button
        onClick={handleQuickAdd}
        disabled={!isAvailable}
        style={{
          backgroundColor: !isAvailable
            ? '#A1A1AA'
            : darkSurface
            ? '#FFFFFF'
            : accentColor,
          color: !isAvailable ? '#FFFFFF' : darkSurface ? '#09090B' : '#FFFFFF',
        }}
        className={`w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
          isAvailable ? 'hover:opacity-90 cursor-pointer' : 'cursor-not-allowed opacity-60'
        }`}
      >
        {!isAvailable
          ? 'SOLD OUT'
          : isPreOrder
          ? 'PRE-ORDER'
          : 'ADD TO CART'}
      </button>
    </div>
  );
}
