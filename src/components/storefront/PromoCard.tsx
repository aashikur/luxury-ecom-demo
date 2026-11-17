'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export interface PromoCardProps {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  layoutWidth?: 'WIDE_FULL' | 'WIDE_BOX';
  bgMode?: 'PHOTO_BG' | 'SOLID_SURFACE';
  accentColor?: string;
}

export default function PromoCard({
  subtitle = 'NATIONWIDE EXPRESS DISPATCH',
  title = 'FREE EXPRESS SHIPPING ACROSS BANGLADESH',
  description,
  buttonText = 'ORDER ONLINE',
  buttonLink = '/shop',
  imageUrl,
  layoutWidth = 'WIDE_FULL',
  bgMode = 'PHOTO_BG',
  accentColor = '#B8860B',
}: PromoCardProps) {
  const { setIsCartOpen } = useCart();
  const hasPhoto = Boolean(bgMode === 'PHOTO_BG' && imageUrl && imageUrl.trim().length > 0);
  const isBoxed = layoutWidth === 'WIDE_BOX';

  const isCartAction = !buttonLink || buttonLink === '#cart' || buttonLink === 'cart';

  const handleButtonClick = (e: React.MouseEvent) => {
    if (isCartAction) {
      e.preventDefault();
      setIsCartOpen(true);
    }
  };

  const ctaButton = isCartAction ? (
    <button
      type="button"
      onClick={handleButtonClick}
      className={`px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition active:scale-95 duration-75 ease-out touch-manipulation select-none shrink-0 cursor-pointer shadow-md ${
        hasPhoto
          ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300'
          : 'bg-[#076E46] text-white hover:bg-[#055C3A] active:bg-[#04482D] active:brightness-95'
      }`}
    >
      {buttonText}
    </button>
  ) : (
    <Link
      href={buttonLink}
      className={`inline-block px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition active:scale-95 duration-75 ease-out touch-manipulation select-none shrink-0 cursor-pointer shadow-md ${
        hasPhoto
          ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300'
          : 'bg-[#076E46] text-white hover:bg-[#055C3A] active:bg-[#04482D] active:brightness-95'
      }`}
    >
      {buttonText}
    </Link>
  );

  return (
    <section
      className={`w-full my-8 sm:my-14 ${
        isBoxed ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-16 sm:px-16 sm:py-20 min-h-[360px] sm:min-h-[440px] ${
          isBoxed ? 'rounded-2xl border border-slate-200 shadow-sm' : ''
        } ${
          hasPhoto
            ? 'bg-zinc-950 text-white'
            : 'bg-[#0b1e17] text-white border-y border-emerald-950'
        }`}
      >
        {/* Photo Background if bgMode is PHOTO_BG */}
        {hasPhoto && (
          <>
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <Image
                src={imageUrl!}
                alt={title}
                fill
                sizes={isBoxed ? '(max-w: 1280px) 100vw, 1280px' : '100vw'}
                className="object-cover object-center animate-hero-scale-down"
              />
            </div>
            {/* Contrast Layer */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[0.5px] pointer-events-none" />
          </>
        )}

        {/* Content Container */}
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          {subtitle && (
            <p
              style={{ color: accentColor }}
              className="text-xs font-bold uppercase tracking-[0.3em]"
            >
              {subtitle}
            </p>
          )}

          <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.08] text-white drop-shadow-sm">
            {title}
          </h3>

          {description && (
            <p className="text-sm sm:text-base text-zinc-200/90 tracking-wide max-w-xl mx-auto drop-shadow-xs font-normal">
              {description}
            </p>
          )}

          <div className="pt-2 flex justify-center">
            {ctaButton}
          </div>
        </div>
      </div>
    </section>
  );
}
