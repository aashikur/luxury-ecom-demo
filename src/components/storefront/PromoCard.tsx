'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

interface PromoCardProps {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  accentColor?: string;
}

export default function PromoCard({
  subtitle = 'STEADFAST EXPRESS DISPATCH',
  title = 'FREE EXPRESS SHIPPING ACROSS BANGLADESH',
  description = 'On all orders above 2,500 BDT • Inside Dhaka ৳70 (24-48 Hours) • Outside Dhaka ৳130 (3-5 Days)',
  buttonText = 'VIEW BAG & SHIPPING',
  accentColor = '#B8860B',
}: PromoCardProps) {
  const { setIsCartOpen } = useCart();

  return (
    <section className="max-w-[1360px] mx-auto px-4 sm:px-8 my-12">
      <div className="relative overflow-hidden bg-stone-100 border border-zinc-200 px-8 py-12 sm:px-16 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          {subtitle && (
            <p
              style={{ color: accentColor }}
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
            >
              {subtitle}
            </p>
          )}
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 uppercase">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl">{description}</p>
          )}
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="px-8 py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition shrink-0 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
