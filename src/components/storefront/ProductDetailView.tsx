'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Ruler, X, Play, Volume2, VolumeX, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from './ProductCard';
import type { StockStatus } from '@/models/Product';

function extractYouTubeId(url: string): string | null {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
}

interface VariantSelectedOption {
  name: string;
  value: string;
}

interface Variant {
  _id?: string;
  sku: string;
  title?: string;
  label?: string;
  size?: string;
  colorName?: string;
  colorHex?: string;
  selectedOptions?: VariantSelectedOption[];
  attributes?: { key: string; value: string }[];
  price?: number;
  discountPrice?: number;
  costPrice?: number;
  stock: number;
  stockStatus?: StockStatus;
  image?: { url: string; key?: string };
  isDefault?: boolean;
  isActive?: boolean;
}

interface VariantOptionValue {
  label: string;
  meta?: string;
}

interface VariantOptionGroup {
  name: string;
  values: VariantOptionValue[];
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
  dhakaSuburbsFee?: number;
  outsideDhakaFee?: number;
  showroomAddress?: string;
}

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#111111',
  'midnight black': '#111111',
  white: '#FFFFFF',
  'pure white': '#FFFFFF',
  zinc: '#71717A',
  grey: '#9CA3AF',
  gray: '#9CA3AF',
  'sand dune': '#C2A68D',
  sand: '#C2A68D',
  beige: '#F5F5DC',
  taupe: '#87756B',
  brown: '#5C4033',
  chocolate: '#3E2723',
  'emerald moss green': '#1b4d3e',
  emerald: '#046A38',
  'moss green': '#4A5D4E',
  green: '#15803D',
  olive: '#556B2F',
  maroon: '#800000',
  burgundy: '#800020',
  plum: '#581845',
  navy: '#0F172A',
  blue: '#1E3A8A',
  pink: '#F472B6',
  'baby pink': '#FBCFE8',
  gold: '#D4AF37',
  khaki: '#C3B091',
};

function resolveColorHex(label: string, meta?: string): string {
  if (meta && (meta.startsWith('#') || meta.startsWith('rgb'))) return meta;
  const key = label.trim().toLowerCase();
  return COLOR_HEX_MAP[key] || '#71717A';
}

