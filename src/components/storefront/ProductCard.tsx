'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { StockStatus, IVariant } from '@/models/Product';
import { getProductPrimaryImage } from '@/lib/utils';

export interface ProductCardProps {
  product: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: string | any;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants?: (IVariant | any)[];
  };
  accentColor?: string;
  darkSurface?: boolean;
  index?: number;
  showAddToCart?: boolean;
}

export default function ProductCard({
  product,
  accentColor = '#B8860B',
  darkSurface = false,
  index,
  showAddToCart = false,
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

  const defaultImage = getProductPrimaryImage(product);

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

  const [isJustAdded, setIsJustAdded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Strict real-viewport check:
        // 1. Must be intersecting with valid height (ignores initial unlaid 0px frame)
        // 2. Element top must genuinely be inside visible viewport (< window.innerHeight)
        if (
          entry.isIntersecting &&
          entry.boundingClientRect.height > 60 &&
          entry.boundingClientRect.top < (window.innerHeight || 900)
        ) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        // -50px bottom margin: card MUST scroll at least 50px INTO the screen before triggering
        rootMargin: '0px 0px -50px 0px',
        threshold: [0.05, 0.15],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isRevealed = isInView && isImageLoaded;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) return;

    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1200);

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
      ref={cardRef}
      className={`group flex flex-col justify-between rounded-sm transition-all duration-300 ${
        darkSurface ? 'bg-zinc-900/90' : 'bg-white'
      }`}
    >
      <div>
        {/* Clean 3:4 Portrait Image Container with Group Hover */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 mb-3 select-none touch-manipulation [-webkit-tap-highlight-color:transparent]">
          {/* Main PDP Link */}
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 block z-0"
            aria-label={product.title}
          >
            {/* Main Image with Smooth Subtle Scale on Hover */}
            <Image
              src={defaultImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setIsImageLoaded(true)}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Editorial Curtain Drop Layer (Unveils when in viewport & loaded) */}
            <div
              style={{
                transitionDelay: isRevealed && index !== undefined ? `${(index % 4) * 90}ms` : '0ms',
              }}
              className={`absolute inset-0 pointer-events-none transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] z-[5] will-change-transform ${
                darkSurface ? 'bg-zinc-800' : 'bg-[#e4e4e7]'
              } ${isRevealed ? 'translate-y-full' : 'translate-y-0'}`}
            />
          </Link>

          {/* Badges (Top Left) - Smoothly reveals as curtain drops */}
          <div
            style={{
              transitionDelay: isRevealed && index !== undefined ? `${(index % 4) * 90 + 150}ms` : '150ms',
            }}
            className={`absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none transition-opacity duration-500 ${
              isRevealed ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {discountPct > 0 && isAvailable && (
              <span
                style={{ backgroundColor: accentColor }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white tracking-wide shadow-xs"
              >
                -{discountPct}%
              </span>
            )}
            {isPreOrder && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white shadow-xs">
                PRE-ORDER
              </span>
            )}
            {!isAvailable && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900/90 text-white backdrop-blur-xs shadow-xs">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Floating Luxury Quick-Add Cart Pill (Bottom Right) */}
          {isAvailable && (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Quick add ${product.title} to cart`}
              className={`absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ease-out active:scale-95 cursor-pointer shadow-md select-none touch-manipulation sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 ${
                isJustAdded
                  ? 'bg-[#076E46] text-white ring-2 ring-white/90 scale-100 opacity-100 translate-y-0'
                  : 'bg-white/95 text-zinc-900 hover:bg-zinc-950 hover:text-white backdrop-blur-xs border border-black/5'
              }`}
            >
              {isJustAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-in zoom-in duration-150" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ ADD</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Centered Title & Clean Price Row */}
        <div className="text-center px-2 pb-2">
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

          <div className="flex items-center justify-center gap-2">
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

      {/* Full-Width Action Button (Conditionally rendered when showAddToCart is true) */}
      {showAddToCart && (
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!isAvailable}
          style={{
            backgroundColor: isJustAdded
              ? '#076E46'
              : !isAvailable
              ? '#A1A1AA'
              : darkSurface
              ? '#FFFFFF'
              : accentColor,
            color: isJustAdded
              ? '#FFFFFF'
              : !isAvailable
              ? '#FFFFFF'
              : darkSurface
              ? '#09090B'
              : '#FFFFFF',
          }}
          className={`w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition active:scale-[0.98] duration-75 flex items-center justify-center gap-1.5 touch-manipulation [-webkit-tap-highlight-color:transparent] select-none ${
            isAvailable ? 'hover:opacity-90 cursor-pointer' : 'cursor-not-allowed opacity-60'
          }`}
        >
          {isJustAdded ? (
            <>
              <Check className="w-3.5 h-3.5 animate-in zoom-in duration-150" />
              <span>ADDED TO CART</span>
            </>
          ) : !isAvailable ? (
            'SOLD OUT'
          ) : isPreOrder ? (
            'PRE-ORDER'
          ) : (
            'ADD TO CART'
          )}
        </button>
      )}
    </div>
  );
}
