import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface CategoryPillItem {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  href: string;
}

interface CategoryPillsSectionProps {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  cardShape?: 'CIRCLE' | 'SQUARE' | 'PORTRAIT_3_4';
  items: CategoryPillItem[];
}

export default function CategoryPillsSection({
  title = 'Featured Collections',
  subtitle,
  showTitle = true,
  cardShape = 'CIRCLE',
  items = [],
}: CategoryPillsSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="w-full py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading (if showTitle is true) */}
        {showTitle && (
          <div className="text-center mb-6 sm:mb-8 space-y-1">
            {subtitle && (
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#076E46]">
                {subtitle}
              </p>
            )}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#060d11]">
              {title}
            </h2>
          </div>
        )}

        {/* Scrollable / Centered Story Pills Row */}
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth px-2 py-2">
          {items.map((item) => {
            const hasImage = Boolean(item.imageUrl && item.imageUrl.trim().length > 0);
            const fallbackInitial = item.title.charAt(0).toUpperCase();

            // Circular Instagram Story Shape
            if (cardShape === 'CIRCLE') {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col items-center gap-2.5 shrink-0 active:scale-95 transition-transform duration-75 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2px] border-2 border-slate-200 group-hover:border-[#076E46] transition-colors duration-200 bg-white">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                      {hasImage ? (
                        <Image
                          src={item.imageUrl!}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                        />
                      ) : (
                        <span className="text-base font-bold text-slate-400 group-hover:text-[#076E46] transition-colors">
                          {fallbackInitial}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 tracking-tight text-center max-w-[80px] sm:max-w-[96px] truncate group-hover:text-[#076E46] transition-colors">
                    {item.title}
                  </span>
                </Link>
              );
            }

            // Square Pill Card
            if (cardShape === 'SQUARE') {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform duration-75 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 group-hover:border-[#076E46] group-hover:shadow-md transition-all duration-200 bg-slate-50 flex items-center justify-center">
                    {hasImage ? (
                      <Image
                        src={item.imageUrl!}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-400">
                        {fallbackInitial}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 tracking-tight text-center max-w-[96px] sm:max-w-[112px] truncate group-hover:text-[#076E46] transition-colors">
                    {item.title}
                  </span>
                </Link>
              );
            }

            // Portrait 3:4 Card
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform duration-75 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]"
              >
                <div className="relative w-24 sm:w-32 aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 group-hover:border-[#076E46] group-hover:shadow-md transition-all duration-200 bg-slate-50 flex items-center justify-center">
                  {hasImage ? (
                    <Image
                      src={item.imageUrl!}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">
                      {fallbackInitial}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-800 tracking-tight text-center max-w-[96px] sm:max-w-[128px] truncate group-hover:text-[#076E46] transition-colors">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
