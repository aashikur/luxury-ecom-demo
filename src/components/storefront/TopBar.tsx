import React from 'react';

interface TopBarProps {
  tagline: string;
  freeShippingThreshold: number;
  supportPhone: string;
}

export default function TopBar({
  tagline,
  freeShippingThreshold,
  supportPhone,
}: TopBarProps) {
  return (
    <div className="bg-zinc-950 text-zinc-300 text-[11px] tracking-wider border-b border-zinc-900">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-9 flex items-center justify-between">
        <p className="font-medium tracking-widest uppercase truncate">{tagline}</p>
        <div className="hidden sm:flex items-center gap-5 text-zinc-400">
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
