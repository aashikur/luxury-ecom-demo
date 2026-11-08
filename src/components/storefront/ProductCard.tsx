'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    basePrice: number;
    discountPrice?: number;
    images: { url: string; key: string }[];
    variants?: { size: string; stock: number }[];
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

  const activePrice = product.discountPrice || product.basePrice;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.basePrice);
  const discountPct = hasDiscount
    ? Math.round(((product.basePrice - (product.discountPrice || 0)) / product.basePrice) * 100)
    : 0;

  const defaultImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';

  const defaultSize = product.variants?.[0]?.size || 'M';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        productId: product._id,
        title: product.title,
        slug: product.slug,
        image: defaultImage,
        size: defaultSize,
        price: activePrice,
      },
      1,
      true // opens drawer
    );
  };

  return (
    <div
      className={`group flex flex-col justify-between rounded-sm transition-all duration-300 ${
        darkSurface
          ? 'bg-zinc-900/90 border border-zinc-800 p-3.5'
          : 'bg-white border border-zinc-200/80 p-3.5 hover:shadow-xl hover:border-zinc-300'
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

          {/* Minimal Discount Badge (Top Left) */}
          {discountPct > 0 && (
            <span
              style={{ backgroundColor: accentColor }}
              className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white tracking-wide z-10"
            >
              -{discountPct}%
            </span>
          )}
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
              {activePrice.toLocaleString()}৳
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Action Button */}
      <button
        onClick={handleQuickAdd}
        style={{
          backgroundColor: darkSurface ? '#FFFFFF' : accentColor,
          color: darkSurface ? '#09090B' : '#FFFFFF',
        }}
        className="w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition hover:opacity-90 cursor-pointer"
      >
        ADD TO CART
      </button>
    </div>
  );
}
