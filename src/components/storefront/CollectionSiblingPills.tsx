import React from 'react';
import Link from 'next/link';

export interface SiblingPillItem {
  title: string;
  slug: string;
  badgeText?: string;
}

interface CollectionSiblingPillsProps {
  parentTitle?: string;
  parentSlug?: string | null;
  currentSlug: string;
  pills: SiblingPillItem[];
  accentColor?: string;
}

export default function CollectionSiblingPills({
  parentTitle,
  parentSlug,
  currentSlug,
  pills,
  accentColor = '#076E46',
}: CollectionSiblingPillsProps) {
  if (!pills || pills.length === 0) {
    return null;
  }

  const isParentActive = parentSlug ? currentSlug === parentSlug : false;

  return (
    <div className="w-full border-b border-zinc-200/80 bg-zinc-50/50 py-3 mb-8">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Parent 'All' Pill if Parent exists */}
          {parentSlug && parentTitle && (
            <Link
              href={`/collections/${parentSlug}`}
              prefetch={true}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition active:scale-95 duration-75 shrink-0 touch-manipulation select-none ${
                isParentActive
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-white text-zinc-700 border border-zinc-300 hover:border-zinc-900 hover:text-zinc-950 active:bg-zinc-100 active:border-zinc-900'
              }`}
            >
              All {parentTitle}
            </Link>
          )}

          {/* Sibling / Child Pills */}
          {pills.map((pill) => {
            const isActive = currentSlug === pill.slug;
            return (
              <Link
                key={pill.slug}
                href={`/collections/${pill.slug}`}
                prefetch={true}
                className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition active:scale-95 duration-75 shrink-0 flex items-center gap-1.5 touch-manipulation select-none ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-300 hover:border-zinc-900 hover:text-zinc-950 active:bg-zinc-100 active:border-zinc-900'
                }`}
              >
                <span>{pill.title}</span>
                {pill.badgeText && (
                  <span
                    style={{ backgroundColor: isActive ? accentColor : '#076E46' }}
                    className="text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase leading-none tracking-normal"
                  >
                    {pill.badgeText}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