export default function ProductDetailView({
  product,
  relatedProducts,
  accentColor = '#B8860B',
  insideDhakaFee = 70,
  dhakaSuburbsFee = 100,
  outsideDhakaFee = 130,
  showroomAddress = 'Banani 11, Dhaka',
}: ProductDetailProps) {
  const { addToCart } = useCart();
  const [isJustAdded, setIsJustAdded] = useState(false);

  const hasVariants = product.hasVariants !== false && (product.variants?.length || 0) > 0;
  const activeVariants: Variant[] = useMemo(() => {
    return hasVariants
      ? (product.variants as Variant[]).filter((v) => v.isActive !== false)
      : [];
  }, [hasVariants, product.variants]);

  // Extract or derive option groups (e.g. Size, Color)
  const optionGroups = useMemo<VariantOptionGroup[]>(() => {
    if (!hasVariants || activeVariants.length === 0) return [];

    if (product.variantOptions && Array.isArray(product.variantOptions) && product.variantOptions.length > 0) {
      return product.variantOptions;
    }

    // Dynamic derivation from variants
    const groupMap = new Map<string, Map<string, string | undefined>>();

    activeVariants.forEach((v) => {
      if (v.selectedOptions && Array.isArray(v.selectedOptions) && v.selectedOptions.length > 0) {
        v.selectedOptions.forEach((so) => {
          if (!groupMap.has(so.name)) groupMap.set(so.name, new Map());
          const meta = so.name.toLowerCase() === 'color' ? v.colorHex : undefined;
          groupMap.get(so.name)!.set(so.value, meta);
        });
      } else if (v.label && v.label.includes(' / ')) {
        const parts = v.label.split(' / ').map((s) => s.trim());
        if (parts.length === 2) {
          if (!groupMap.has('Size')) groupMap.set('Size', new Map());
          if (!groupMap.has('Color')) groupMap.set('Color', new Map());
          groupMap.get('Size')!.set(parts[0], undefined);
          groupMap.get('Color')!.set(parts[1], v.colorHex);
        }
      } else if (v.size) {
        if (!groupMap.has('Size')) groupMap.set('Size', new Map());
        groupMap.get('Size')!.set(v.size, undefined);
        if (v.colorName) {
          if (!groupMap.has('Color')) groupMap.set('Color', new Map());
          groupMap.get('Color')!.set(v.colorName, v.colorHex);
        }
      }
    });

    if (groupMap.size > 0) {
      return Array.from(groupMap.entries()).map(([name, valMap]) => ({
        name,
        values: Array.from(valMap.entries()).map(([label, meta]) => ({ label, meta })),
      }));
    }

    return [
      {
        name: 'Option',
        values: activeVariants.map((v) => ({ label: v.label || v.size || v.sku || 'Default' })),
      },
    ];
  }, [hasVariants, activeVariants, product.variantOptions]);

  // Default variant selection
  const defaultVariant = useMemo(() => {
    return (
      activeVariants.find((v) => v.isDefault) ||
      activeVariants.find(
        (v) =>
          v.stockStatus !== 'FORCE_OUT_OF_STOCK' &&
          (v.stock > 0 || v.stockStatus === 'PRE_ORDER')
      ) ||
      activeVariants[0]
    );
  }, [activeVariants]);

  // Client-side Option Selection Map (e.g. { Size: '54', Color: 'Sand Dune' })
  const [selectedOptionMap, setSelectedOptionMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (defaultVariant?.selectedOptions && defaultVariant.selectedOptions.length > 0) {
      defaultVariant.selectedOptions.forEach((so) => {
        initial[so.name] = so.value;
      });
    } else if (defaultVariant?.label && defaultVariant.label.includes(' / ')) {
      const parts = defaultVariant.label.split(' / ').map((s) => s.trim());
      if (parts.length === 2) {
        initial['Size'] = parts[0];
        initial['Color'] = parts[1];
      }
    } else if (defaultVariant?.size) {
      initial['Size'] = defaultVariant.size;
      if (defaultVariant.colorName) {
        initial['Color'] = defaultVariant.colorName;
      }
    }
    return initial;
  });

  // Ensure all option groups are populated
  useEffect(() => {
    if (optionGroups.length === 0) return;
    setSelectedOptionMap((prev) => {
      let changed = false;
      const next = { ...prev };
      optionGroups.forEach((group) => {
        if (!next[group.name] && group.values.length > 0) {
          next[group.name] = group.values[0].label;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [optionGroups]);

  // Intersecting Variant Matcher
  const selectedVariant = useMemo(() => {
    if (!hasVariants || activeVariants.length === 0) return null;

    // 1. Exact match across all selected options
    const exact = activeVariants.find((v) => {
      if (v.selectedOptions && v.selectedOptions.length > 0) {
        return Object.entries(selectedOptionMap).every(([groupName, optVal]) =>
          v.selectedOptions?.some(
            (so) =>
              so.name.toLowerCase() === groupName.toLowerCase() &&
              so.value.toLowerCase() === optVal.toLowerCase()
          )
        );
      }
      return Object.values(selectedOptionMap).every((val) => {
        const vLabel = (v.label || v.title || v.sku || '').toLowerCase();
        const vSize = (v.size || '').toLowerCase();
        const vColor = (v.colorName || '').toLowerCase();
        const target = val.toLowerCase();
        return vLabel.includes(target) || vSize === target || vColor === target;
      });
    });

    if (exact) return exact;

    // 2. Partial match fallback
    const partial = activeVariants.find((v) => {
      return Object.values(selectedOptionMap).some((val) => {
        const target = val.toLowerCase();
        return (
          v.selectedOptions?.some((so) => so.value.toLowerCase() === target) ||
          (v.label || '').toLowerCase().includes(target) ||
          (v.size || '').toLowerCase() === target
        );
      });
    });

    return partial || defaultVariant || activeVariants[0];
  }, [hasVariants, activeVariants, selectedOptionMap, defaultVariant]);

  // Modifiers state: groupName -> array of selected labels
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});

  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'ADDITIONAL' | 'POLICY'>('DESCRIPTION');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Images resolution (supports variant specific image override)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = (product.media?.length > 0 ? product.media : (product as any).images?.length > 0 ? (product as any).images : null) || [
    { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', key: '', type: 'IMAGE' },
  ];

  // Resolve active gallery display with user override precedence
  const currentMedia = images[activeGalleryIdx] || images[0];
  const isCurrentVideo = currentMedia?.type === 'VIDEO';
  const currentImage =
    currentMedia?.url || selectedVariant?.image?.url || images[0]?.url;

  // Handle option select with auto image sync
  const handleOptionSelect = (groupName: string, value: string) => {
    const nextMap = { ...selectedOptionMap, [groupName]: value };
    setSelectedOptionMap(nextMap);

    const matched = activeVariants.find((v) => {
      if (v.selectedOptions && v.selectedOptions.length > 0) {
        return Object.entries(nextMap).every(([g, val]) =>
          v.selectedOptions?.some(
            (so) => so.name.toLowerCase() === g.toLowerCase() && so.value.toLowerCase() === val.toLowerCase()
          )
        );
      }
      return Object.values(nextMap).every((val) => {
        const target = val.toLowerCase();
        return (
          (v.label || '').toLowerCase().includes(target) ||
          (v.size || '').toLowerCase() === target
        );
      });
    });

    if (matched?.image?.url) {
      const idx = images.findIndex((img: { url: string }) => img.url === matched.image?.url);
      if (idx !== -1) {
        setActiveGalleryIdx(idx);
      }
    }
  };

  // Option availability helper
  const isOptionAvailable = (groupName: string, value: string) => {
    const testMap = { ...selectedOptionMap, [groupName]: value };
    const v = activeVariants.find((variant) => {
      if (variant.selectedOptions && variant.selectedOptions.length > 0) {
        return Object.entries(testMap).every(([g, val]) =>
          variant.selectedOptions?.some(
            (so) => so.name.toLowerCase() === g.toLowerCase() && so.value.toLowerCase() === val.toLowerCase()
          )
        );
      }
      return Object.values(testMap).every((val) => {
        const target = val.toLowerCase();
        return (
          (variant.label || '').toLowerCase().includes(target) ||
          (variant.size || '').toLowerCase() === target
        );
      });
    });

    if (!v) return false;
    return v.stockStatus !== 'FORCE_OUT_OF_STOCK' && (v.stock > 0 || v.stockStatus === 'PRE_ORDER');
  };

  // 1. PRICE RESOLUTION LOGIC:
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
        const isCurrent = current.includes(optionLabel);
        if (isCurrent && !group.isRequired) {
          return { ...prev, [group.name]: [] };
        }
        return { ...prev, [group.name]: [optionLabel] };
      } else {
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

    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1200);

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
        size: selectedOptionMap['Size'] || selectedVariant?.size || '',
        variantLabel:
          selectedVariant?.title ||
          selectedVariant?.label ||
          Object.values(selectedOptionMap).join(' / ') ||
          '',
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
            {isCurrentVideo ? (
              currentMedia.videoProvider === 'YOUTUBE' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(currentMedia.url)}?autoplay=1&mute=1&loop=1&playsinline=1`}
                  title={product.title}
                  className="w-full h-full border-0 object-cover"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video
                    src={currentMedia.url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition active:scale-[0.98] duration-75 cursor-pointer z-20"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              )
            ) : (
              <Image
                src={currentImage}
                alt={product.title}
                fill
                priority
                className="object-cover object-center"
              />
            )}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
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
              {images.map((img: any, i: number) => {
                const isVid = img.type === 'VIDEO';
                const thumbSrc = img.thumbnailUrl || (isVid ? '/placeholder.webp' : img.url);

                return (
                  <button
                    key={i}
                    onClick={() => setActiveGalleryIdx(i)}
                    className={`relative w-20 aspect-[3/4] border overflow-hidden cursor-pointer shrink-0 transition active:scale-[0.98] duration-75 ${
                      activeGalleryIdx === i ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={thumbSrc} alt="" fill className="object-cover" />
                    {isVid && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-xs">
                          <Play className="w-3 h-3 fill-zinc-900 ml-0.5" />
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
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

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-1.5">
            {product.title}
          </h1>

          {/* Product Code / SKU Display (matches reference: 'Product Code: 251811K') */}
          <p className="text-xs text-zinc-500 font-medium mb-3">
            Product Code:{' '}
            <span className="text-zinc-800 font-mono font-semibold">
              {selectedVariant?.sku || product.sku || 'N/A'}
            </span>
          </p>

          {/* Price Row */}
          <div className="flex items-baseline gap-3 mb-4">
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

          {/* Variant Selector (Separated Size Pills & Color Swatches) */}
          {hasVariants && optionGroups.length > 0 && (
            <div className="space-y-5 mb-6 pt-2 border-t border-zinc-100">
              {optionGroups.map((group) => {
                const isColor =
                  group.name.toLowerCase() === 'color' ||
                  group.name.toLowerCase() === 'shade' ||
                  group.values.some((v) => Boolean(v.meta));
                const isSize = group.name.toLowerCase() === 'size';
                const currentSelectedVal = selectedOptionMap[group.name] || group.values[0]?.label;

                return (
                  <div key={group.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                        {group.name}: <strong className="text-zinc-950 font-semibold">{currentSelectedVal}</strong>
                      </span>

                      {isSize && hasSizeChart && (
                        <button
                          type="button"
                          onClick={() => setIsSizeGuideOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition active:scale-[0.98] duration-75 cursor-pointer"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Size Guide</span>
                        </button>
                      )}
                    </div>

                    {isColor ? (
                      /* Color Swatches Row */
                      <div className="flex flex-wrap gap-2.5 pt-0.5">
                        {group.values.map((val) => {
                          const isSelected = currentSelectedVal === val.label;
                          const isAvailable = isOptionAvailable(group.name, val.label);
                          const hex = resolveColorHex(val.label, val.meta);
                          const isWhite = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fff';

                          return (
                            <button
                              key={val.label}
                              type="button"
                              onClick={() => handleOptionSelect(group.name, val.label)}
                              className={`group flex items-center gap-2 px-3.5 py-2 rounded-sm border text-xs font-medium transition active:scale-[0.98] duration-75 cursor-pointer ${
                                isSelected
                                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                                  : !isAvailable
                                  ? 'border-zinc-200 bg-zinc-50 text-zinc-400 opacity-60'
                                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400'
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-full shrink-0 border transition ${
                                  isWhite ? 'border-zinc-300' : 'border-black/20'
                                } ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-950' : ''}`}
                                style={{ backgroundColor: hex }}
                              />
                              <span>{val.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Size Pills Row / Standard Option Pills */
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {group.values.map((val) => {
                          const isSelected = currentSelectedVal === val.label;
                          const isAvailable = isOptionAvailable(group.name, val.label);

                          return (
                            <button
                              key={val.label}
                              type="button"
                              onClick={() => handleOptionSelect(group.name, val.label)}
                              className={`min-w-11 px-3.5 h-10 rounded-sm text-xs font-semibold border transition active:scale-[0.98] duration-75 cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                                  : !isAvailable
                                  ? 'bg-zinc-50 text-zinc-300 border-zinc-200 line-through'
                                  : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                              }`}
                            >
                              {val.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic Live Stock Badge (Selling Fast / Out of Stock / In Stock) */}
              {selectedVariant && (
                <div className="pt-1">
                  {isOutOfStock ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Sold Out — Currently Unavailable
                    </div>
                  ) : isPreOrder ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Pre-Order — Dispatches in 5–7 Days
                    </div>
                  ) : selectedVariant.stock > 0 && selectedVariant.stock <= 3 ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold tracking-tight">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      ONLY {selectedVariant.stock} LEFT — SELLING FAST
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      In Stock — Ready to Dispatch
                    </div>
                  )}
                </div>
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
                            className={`p-2.5 text-xs text-left border rounded transition active:scale-[0.98] duration-75 flex items-center justify-between cursor-pointer ${
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
                className="px-3 py-3 text-zinc-600 hover:text-zinc-950 transition active:scale-[0.98] duration-75 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-3 text-zinc-600 hover:text-zinc-950 transition active:scale-[0.98] duration-75 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => handleAdd(false)}
              disabled={isOutOfStock}
              className={`flex-1 py-3.5 px-6 text-xs font-bold uppercase tracking-[0.18em] transition active:scale-[0.98] duration-75 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 ${
                isJustAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-zinc-900'
              }`}
            >
              {isJustAdded ? (
                <>
                  <Check className="w-4 h-4 animate-in zoom-in duration-150" />
                  <span>ADDED TO BAG!</span>
                </>
              ) : isOutOfStock ? (
                'SOLD OUT'
              ) : isPreOrder ? (
                'PRE-ORDER TO CART'
              ) : (
                'ADD TO CART'
              )}
            </button>
          </div>

          {/* Full-Width Primary ORDER NOW Button */}
          <button
            onClick={() => handleAdd(true)}
            disabled={isOutOfStock}
            style={{ backgroundColor: isOutOfStock ? '#A1A1AA' : accentColor }}
            className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition active:scale-[0.98] duration-75 hover:opacity-95 cursor-pointer disabled:opacity-40 mb-5"
          >
            {isOutOfStock ? 'OUT OF STOCK' : isPreOrder ? 'PRE-ORDER NOW' : 'ORDER NOW'}
          </button>

          {/* 3-Zone Delivery & Showroom Info */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
            <p>
              <strong className="text-zinc-900">Express Delivery:</strong> Inside Dhaka (৳{insideDhakaFee}) • Suburbs (৳{dhakaSuburbsFee}) • Outside Dhaka (৳{outsideDhakaFee})
            </p>
            <p>
              <strong className="text-zinc-900">Showroom & Collection:</strong> {showroomAddress}
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
              className={`pb-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition active:scale-[0.98] duration-75 cursor-pointer ${
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
                className="text-zinc-400 hover:text-zinc-900 transition active:scale-[0.98] duration-75 cursor-pointer"
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
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard
                key={String(rel._id)}
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
