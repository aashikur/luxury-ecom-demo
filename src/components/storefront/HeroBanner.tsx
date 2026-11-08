import React from 'react';
import Link from 'next/link';

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
  storeName = 'VectroFit Luxury',
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

  const eyebrowText = subtitle || `${storeName.toUpperCase()} // ARCHIVE`;

  return (
    <section className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-6 pb-12">
      <div className="relative rounded-md overflow-hidden bg-zinc-950 text-white min-h-[460px] sm:min-h-[540px] flex items-center justify-center text-center">
        {/* Editorial Campaign Background */}
        <img
          src={bgImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent sm:bg-gradient-to-r sm:from-black/80 sm:via-black/50 sm:to-black/80" />

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 sm:px-16 py-16 max-w-3xl mx-auto">
          <p
            style={{ color: accentColor }}
            className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
          >
            {eyebrowText}
          </p>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.03] mb-4 text-white">
            {title}
          </h1>

          {description && (
            <p className="text-sm sm:text-base text-zinc-300 tracking-wide mb-8 max-w-xl mx-auto">
              {description}
            </p>
          )}

          <div className="flex justify-center">
            <Link
              href={buttonLink}
              className="inline-block px-8 py-3.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
