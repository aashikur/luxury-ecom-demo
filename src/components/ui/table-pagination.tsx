'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (safeCurrentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (safeCurrentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', safeCurrentPage, '...', totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 px-1 text-xs text-slate-500 select-none w-full ${className}`}
    >
      {/* Top on mobile / Left on desktop: Showing results count + Rows selector (on mobile) */}
      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {startItem}-{endItem}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{totalItems}</span> results
        </div>

        {/* Rows Selector (Mobile only: sits cleanly on the top line to avoid blowing out horizontal width) */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <span className="text-slate-500 font-medium">Rows</span>
          <div className="relative inline-flex items-center">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white pl-2 pr-6 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46] appearance-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Bottom on mobile / Right on desktop: Navigation controls */}
      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 sm:gap-3">
        {/* Rows Selector (Desktop only: sits next to pagination buttons) */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-slate-500 font-medium">Rows</span>
          <div className="relative inline-flex items-center">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46] appearance-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs active:scale-[0.97] touch-manipulation cursor-pointer shrink-0"
        >
          Previous
        </button>

        {/* Mobile Page Indicator & Jump-to-Page Selector */}
        <div className="flex sm:hidden items-center justify-center">
          {totalPages <= 1 ? (
            <span className="h-8 px-2.5 flex items-center text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg">
              Page 1 of 1
            </span>
          ) : (
            <div className="relative inline-flex items-center">
              <select
                value={safeCurrentPage}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-2.5 pr-7 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#076E46] focus:outline-none appearance-none cursor-pointer"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    Page {p} of {totalPages}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
            </div>
          )}
        </div>

        {/* Desktop Page Number Buttons with smart ellipsis */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-medium">
                  ...
                </span>
              );
            }
            const isCurrent = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`min-w-8 h-8 px-2.5 rounded-lg text-xs font-semibold transition active:scale-[0.97] touch-manipulation cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#076E46] text-white shadow-2xs font-bold'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs active:scale-[0.97] touch-manipulation cursor-pointer shrink-0"
        >
          Next
        </button>
      </div>
    </div>
  );
}
