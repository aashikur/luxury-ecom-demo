'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DesktopFilterSidebar from './DesktopFilterSidebar';
import MobileFilterDrawer from './MobileFilterDrawer';
import AppliedFilterChips, { ActiveFilterItem } from './AppliedFilterChips';
import SortDropdown from './SortDropdown';
import { CatalogFilterFacets } from '@/services/product.service';

export interface CatalogFilterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collections?: any[];
  facets: CatalogFilterFacets;
  totalResults: number;
  lockedDimension?: 'collection' | 'category';
  accentColor?: string;
  children?: React.ReactNode;
}

export default function CatalogFilter({
  categories = [],
  collections = [],
  facets,
  totalResults,
  lockedDimension,
  accentColor = '#076E46',
  children,
}: CatalogFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Extract active query params
  const currentCategories = (searchParams.get('category') || '')
    .split(',')
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const currentCollections = (searchParams.get('collection') || '')
    .split(',')
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const currentSizes = (searchParams.get('size') || '')
    .split(',')
    .filter(Boolean);

  const currentStock = searchParams.get('inStock') === 'true'
    ? 'in-stock'
    : searchParams.get('stockStatus') === 'PRE_ORDER'
    ? 'pre-order'
    : '';

  const currentMinPrice = searchParams.get('minPrice')
    ? parseFloat(searchParams.get('minPrice')!)
    : null;

  const currentMaxPrice = searchParams.get('maxPrice')
    ? parseFloat(searchParams.get('maxPrice')!)
    : null;

  const currentSort = searchParams.get('sort') || 'relevant';

  // Core URL parameter updater
  const updateParams = (mutations: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(mutations).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset pagination to page 1 on filter changes
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Toggle category in array
  const handleCategoryToggle = (slug: string) => {
    const lower = slug.toLowerCase();
    const updated = currentCategories.includes(lower)
      ? currentCategories.filter((c) => c !== lower)
      : [...currentCategories, lower];

    updateParams({ category: updated.length > 0 ? updated.join(',') : null });
  };

  // Toggle collection in array
  const handleCollectionToggle = (slug: string) => {
    const lower = slug.toLowerCase();
    const updated = currentCollections.includes(lower)
      ? currentCollections.filter((c) => c !== lower)
      : [...currentCollections, lower];

    updateParams({ collection: updated.length > 0 ? updated.join(',') : null });
  };

  // Toggle size in array
  const handleSizeToggle = (size: string) => {
    const updated = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    updateParams({ size: updated.length > 0 ? updated.join(',') : null });
  };

  // Stock status change
  const handleStockChange = (val: string) => {
    if (val === 'in-stock') {
      updateParams({ inStock: 'true', stockStatus: null });
    } else if (val === 'pre-order') {
      updateParams({ inStock: null, stockStatus: 'PRE_ORDER' });
    } else {
      updateParams({ inStock: null, stockStatus: null });
    }
  };

  // Price range change
  const handlePriceChange = (min: number | null, max: number | null) => {
    updateParams({
      minPrice: min != null ? String(min) : null,
      maxPrice: max != null ? String(max) : null,
    });
  };

  // Sort change
  const handleSortChange = (newSort: string) => {
    updateParams({ sort: newSort === 'relevant' ? null : newSort });
  };

  // Reset all filters
  const handleResetAll = () => {
    const params = new URLSearchParams();
    if (lockedDimension === 'collection' && searchParams.get('collection')) {
      params.set('collection', searchParams.get('collection')!);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Assemble active chips
  const chips: ActiveFilterItem[] = [];

  currentCategories.forEach((slug) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cat = categories.find((c: any) => (c.slug || '').toLowerCase() === slug);
    chips.push({
      id: `cat_${slug}`,
      type: 'category',
      label: cat ? cat.name || cat.title : slug,
      value: slug,
    });
  });

  if (lockedDimension !== 'collection') {
    currentCollections.forEach((slug) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const col = collections.find((c: any) => (c.slug || '').toLowerCase() === slug);
      chips.push({
        id: `col_${slug}`,
        type: 'collection',
        label: col ? col.title : slug,
        value: slug,
      });
    });
  }

  currentSizes.forEach((sz) => {
    chips.push({
      id: `sz_${sz}`,
      type: 'size',
      label: `Size: ${sz}`,
      value: sz,
    });
  });

  if (currentMinPrice != null || currentMaxPrice != null) {
    const minTxt = currentMinPrice ? `৳${currentMinPrice.toLocaleString('en-BD')}` : '৳0';
    const maxTxt = currentMaxPrice
      ? `৳${currentMaxPrice.toLocaleString('en-BD')}`
      : `৳${facets.maxCatalogPrice.toLocaleString('en-BD')}`;
    chips.push({
      id: 'price_range',
      type: 'price',
      label: `${minTxt} – ${maxTxt}`,
      value: 'price',
    });
  }

  if (currentStock === 'in-stock') {
    chips.push({
      id: 'stock_instock',
      type: 'stock',
      label: 'In Stock Only',
      value: 'in-stock',
    });
  } else if (currentStock === 'pre-order') {
    chips.push({
      id: 'stock_preorder',
      type: 'stock',
      label: 'Pre-Order Drops',
      value: 'pre-order',
    });
  }

  // Remove individual chip
  const handleRemoveChip = (chip: ActiveFilterItem) => {
    if (chip.type === 'category') {
      handleCategoryToggle(chip.value);
    } else if (chip.type === 'collection') {
      handleCollectionToggle(chip.value);
    } else if (chip.type === 'size') {
      handleSizeToggle(chip.value);
    } else if (chip.type === 'price') {
      updateParams({ minPrice: null, maxPrice: null });
    } else if (chip.type === 'stock') {
      updateParams({ inStock: null, stockStatus: null });
    }
  };

  const activeCount = chips.length;

  return (
    <div className="w-full">
      {/* Mobile Top Bar: [Filter Drawer Trigger] [Sort Dropdown] */}
      <div className="flex lg:hidden items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-200">
        <MobileFilterDrawer
          categories={categories}
          collections={collections}
          facets={facets}
          totalResults={totalResults}
          activeFilterCount={activeCount}
          selectedCategories={currentCategories}
          selectedCollections={currentCollections}
          selectedSizes={currentSizes}
          selectedStock={currentStock}
          minPrice={currentMinPrice}
          maxPrice={currentMaxPrice}
          lockedDimension={lockedDimension}
          accentColor={accentColor}
          onCategoryToggle={handleCategoryToggle}
          onCollectionToggle={handleCollectionToggle}
          onSizeToggle={handleSizeToggle}
          onStockChange={handleStockChange}
          onPriceChange={handlePriceChange}
          onResetAll={handleResetAll}
        />

        <SortDropdown currentSort={currentSort} onChange={handleSortChange} />
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* 1. Left Desktop Sticky Sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start">
          <DesktopFilterSidebar
            categories={categories}
            collections={collections}
            facets={facets}
            selectedCategories={currentCategories}
            selectedCollections={currentCollections}
            selectedSizes={currentSizes}
            selectedStock={currentStock}
            minPrice={currentMinPrice}
            maxPrice={currentMaxPrice}
            lockedDimension={lockedDimension}
            accentColor={accentColor}
            onCategoryToggle={handleCategoryToggle}
            onCollectionToggle={handleCollectionToggle}
            onSizeToggle={handleSizeToggle}
            onStockChange={handleStockChange}
            onPriceChange={handlePriceChange}
            onResetAll={handleResetAll}
          />
        </aside>

        {/* 2. Right Products Grid Container */}
        <div className="flex-1 min-w-0 w-full">
          {/* Desktop Top Bar: Applied Chips on Left, Sort on Right */}
          <div className="hidden lg:flex items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200/80">
            <AppliedFilterChips
              chips={chips}
              totalResults={totalResults}
              onRemove={handleRemoveChip}
              onClearAll={handleResetAll}
            />

            <SortDropdown currentSort={currentSort} onChange={handleSortChange} />
          </div>

          {/* Mobile Applied Chips (Shown when active) */}
          {chips.length > 0 && (
            <div className="lg:hidden pb-3 mb-4 border-b border-zinc-100">
              <AppliedFilterChips
                chips={chips}
                totalResults={totalResults}
                onRemove={handleRemoveChip}
                onClearAll={handleResetAll}
              />
            </div>
          )}

          {/* Product Grid Children */}
          {children}
        </div>
      </div>
    </div>
  );
}
