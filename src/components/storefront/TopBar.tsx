import React from 'react';

interface TopBarProps {
  tagline: string;
  freeShippingThreshold: number;
  supportPhone: string;
}

export default function TopBar({
  freeShippingThreshold,
  supportPhone,
}: TopBarProps) {
  return (
    <div className="bg-zinc-950 text-zinc-300 text-[11px] tracking-wider border-b border-zinc-900 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-9 flex items-center justify-between gap-4">
        {/* News Marquee Ticker */}
        <div className="flex-1 overflow-hidden min-w-0">
          {React.createElement(
            'marquee',
            {
              className: 'font-normal tracking-[0.18em] uppercase text-amber-400 text-[11px] cursor-default',
              scrollamount: 6,
            },
            'NOTICE: SITE IS CURRENTLY UNDER DEVELOPMENT • DEMO & TESTING ACTIVE'
          )}
        </div>

        <div className="hidden sm:flex items-center gap-5 text-zinc-400 shrink-0">
          <span>
            Free Shipping Over{' '}
            <strong className="text-white">৳{freeShippingThreshold.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>Hotline: {supportPhone}</span>
        </div>
      </div>
    </div>
  );
}