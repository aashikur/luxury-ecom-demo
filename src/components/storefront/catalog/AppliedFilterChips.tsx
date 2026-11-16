'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface ActiveFilterItem {
  id: string;
  type: 'category' | 'collection' | 'price' | 'size' | 'stock' | 'brand';
  label: string;
  value: string;
}

interface AppliedFilterChipsProps {
  chips: ActiveFilterItem[];
  totalResults: number;
  onRemove: (item: ActiveFilterItem) => void;
  onClearAll: () => void;
}

export default function AppliedFilterChips({
  chips,
  totalResults,
  onRemove,
  onClearAll,
}: AppliedFilterChipsProps) {
  if (chips.length === 0) {
    return (
      <div className="text-xs text-zinc-500 font-medium tracking-wide">
        Showing <span className="font-bold text-zinc-900">{totalResults}</span> garments
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-400 font-medium tracking-wide mr-1 hidden sm:inline">
        Showing <strong className="text-zinc-900 font-bold">{totalResults}</strong> garments:
      </span>

      {chips.map((chip) => (
        <button
          key={`${chip.type}_${chip.value}`}
          type="button"
          onClick={() => onRemove(chip)}
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition active:scale-[0.98] duration-75 cursor-pointer border border-zinc-200/80"
          title={`Remove filter: ${chip.label}`}
        >
          <span>{chip.label}</span>
          <X className="w-3 h-3 text-zinc-400 group-hover:text-zinc-700 transition" />
        </button>
      ))}

      {chips.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      )}
    </div>
  );
}
