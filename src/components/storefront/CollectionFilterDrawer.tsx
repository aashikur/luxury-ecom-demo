'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, X, Check, ArrowUpDown, RotateCcw } from 'lucide-react';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'title-asc', label: 'Alphabetically, A-Z' },
  { value: 'title-desc', label: 'Alphabetically, Z-A' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'date-asc', label: 'Date, old to new' },
  { value: 'date-desc', label: 'Date, new to old' },
  { value: 'relevant', label: 'Most Relevant' },
];

interface CollectionFilterDrawerProps {
  totalCount: number;
  accentColor?: string;
}

export default function CollectionFilterDrawer({
  totalCount,
  accentColor = '#076E46',
}: CollectionFilterDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const currentSort = searchParams.get('sort') || 'featured';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(currentInStock);

  // Sync state when URL params change
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
    setInStockOnly(currentInStock);
  }, [currentMinPrice, currentMaxPrice, currentInStock]);

  const activeFilterCount = [
    currentInStock ? 1 : 0,
    currentMinPrice ? 1 : 0,
    currentMaxPrice ? 1 : 0,
    currentSort !== 'featured' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const applyFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset to page 1 on filter change
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ sort: e.target.value === 'featured' ? null : e.target.value });
  };

  const handleApplyPriceAndStock = () => {
    applyFilters({
      minPrice: minPriceInput.trim() ? minPriceInput.trim() : null,
      maxPrice: maxPriceInput.trim() ? maxPriceInput.trim() : null,
      inStock: inStockOnly ? 'true' : null,
    });
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStockOnly(false);
    applyFilters({
      minPrice: null,
      maxPrice: null,
      inStock: null,
      sort: null,
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-6 border-b border-zinc-200">
        {/* Left: Filter Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-zinc-300 rounded text-xs font-bold uppercase tracking-wider text-zinc-900 hover:border-zinc-900 bg-white transition active:scale-[0.98] duration-75 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                style={{ backgroundColor: accentColor }}
                className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 tracking-wider uppercase transition active:scale-[0.98] duration-75 cursor-pointer"
            >
              Clear All
            </button>
          )}

          <span className="text-xs text-zinc-400 font-medium">
            {totalCount} {totalCount === 1 ? 'garment' : 'garments'}
          </span>
        </div>

        {/* Right: 9-Tier Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="collection-sort-select" className="text-zinc-500 font-medium uppercase tracking-wider hidden sm:inline-block">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="collection-sort-select"
              value={currentSort}
              onChange={handleSortChange}
              className="appearance-none bg-white border border-zinc-300 rounded px-3 py-1.5 pr-8 text-xs font-semibold text-zinc-900 hover:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer transition active:scale-[0.98] duration-75"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Slide-Over Faceted Filter Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                  Filter Catalog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 transition active:scale-[0.98] duration-75 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* In-Stock Filter */}
              <div className="space-y-3 pb-5 border-b border-zinc-100">
                <h4 className="font-bold uppercase tracking-wider text-zinc-900">Availability</h4>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-zinc-700 font-medium">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 cursor-pointer"
                  />
                </label>
              </div>

              {/* Price Range */}
              <div className="space-y-3 pb-5 border-b border-zinc-100">
                <h4 className="font-bold uppercase tracking-wider text-zinc-900">
                  Price Range (BDT ৳)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full border border-zinc-300 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full border border-zinc-300 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-zinc-900">Price Presets</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Under ৳2,000', min: '', max: '2000' },
                    { label: '৳2,000 - ৳5,000', min: '2000', max: '5000' },
                    { label: 'Above ৳5,000', min: '5000', max: '' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setMinPriceInput(preset.min);
                        setMaxPriceInput(preset.max);
                      }}
                      className="px-2.5 py-1 border border-zinc-200 rounded text-[11px] font-medium text-zinc-700 hover:border-zinc-900 hover:text-zinc-950 transition active:scale-[0.98] duration-75 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-zinc-300 rounded text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-white transition active:scale-[0.98] duration-75 cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyPriceAndStock}
                style={{ backgroundColor: accentColor }}
                className="flex-1 py-2.5 text-white rounded text-xs font-bold uppercase tracking-wider hover:opacity-90 transition active:scale-[0.98] duration-75 cursor-pointer text-center shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
