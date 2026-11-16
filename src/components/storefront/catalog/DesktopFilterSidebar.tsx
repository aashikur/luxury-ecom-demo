'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import PriceRangeSlider from './PriceRangeSlider';
import { CatalogFilterFacets } from '@/services/product.service';

interface DesktopFilterSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collections: any[];
  facets: CatalogFilterFacets;
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

export default function DesktopFilterSidebar({
  categories = [],
  collections = [],
  facets,
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
}: DesktopFilterSidebarProps) {
  // Accordion open/close states
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

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedCollections.length > 0 ||
    selectedSizes.length > 0 ||
    selectedStock !== '' ||
    minPrice != null ||
    maxPrice != null;

  return (
    <div className="w-full space-y-6 select-none">
      {/* 1. Header with Reset Trigger */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-900">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 2. Categories Accordion */}
      {categories.length > 0 && lockedDimension !== 'category' && (
        <div className="border-b border-zinc-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-[#076E46] transition py-1 cursor-pointer"
          >
            <span>Categories</span>
            {openSections.categories ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {openSections.categories && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {categories.map((cat) => {
                const isChecked = selectedCategories.includes(cat.slug.toLowerCase());
                const count = facets.categoryCounts[cat.slug] || 0;

                return (
                  <label
                    key={cat._id || cat.slug}
                    className="flex items-center justify-between py-1 px-1 rounded hover:bg-zinc-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onCategoryToggle(cat.slug)}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-[#076E46] focus:ring-[#076E46] accent-[#076E46] cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          isChecked
                            ? 'font-bold text-zinc-950'
                            : 'font-normal text-zinc-700 group-hover:text-zinc-950'
                        }`}
                      >
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

      {/* 3. Price Range Slider Accordion */}
      <div className="border-b border-zinc-100 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-[#076E46] transition py-1 cursor-pointer"
        >
          <span>Price (BDT)</span>
          {openSections.price ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
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

      {/* 4. Size & Fit Matrix Accordion */}
      {facets.availableSizes && facets.availableSizes.length > 0 && (
        <div className="border-b border-zinc-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection('sizes')}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-[#076E46] transition py-1 cursor-pointer"
          >
            <span>Size & Fit</span>
            {openSections.sizes ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
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
                    className={`min-w-[40px] px-2.5 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition active:scale-[0.98] duration-75 cursor-pointer ${
                      isSelected
                        ? 'text-white border-transparent shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-950'
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

      {/* 5. Availability Accordion */}
      <div className="border-b border-zinc-100 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('availability')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-[#076E46] transition py-1 cursor-pointer"
        >
          <span>Availability</span>
          {openSections.availability ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {openSections.availability && (
          <div className="mt-3 space-y-2 text-xs">
            <label className="flex items-center gap-2.5 py-0.5 cursor-pointer hover:text-zinc-950 transition">
              <input
                type="radio"
                name="stockStatusDesktop"
                checked={selectedStock === ''}
                onChange={() => onStockChange('')}
                className="w-3.5 h-3.5 text-[#076E46] focus:ring-[#076E46] accent-[#076E46]"
              />
              <span className="text-zinc-700">All Products</span>
            </label>

            <label className="flex items-center gap-2.5 py-0.5 cursor-pointer hover:text-zinc-950 transition">
              <input
                type="radio"
                name="stockStatusDesktop"
                checked={selectedStock === 'in-stock'}
                onChange={() => onStockChange('in-stock')}
                className="w-3.5 h-3.5 text-[#076E46] focus:ring-[#076E46] accent-[#076E46]"
              />
              <span className="text-zinc-700 font-medium">In Stock Only (Ready to Ship)</span>
            </label>

            <label className="flex items-center gap-2.5 py-0.5 cursor-pointer hover:text-zinc-950 transition">
              <input
                type="radio"
                name="stockStatusDesktop"
                checked={selectedStock === 'pre-order'}
                onChange={() => onStockChange('pre-order')}
                className="w-3.5 h-3.5 text-[#076E46] focus:ring-[#076E46] accent-[#076E46]"
              />
              <span className="text-zinc-700 font-medium">Pre-Order Drops</span>
            </label>
          </div>
        )}
      </div>

      {/* 6. Collections Accordion (When not locked to a single collection) */}
      {collections.length > 0 && lockedDimension !== 'collection' && (
        <div className="border-b border-zinc-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection('collections')}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-[#076E46] transition py-1 cursor-pointer"
          >
            <span>Collections</span>
            {openSections.collections ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {openSections.collections && (
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {collections.map((col) => {
                const isChecked = selectedCollections.includes(col.slug.toLowerCase());
                const count = facets.collectionCounts[col.slug] || 0;

                return (
                  <label
                    key={col._id || col.slug}
                    className="flex items-center justify-between py-1 px-1 rounded hover:bg-zinc-50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onCollectionToggle(col.slug)}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-[#076E46] focus:ring-[#076E46] accent-[#076E46] cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          isChecked
                            ? 'font-bold text-zinc-950'
                            : 'font-normal text-zinc-700 group-hover:text-zinc-950'
                        }`}
                      >
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
  );
}
