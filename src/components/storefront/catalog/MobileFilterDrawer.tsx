'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import PriceRangeSlider from './PriceRangeSlider';
import { CatalogFilterFacets } from '@/services/product.service';

interface MobileFilterDrawerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collections: any[];
  facets: CatalogFilterFacets;
  totalResults: number;
  activeFilterCount: number;
  selectedCategories: string[];
  selectedCollections: string[];
  selectedSizes: string[];
  selectedStock: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  lockedDimension?: 'collection' | 'category';
  accentColor?: string;
  onCategoryToggle: (slug: string) => void;
  onCollectionToggle: (slug: string) => void;
  onSizeToggle: (size: string) => void;
  onStockChange: (val: string) => void;
  onPriceChange: (min: number | null, max: number | null) => void;
  onResetAll: () => void;
}

export default function MobileFilterDrawer({
  categories = [],
  collections = [],
  facets,
  totalResults,
  activeFilterCount,
  selectedCategories = [],
  selectedCollections = [],
  selectedSizes = [],
  selectedStock = '',
  minPrice,
  maxPrice,
  lockedDimension,
  accentColor = '#076E46',
  onCategoryToggle,
  onCollectionToggle,
  onSizeToggle,
  onStockChange,
  onPriceChange,
  onResetAll,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Accordion state inside mobile drawer
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    sizes: true,
    availability: true,
    collections: lockedDimension !== 'collection',
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Sticky Filter Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-zinc-300 bg-white shadow-xs text-xs font-bold text-zinc-900 active:scale-[0.98] duration-75 cursor-pointer"
        aria-label="Open catalog filter drawer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-700" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span
            style={{ backgroundColor: accentColor }}
            className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none"
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Off-Canvas Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="h-16 px-6 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                  Refine Catalog
                </h3>
                {activeFilterCount > 0 && (
                  <span
                    style={{ backgroundColor: accentColor }}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  >
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition rounded-md"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Categories */}
              {categories.length > 0 && lockedDimension !== 'category' && (
                <div className="border-b border-zinc-100 pb-5">
                  <button
                    type="button"
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 py-1"
                  >
                    <span>Categories</span>
                    {openSections.categories ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {openSections.categories && (
                    <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                      {categories.map((cat) => {
                        const isChecked = selectedCategories.includes(cat.slug.toLowerCase());
                        const count = facets.categoryCounts[cat.slug] || 0;

                        return (
                          <label
                            key={cat._id || cat.slug}
                            className="flex items-center justify-between py-1 px-1 rounded active:bg-zinc-100"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onCategoryToggle(cat.slug)}
                                className="w-4 h-4 rounded border-zinc-300 text-[#076E46] accent-[#076E46]"
                              />
                              <span className="text-xs text-zinc-800">
                                {cat.name || cat.title}
                              </span>
                            </div>
                            {count > 0 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ({count})
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Price Range */}
              <div className="border-b border-zinc-100 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 py-1"
                >
                  <span>Price (BDT)</span>
                  {openSections.price ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {openSections.price && (
                  <div className="mt-3">
                    <PriceRangeSlider
                      minLimit={facets.minCatalogPrice}
                      maxLimit={facets.maxCatalogPrice}
                      initialMin={minPrice ?? undefined}
                      initialMax={maxPrice ?? undefined}
                      accentColor={accentColor}
                      onChange={onPriceChange}
                    />
                  </div>
                )}
              </div>

              {/* Sizes */}
              {facets.availableSizes && facets.availableSizes.length > 0 && (
                <div className="border-b border-zinc-100 pb-5">
                  <button
                    type="button"
                    onClick={() => toggleSection('sizes')}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 py-1"
                  >
                    <span>Size & Fit</span>
                    {openSections.sizes ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {openSections.sizes && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {facets.availableSizes.map((sz) => {
                        const isSelected = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => onSizeToggle(sz)}
                            style={{
                              backgroundColor: isSelected ? accentColor : undefined,
                              borderColor: isSelected ? accentColor : undefined,
                            }}
                            className={`min-w-[42px] px-3 py-2 rounded text-xs font-bold uppercase tracking-wide border transition active:scale-[0.98] ${
                              isSelected
                                ? 'text-white border-transparent'
                                : 'bg-white text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Availability */}
              <div className="border-b border-zinc-100 pb-5">
                <button
                  type="button"
                  onClick={() => toggleSection('availability')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 py-1"
                >
                  <span>Availability</span>
                  {openSections.availability ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {openSections.availability && (
                  <div className="mt-3 space-y-2.5 text-xs">
                    <label className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="stockStatusMobile"
                        checked={selectedStock === ''}
                        onChange={() => onStockChange('')}
                        className="w-4 h-4 text-[#076E46] accent-[#076E46]"
                      />
                      <span className="text-zinc-700">All Products</span>
                    </label>

                    <label className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="stockStatusMobile"
                        checked={selectedStock === 'in-stock'}
                        onChange={() => onStockChange('in-stock')}
                        className="w-4 h-4 text-[#076E46] accent-[#076E46]"
                      />
                      <span className="text-zinc-800 font-medium">In Stock Only (Ready to Deliver)</span>
                    </label>

                    <label className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="stockStatusMobile"
                        checked={selectedStock === 'pre-order'}
                        onChange={() => onStockChange('pre-order')}
                        className="w-4 h-4 text-[#076E46] accent-[#076E46]"
                      />
                      <span className="text-zinc-800 font-medium">Pre-Order Drops</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Collections */}
              {collections.length > 0 && lockedDimension !== 'collection' && (
                <div className="border-b border-zinc-100 pb-5">
                  <button
                    type="button"
                    onClick={() => toggleSection('collections')}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 py-1"
                  >
                    <span>Collections</span>
                    {openSections.collections ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {openSections.collections && (
                    <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                      {collections.map((col) => {
                        const isChecked = selectedCollections.includes(col.slug.toLowerCase());
                        const count = facets.collectionCounts[col.slug] || 0;

                        return (
                          <label
                            key={col._id || col.slug}
                            className="flex items-center justify-between py-1 px-1 rounded active:bg-zinc-100"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onCollectionToggle(col.slug)}
                                className="w-4 h-4 rounded border-zinc-300 text-[#076E46] accent-[#076E46]"
                              />
                              <span className="text-xs text-zinc-800">
                                {col.title}
                              </span>
                            </div>
                            {count > 0 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ({count})
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-zinc-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={onResetAll}
                className="flex-1 py-3 text-xs font-semibold text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded transition active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ backgroundColor: accentColor }}
                className="flex-2 py-3 text-xs font-bold uppercase tracking-wider text-white rounded transition active:scale-[0.98] shadow-md flex items-center justify-center"
              >
                <span>View {totalResults} Garments</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
