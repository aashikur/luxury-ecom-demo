import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroBannerProps {
  storeName?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  accentColor?: string;
}

export default function HeroBanner({
  storeName = 'Aurem Luxury',
  title = 'Winter Luxury Drop 2026',
  subtitle,
  description = 'Premium Acid-Wash & Heavyweight Fleece',
  buttonText = 'SHOP NOW',
  buttonLink = '/shop',
  imageUrl,
  accentColor = '#B8860B',
}: HeroBannerProps) {
  const bgImage =
  imageUrl ||
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1800&q=85';

  const eyebrowText = subtitle || storeName.toUpperCase();

  return (
    <section className="w-full max-w-full m-0 p-0">
      {/* Outer Section Frame: 100% Locked, Zero-Motion Shell */}
      <div className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[480px] sm:min-h-[560px] flex items-center justify-center text-center">
        {/* Editorial Campaign Background - Scale-Down 105% -> 100% over 1s (Image Element Only) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src={bgImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80 animate-hero-scale-down"
          />
        </div>

        {/* Soft 0.5 Opacity Overlay */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        {/* Hero Content - Staggered Micro-Reveal (Text Elements Only, Capped at 8px) */}
        <div className="relative z-10 w-full px-6 sm:px-16 py-20 max-w-3xl mx-auto">
          {/* Eyebrow: 0ms delay */}
          <p
            style={{ color: accentColor }}
            className="text-xs font-bold uppercase tracking-[0.35em] mb-4 animate-micro-fade-in"
          >
            {eyebrowText}
          </p>

          {/* Main Title: 100ms delay */}
          <h1
            style={{ animationDelay: '100ms' }}
            className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.03] mb-4 text-white drop-shadow-sm animate-micro-fade-in"
          >
            {title}
          </h1>

          {/* Description: 200ms delay */}
          {description && (
            <p
              style={{ animationDelay: '200ms' }}
              className="text-sm sm:text-base text-zinc-200 tracking-wide mb-8 max-w-xl mx-auto drop-shadow-xs animate-micro-fade-in"
            >
              {description}
            </p>
          )}

          {/* CTA: 300ms delay + Tactile Press Feedback */}
          <div
            style={{ animationDelay: '300ms' }}
            className="flex justify-center animate-micro-fade-in"
          >
            <Link
              href={buttonLink}
              className="inline-block px-8 py-3.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 shadow-lg cursor-pointer select-none active:scale-[0.98] transition-transform duration-75 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
