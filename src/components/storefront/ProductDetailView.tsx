'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Ruler, X, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from './ProductCard';
import { StockStatus, ProductType } from '@/models/Product';

interface Variant {
  _id?: string;
  sku: string;
  label?: string;
  size?: string;
  colorName?: string;
  colorHex?: string;
  attributes?: { key: string; value: string }[];
  price?: number;
  discountPrice?: number;
  costPrice?: number;
  stock: number;
  stockStatus?: StockStatus;
  image?: { url: string; key: string };
  isDefault?: boolean;
  isActive?: boolean;
}

interface ModifierOption {
  label: string;
  priceDelta: number;
  isAvailable: boolean;
}

interface ModifierGroup {
  name: string;
  isRequired: boolean;
  minSelect?: number;
  maxSelect: number;
  options: ModifierOption[];
}

interface SpecificationGroup {
  groupName: string;
  items: {
    label: string;
    value: string;
  }[];
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

  const hasVariants = product.hasVariants !== false && (product.variants?.length || 0) > 0;
  const activeVariants: Variant[] = hasVariants
    ? (product.variants as Variant[]).filter((v) => v.isActive !== false)
    : [];

  // Default variant selection
  const defaultVariant =
    activeVariants.find((v) => v.isDefault) ||
    activeVariants.find(
      (v) =>
        v.stockStatus !== 'FORCE_OUT_OF_STOCK' &&
        (v.stock > 0 || v.stockStatus === 'PRE_ORDER')
    ) ||
    activeVariants[0];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    defaultVariant?._id?.toString() || defaultVariant?.sku || ''
  );

  const selectedVariant = hasVariants
    ? activeVariants.find(
        (v) =>
          (v._id?.toString() && v._id.toString() === selectedVariantId) ||
          v.sku === selectedVariantId ||
          v.size === selectedVariantId
      ) || defaultVariant
    : null;

  // Modifiers state: groupName -> array of selected labels
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});

  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'ADDITIONAL' | 'POLICY'>('DESCRIPTION');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Images resolution (supports variant specific image override)
  const images =
    (product.media?.length > 0 ? product.media : null) || [
      { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', key: '', type: 'IMAGE' },
    ];
  
  const currentImage =
    selectedVariant?.image?.url || images[activeGalleryIdx]?.url || images[0]?.url;

  // 1. PRICE RESOLUTION LOGIC:
  // For a selected variant: variant.discountPrice ?? variant.price ?? product.discountPrice ?? product.basePrice
  // For regular product: product.discountPrice ?? product.basePrice
  const baseEffectivePrice = hasVariants && selectedVariant
    ? selectedVariant.discountPrice ??
      selectedVariant.price ??
      product.discountPrice ??
      product.basePrice
    : product.discountPrice ?? product.basePrice;

  // Calculate modifier price deltas
  const modifierGroups: ModifierGroup[] = product.modifierGroups || [];
  let modifierPriceDelta = 0;
  const chosenModifierList: { label: string; priceDelta: number }[] = [];

  modifierGroups.forEach((group) => {
    const selectedLabels = selectedModifiers[group.name] || [];
    group.options.forEach((opt) => {
      if (selectedLabels.includes(opt.label)) {
        modifierPriceDelta += opt.priceDelta || 0;
        chosenModifierList.push({ label: opt.label, priceDelta: opt.priceDelta || 0 });
      }
    });
  });

  const finalUnitPrice = Math.max(0, baseEffectivePrice + modifierPriceDelta);

  const originalPrice = hasVariants && selectedVariant?.price
    ? selectedVariant.price
    : product.basePrice;

  const hasDiscount = Boolean(
    (product.discountPrice && product.discountPrice < product.basePrice) ||
    (selectedVariant?.discountPrice && selectedVariant?.price && selectedVariant.discountPrice < selectedVariant.price)
  );

  const discountPct = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - baseEffectivePrice) / originalPrice) * 100)
    : 0;

  // 2. STOCK & AVAILABILITY RESOLUTION LOGIC:
  // If product.hasVariants === false: check product.inStock and product.totalStock
  // If product.hasVariants === true: check selected variant's stockStatus !== 'FORCE_OUT_OF_STOCK' and (variant.stock > 0 || variant.stockStatus === 'PRE_ORDER')
  let isOutOfStock = false;
  let isPreOrder = false;

  if (hasVariants) {
    if (!selectedVariant) {
      isOutOfStock = true;
    } else if (
      selectedVariant.stockStatus === 'FORCE_OUT_OF_STOCK' ||
      product.stockStatus === 'FORCE_OUT_OF_STOCK'
    ) {
      isOutOfStock = true;
    } else if (
      selectedVariant.stockStatus === 'PRE_ORDER' ||
      product.stockStatus === 'PRE_ORDER'
    ) {
      isPreOrder = true;
      isOutOfStock = false;
    } else {
      isOutOfStock = (selectedVariant.stock || 0) <= 0;
    }
  } else {
    if (product.stockStatus === 'FORCE_OUT_OF_STOCK') {
      isOutOfStock = true;
    } else if (product.stockStatus === 'PRE_ORDER') {
      isPreOrder = true;
      isOutOfStock = false;
    } else {
      isOutOfStock = product.inStock === false || (product.totalStock || 0) <= 0;
    }
  }

  // Toggle modifier option selection
  const handleModifierToggle = (group: ModifierGroup, optionLabel: string) => {
    setSelectedModifiers((prev) => {
      const current = prev[group.name] || [];
      if (group.maxSelect === 1) {
        // Radio style: toggle or select single
        const isCurrent = current.includes(optionLabel);
        if (isCurrent && !group.isRequired) {
          return { ...prev, [group.name]: [] };
        }
        return { ...prev, [group.name]: [optionLabel] };
      } else {
        // Multi-select checkboxes up to maxSelect
        const exists = current.includes(optionLabel);
        let next: string[];
        if (exists) {
          next = current.filter((l) => l !== optionLabel);
        } else {
          if (current.length >= group.maxSelect) {
            next = [...current.slice(1), optionLabel];
          } else {
            next = [...current, optionLabel];
          }
        }
        return { ...prev, [group.name]: next };
      }
    });
  };

  const handleAdd = (openDrawer: boolean) => {
    if (isOutOfStock) return;

    // Check required modifiers
    for (const group of modifierGroups) {
      if (group.isRequired) {
        const selected = selectedModifiers[group.name] || [];
        if (selected.length === 0) {
          alert(`Please select an option for "${group.name}".`);
          return;
        }
      }
    }

    addToCart(
      {
        productId: product._id,
        variantId: selectedVariant?._id?.toString() || undefined,
        sku: selectedVariant?.sku || product.sku || '',
        title: product.title,
        slug: product.slug,
        image: currentImage,
        size: selectedVariant?.size || '',
        variantLabel: selectedVariant?.label || selectedVariant?.size || '',
        attributes: selectedVariant?.attributes || undefined,
        modifiers: chosenModifierList.length > 0 ? chosenModifierList : undefined,
        price: finalUnitPrice,
      },
      quantity,
      openDrawer
    );
  };

  const hasSizeChart = Boolean(product.sizeChart && product.sizeChart.length > 0);
  const hasSpecs = Boolean(product.specifications && product.specifications.length > 0);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6">
        <Link href="/" className="hover:text-zinc-900 transition">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-zinc-900 transition">{product.categoryName || 'Store'}</Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium truncate">{product.title}</span>
      </nav>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-zinc-200">
        {/* Left Column: Large Portrait Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] w-full bg-zinc-100 overflow-hidden border border-zinc-200/80">
            <Image
              src={currentImage}
              alt={product.title}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              {discountPct > 0 && !isOutOfStock && (
                <span
                  style={{ backgroundColor: accentColor }}
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                >
                  -{discountPct}%
                </span>
              )}
              {isPreOrder && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600 shadow-sm">
                  PRE-ORDER
                </span>
              )}
              {isOutOfStock && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-zinc-900/90 backdrop-blur-xs shadow-sm">
                  SOLD OUT
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img: { url: string }, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveGalleryIdx(i)}
                  className={`relative w-20 aspect-[3/4] border overflow-hidden cursor-pointer shrink-0 ${
                    activeGalleryIdx === i ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 opacity-60'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Editorial Specs, Variants, Action Buttons */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {product.brandName && (
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">
              {product.brandName}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
            {product.title}
          </h1>

          {/* Price Row */}
          <div className="flex items-baseline gap-3 mb-6">
            {hasDiscount && (
              <span className="text-lg line-through text-zinc-400">
                {originalPrice.toLocaleString()}৳
              </span>
            )}
            <span style={{ color: accentColor }} className="text-2xl font-bold">
              {finalUnitPrice.toLocaleString()}৳
            </span>
            {modifierPriceDelta > 0 && (
              <span className="text-xs text-zinc-400">
                (includes {modifierPriceDelta.toLocaleString()}৳ add-ons)
              </span>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Variant Selector (Only shown if hasVariants === true) */}
          {hasVariants && activeVariants.length > 0 && (
            <div className="space-y-4 mb-6 pt-2 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  {product.productType === 'CLOTHING' ? 'Size / Variant' : 'Select Option'}:{' '}
                  <strong className="text-zinc-950">
                    {selectedVariant?.label || selectedVariant?.size || selectedVariant?.sku}
                  </strong>
                </span>

                {hasSizeChart && (
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                )}
              </div>

              {/* Selector Pills / Buttons */}
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((v: Variant) => {
                  const idKey = v._id?.toString() || v.sku || v.size || '';
                  const isSelected =
                    selectedVariantId === idKey ||
                    selectedVariant?._id?.toString() === idKey ||
                    selectedVariant?.sku === idKey;
                  const variantOOS =
                    v.stockStatus === 'FORCE_OUT_OF_STOCK' ||
                    (v.stock <= 0 && v.stockStatus !== 'PRE_ORDER');

                  const displayLabel = v.size || v.label || v.sku;

                  return (
                    <button
                      key={idKey}
                      type="button"
                      onClick={() => setSelectedVariantId(idKey)}
                      disabled={variantOOS}
                      className={`min-w-10 px-3 h-10 text-xs font-bold border transition relative cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : variantOOS
                          ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through'
                          : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{displayLabel}</span>
                      {v.price && v.price !== product.basePrice && (
                        <span className="text-[10px] opacity-75 font-normal ml-0.5">
                          ({v.discountPrice ?? v.price}৳)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isOutOfStock && (
                <p className="text-xs text-red-600 font-medium">Selected option is currently out of stock.</p>
              )}
            </div>
          )}

          {/* Modifier Groups / Add-ons (e.g. Toppings, Accessories, Packaging) */}
          {modifierGroups.length > 0 && (
            <div className="space-y-4 mb-6 pt-3 border-t border-zinc-100">
              {modifierGroups.map((group) => {
                const selected = selectedModifiers[group.name] || [];
                return (
                  <div key={group.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                        {group.name}
                        {group.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {group.maxSelect === 1 ? 'Choose 1' : `Up to ${group.maxSelect}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map((opt) => {
                        const isChecked = selected.includes(opt.label);
                        const disabled = !opt.isAvailable;

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleModifierToggle(group, opt.label)}
                            className={`p-2.5 text-xs text-left border rounded transition flex items-center justify-between cursor-pointer ${
                              isChecked
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : disabled
                                ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed'
                                : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-[11px] font-bold">
                              {opt.priceDelta > 0 ? `+৳${opt.priceDelta}` : 'Free'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
              {isOutOfStock ? 'SOLD OUT' : isPreOrder ? 'PRE-ORDER TO CART' : 'ADD TO CART'}
            </button>
          </div>

          {/* Full-Width Primary ORDER NOW Button */}
          <button
            onClick={() => handleAdd(true)}
            disabled={isOutOfStock}
            style={{ backgroundColor: isOutOfStock ? '#A1A1AA' : accentColor }}
            className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-95 cursor-pointer disabled:opacity-40 mb-5"
          >
            {isOutOfStock ? 'OUT OF STOCK' : isPreOrder ? 'PRE-ORDER NOW' : 'ORDER NOW'}
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
            { id: 'ADDITIONAL', label: hasSpecs ? 'SPECIFICATIONS' : 'ADDITIONAL INFORMATION' },
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
              {product.collections?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-zinc-900 mb-1">Collections & Tags</h4>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    {product.collections.join(' • ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ADDITIONAL' && (
            <div className="border border-zinc-200 p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold text-zinc-900">Product Type:</span>
                <span>{product.productType || 'Standard'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-bold text-zinc-900">Category:</span>
                <span>{product.categoryName || 'General'}</span>
              </div>
              {product.brandName && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-zinc-900">Brand:</span>
                  <span>{product.brandName}</span>
                </div>
              )}

              {/* Technical Specifications for Gadgets */}
              {hasSpecs && (
                <div className="pt-4 border-t border-zinc-200 space-y-3">
                  <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-xs">
                    Technical Specifications
                  </h4>
                  {product.specifications.map((group: SpecificationGroup) => (
                    <div key={group.groupName} className="space-y-1.5 pt-2">
                      <h5 className="font-semibold text-zinc-800 text-xs">{group.groupName}</h5>
                      <div className="divide-y divide-zinc-100 bg-zinc-50 rounded p-2">
                        {group.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-2 py-1 text-xs">
                            <span className="text-zinc-500">{item.label}</span>
                            <span className="font-medium text-zinc-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {product.productType === 'CLOTHING' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                  <span className="font-bold text-zinc-900">Wash Care:</span>
                  <span>Gentle cold machine wash inside out. Do not bleach or tumble dry.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'POLICY' && (
            <div className="space-y-3 text-xs sm:text-sm text-zinc-700">
              <p>
                <strong>1. Cash on Delivery Nationwide:</strong> You may open and inspect the parcel in front of the delivery rider before completing payment.
              </p>
              <p>
                <strong>2. Easy Replacement Guarantee:</strong> If the product is defective or does not match specifications, contact our hotline within 72 hours for prompt resolution.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal (Clothing only) */}
      {isSizeGuideOpen && hasSizeChart && (
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
                {product.sizeChart.map((row: SizeChartItem) => (
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
              * Measurements are in inches. Fits true to size with a tailored drop.
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
            {relatedProducts.slice(0, 4).map((rel: any) => (
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
