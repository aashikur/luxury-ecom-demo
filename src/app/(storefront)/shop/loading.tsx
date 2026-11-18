import React from 'react';

export default function ShopLoading() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header & Breadcrumbs */}
      <div className="pb-6 mb-6 border-b border-zinc-200/80 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-10 rounded bg-zinc-200" />
          <div className="h-3 w-1 rounded bg-zinc-100" />
          <div className="h-3 w-14 rounded bg-zinc-200" />
        </div>
        <div className="h-8 w-44 rounded bg-zinc-200" />
      </div>

      {/* Mobile Filter & Sort Bar */}
      <div className="flex lg:hidden items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-200 animate-pulse">
        <div className="h-10 w-24 rounded border border-zinc-200 bg-zinc-100" />
        <div className="h-10 w-28 rounded border border-zinc-200 bg-zinc-100" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start animate-pulse">
          <div className="space-y-7">
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="border-b border-zinc-200 pb-6 space-y-3">
                <div className="h-4 w-24 rounded bg-zinc-200" />
                {section === 3 ? (
                  <>
                    <div className="h-2 rounded-full bg-zinc-100 mt-4" />
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-20 rounded border border-zinc-200 bg-zinc-50" />
                      <div className="h-8 w-20 rounded border border-zinc-200 bg-zinc-50" />
                    </div>
                  </>
                ) : (
                  <>
                    {[1, 2, 3, 4].slice(0, section === 4 ? 3 : 4).map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-zinc-100" />
                        <div className="h-3 w-28 rounded bg-zinc-100" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <div className="flex-1 min-w-0 w-full">
          <div className="hidden lg:flex items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200/80 animate-pulse">
            <div className="h-4 w-32 rounded bg-zinc-100" />
            <div className="h-9 w-32 rounded border border-zinc-200 bg-zinc-50" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="flex flex-col">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-100 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-4/5 rounded bg-zinc-100" />
                  <div className="h-4 w-2/5 rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}