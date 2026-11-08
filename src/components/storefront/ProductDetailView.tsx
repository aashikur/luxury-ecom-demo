'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Ruler, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from './ProductCard';

interface Variant {
  size: string;
  stock: number;
  sku: string;
  colorName?: string;
}

interface SizeChartItem {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
}

interface ProductDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts: any[];
  accentColor?: string;
  insideDhakaFee?: number;
  outsideDhakaFee?: number;
  showroomAddress?: string;
}

export default function ProductDetailView({
  product,
  relatedProducts,
  accentColor = '#B8860B',
  insideDhakaFee = 70,
  outsideDhakaFee = 130,
  showroomAddress = 'Banani 11, Dhaka',
}: ProductDetailProps) {
  const { addToCart } = useCart();

  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.variants?.[0]?.size || 'M'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'ADDITIONAL' | 'POLICY'>('DESCRIPTION');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', key: '' }];
  const currentImage = images[activeGalleryIdx]?.url || images[0]?.url;

  const activePrice = product.discountPrice || product.basePrice;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.basePrice);
  const discountPct = hasDiscount
    ? Math.round(((product.basePrice - (product.discountPrice || 0)) / product.basePrice) * 100)
    : 0;

  const currentVariant = product.variants?.find((v: Variant) => v.size === selectedSize);
  const isOutOfStock = currentVariant ? currentVariant.stock <= 0 : false;

  const handleAdd = (openDrawer: boolean) => {
    if (isOutOfStock) return;
    addToCart(
      {
        productId: product._id,
        title: product.title,
        slug: product.slug,
        image: currentImage,
        size: selectedSize,
        price: activePrice,
      },
      quantity,
      openDrawer
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6">
        <Link href="/" className="hover:text-zinc-900 transition">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-zinc-900 transition">{product.primaryCategory || 'Store'}</Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium truncate">{product.title}</span>
      </nav>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-zinc-200">
        {/* Left Column: 4:5 Large Portrait Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] w-full bg-zinc-100 overflow-hidden border border-zinc-200/80">
            <Image
              src={currentImage}
              alt={product.title}
              fill
              priority
              className="object-cover object-center"
            />
            {discountPct > 0 && (
              <span
                style={{ backgroundColor: accentColor }}
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white z-10"
              >
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img: { url: string }, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveGalleryIdx(i)}
                  className={`relative w-20 aspect-[3/4] border overflow-hidden cursor-pointer ${
                    activeGalleryIdx === i ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 opacity-60'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Editorial Specs, Size Boxes, Action Buttons */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
            {product.title}
          </h1>

          {/* Price Row */}
          <div className="flex items-baseline gap-3 mb-6">
            {hasDiscount && (
              <span className="text-lg line-through text-zinc-400">
                {product.basePrice.toLocaleString()}৳
              </span>
            )}
            <span style={{ color: accentColor }} className="text-2xl font-bold">
              {activePrice.toLocaleString()}৳
            </span>
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Square Size Selector */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Size : <strong className="text-zinc-950">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {product.variants?.map((v: Variant) => {
                const isSelected = selectedSize === v.size;
                const outOfStock = v.stock <= 0;

                return (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    disabled={outOfStock}
                    className={`w-10 h-10 text-xs font-bold border transition relative cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : outOfStock
                        ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through'
                        : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
            {isOutOfStock && (
              <p className="text-xs text-red-600 font-medium">Selected size is currently out of stock.</p>
            )}
          </div>

          {/* Quantity Stepper + ADD TO CART Row */}
          <div className="flex items-stretch gap-3 mb-3">
            <div className="flex items-center border border-zinc-300 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-3 text-zinc-600 hover:text-zinc-950 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-3 text-zinc-600 hover:text-zinc-950 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => handleAdd(false)}
              disabled={isOutOfStock}
              className="flex-1 py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-zinc-900 text-xs font-bold uppercase tracking-[0.18em] transition cursor-pointer disabled:opacity-40"
            >
              ADD TO CART
            </button>
          </div>

          {/* Full-Width Primary ORDER NOW Button */}
          <button
            onClick={() => handleAdd(true)}
            disabled={isOutOfStock}
            style={{ backgroundColor: accentColor }}
            className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-95 cursor-pointer disabled:opacity-40 mb-6"
          >
            ORDER NOW (CASH ON DELIVERY)
          </button>

          {/* Delivery & Showroom Info */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <p>
              <strong className="text-zinc-900">Delivery:</strong> Inside Dhaka (৳{insideDhakaFee}) • Outside Dhaka (৳{outsideDhakaFee})
            </p>
            <p>
              <strong className="text-zinc-900">Showroom:</strong> {showroomAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Additional / Policy */}
      <div className="py-12 border-b border-zinc-200">
        <div className="flex items-center justify-center gap-8 border-b border-zinc-200 mb-8">
          {[
            { id: 'DESCRIPTION', label: 'DESCRIPTION' },
            { id: 'ADDITIONAL', label: 'ADDITIONAL INFORMATION' },
            { id: 'POLICY', label: 'RETURN POLICY' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'DESCRIPTION' | 'ADDITIONAL' | 'POLICY')}
              style={{
                borderColor: activeTab === tab.id ? accentColor : 'transparent',
              }}
              className={`pb-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition cursor-pointer ${
                activeTab === tab.id ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-sm text-zinc-700 leading-relaxed space-y-6">
          {activeTab === 'DESCRIPTION' && (
            <div>
              <p>{product.description}</p>
              <div className="mt-4">
                <h4 className="font-bold text-zinc-900 mb-1">Collections & Tags</h4>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  {product.collections?.join(' • ')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ADDITIONAL' && (
            <div className="border border-zinc-200 p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold text-zinc-900">Primary Category:</span>
                <span>{product.primaryCategory}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold text-zinc-900">Wash Care:</span>
                <span>Gentle cold machine wash inside out. Do not bleach or tumble dry.</span>
              </div>
            </div>
          )}

          {activeTab === 'POLICY' && (
            <div className="space-y-3 text-xs sm:text-sm text-zinc-700">
              <p>
                <strong>1. Cash on Delivery Nationwide:</strong> You may open and inspect the garment parcel in front of the delivery rider before completing payment.
              </p>
              <p>
                <strong>2. 3-Day Easy Size Exchange:</strong> If the size does not fit, contact our hotline within 72 hours for an instant size exchange.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-sm shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-zinc-900" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950">
                  GARMENT SIZE GUIDE (INCHES)
                </h3>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest (Inches)</th>
                  <th className="py-2">Length (Inches)</th>
                  {product.sizeChart?.[0]?.sleeve && <th className="py-2">Sleeve</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {product.sizeChart?.map((row: SizeChartItem) => (
                  <tr key={row.size} className="hover:bg-zinc-50">
                    <td className="py-2.5 font-bold text-zinc-950">{row.size}</td>
                    <td className="py-2.5 text-zinc-700">{row.chest}"</td>
                    <td className="py-2.5 text-zinc-700">{row.length}"</td>
                    {row.sleeve && <td className="py-2.5 text-zinc-700">{row.sleeve}"</td>}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-[11px] text-zinc-500 mt-6">
              * Measurements are in inches. Fits true to size with a tailored streetwear drop.
            </p>
          </div>
        </div>
      )}

      {/* Related Products 4-Column Grid */}
      {relatedProducts?.length > 0 && (
        <div className="pt-14">
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-900 mb-8">
            YOU MAY ALSO LIKE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {relatedProducts.slice(0, 4).map((rel: { _id: string; title: string; slug: string; basePrice: number; discountPrice?: number; images: { url: string; key: string }[] }) => (
              <ProductCard
                key={rel._id}
                product={rel}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
