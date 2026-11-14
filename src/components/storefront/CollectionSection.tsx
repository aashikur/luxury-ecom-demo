import React from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountPrice?: number;
  media?: { url: string; key?: string }[];
  collections?: string[];
  categoryName?: string;
}

interface CollectionSectionProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  products: ProductItem[];
  themeStyle?: 'LIGHT' | 'DARK_BAND';
  accentColor?: string;
}

export default function CollectionSection({
  title,
  description,
  buttonText = 'VIEW ALL',
  buttonLink = '/shop',
  products,
  themeStyle = 'LIGHT',
  accentColor = '#B8860B',
}: CollectionSectionProps) {
  const isDarkBand = themeStyle === 'DARK_BAND';

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      className={
        isDarkBand
          ? 'bg-zinc-950 text-white py-20 my-12'
          : 'py-14 max-w-[1360px] mx-auto px-4 sm:px-8'
      }
    >
      <div className={isDarkBand ? 'max-w-[1360px] mx-auto px-4 sm:px-8' : ''}>
        {/* Section Header: Left Title + Right Button */}
        <div
          className={`flex items-end justify-between mb-10 pb-4 ${
            isDarkBand ? 'border-b border-zinc-800' : 'border-b border-zinc-200'
          }`}
        >
          <div>
            <h2
              className={`text-xl sm:text-2xl font-bold uppercase tracking-[0.12em] ${
                isDarkBand ? 'text-white' : 'text-zinc-900'
              }`}
            >
              {title}
            </h2>
            {description && (
              <p
                className={`text-xs mt-1 tracking-wide ${
                  isDarkBand ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {description}
              </p>
            )}
          </div>

          <Link
            href={buttonLink}
            className={`px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] border transition cursor-pointer ${
              isDarkBand
                ? 'border-zinc-700 text-white hover:bg-white hover:text-zinc-950'
                : 'border-zinc-900 text-zinc-900 hover:bg-zinc-950 hover:text-white'
            }`}
          >
            {buttonText}
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              accentColor={accentColor}
              darkSurface={isDarkBand}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
