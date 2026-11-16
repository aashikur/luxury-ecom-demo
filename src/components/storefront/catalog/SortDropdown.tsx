'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  currentSort: string;
  onChange: (newSort: string) => void;
}

export const SORT_OPTIONS = [
  { value: 'relevant', label: 'Featured Drops' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'alpha-asc', label: 'Alphabetical: A - Z' },
];

export default function SortDropdown({ currentSort = 'relevant', onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-zinc-400 font-medium tracking-wider uppercase hidden sm:inline">
        Sort:
      </span>
      <div className="relative inline-flex items-center">
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
        <select
          value={currentSort}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Sort products catalog"
          className="appearance-none bg-white border border-zinc-200 hover:border-zinc-300 rounded text-xs font-semibold text-zinc-800 pl-8 pr-7 py-1.5 focus:outline-none focus:border-zinc-950 transition cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 text-zinc-400 text-[10px]">▼</div>
      </div>
    </div>
  );
}
