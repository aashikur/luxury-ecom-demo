'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { IHomeSectionSlide } from '@/models/StoreConfig';

interface HeroBannerProps {
  storeName?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  slides?: IHomeSectionSlide[];
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
  slides = [],
  accentColor = '#B8860B',
}: HeroBannerProps) {
  const activeSlides = slides.filter((s) => s.url && s.url.trim().length > 0);
  const isCarousel = activeSlides.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Auto-play interval for multi-slide carousel
  useEffect(() => {
    if (!isCarousel || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isCarousel, isPaused, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Fallback single background
  const fallbackBg =
    imageUrl ||
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1800&q=85';

  if (!isCarousel) {
    const singleSlide = activeSlides.length === 1 ? activeSlides[0] : null;
    const activeImage = singleSlide?.url || fallbackBg;
    const activeTitle = singleSlide?.title || title;
    const activeEyebrow = singleSlide?.subtitle || subtitle || storeName.toUpperCase();
    const activeDesc = singleSlide?.subtitle || description;
    const activeBtn = singleSlide?.buttonText || buttonText;
    const activeHref = singleSlide?.buttonLink || buttonLink;

    return (
      <section className="w-full max-w-full m-0 p-0">
        <div className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[480px] sm:min-h-[580px] flex items-center justify-center text-center">
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={activeImage}
              alt={activeTitle}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-85 animate-hero-scale-down"
            />
          </div>

          <div className="absolute inset-0 bg-black/50 pointer-events-none" />

          <div className="relative z-10 w-full px-6 sm:px-16 py-20 max-w-3xl mx-auto">
            <p
              style={{ color: accentColor, animationDelay: '300ms' }}
              className="text-xs font-bold uppercase tracking-[0.35em] mb-4 animate-micro-fade-in"
            >
              {activeEyebrow}
            </p>

            <h1
              style={{ animationDelay: '600ms' }}
              className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.03] mb-4 text-white drop-shadow-sm animate-micro-fade-in"
            >
              {activeTitle}
            </h1>

            {activeDesc && (
              <p
                style={{ animationDelay: '1200ms' }}
                className="text-sm sm:text-base text-zinc-200 tracking-wide mb-8 max-w-xl mx-auto drop-shadow-xs animate-micro-fade-in"
              >
                {activeDesc}
              </p>
            )}

            <div
              style={{ animationDelay: '1800ms' }}
              className="flex justify-center animate-micro-fade-in"
            >
              <Link
                href={activeHref}
                className="inline-block px-8 py-3.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 active:bg-zinc-300 active:scale-95 shadow-lg cursor-pointer select-none transition duration-75 ease-out touch-manipulation"
              >
                {activeBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Multi-Slide Editorial Carousel
  const currentSlide = activeSlides[currentIndex];
  const slideEyebrow = currentSlide.subtitle || storeName.toUpperCase();
  const slideTitle = currentSlide.title || title;
  const slideBtn = currentSlide.buttonText || buttonText;
  const slideHref = currentSlide.buttonLink || buttonLink;

  return (
    <section
      className="w-full max-w-full m-0 p-0 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[480px] sm:min-h-[580px] flex items-center justify-center text-center">
        {/* Carousel Background Images (Stacked with smooth cross-fade opacity) */}
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={`slide-bg-${idx}`}
              className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-85 z-1' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.url}
                alt={slide.title || `Campaign banner ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`object-cover object-center ${
                  isActive ? 'animate-hero-scale-down' : ''
                }`}
              />
            </div>
          );
        })}

        {/* Contrast Overlay */}
        <div className="absolute inset-0 bg-black/50 z-2 pointer-events-none" />

        {/* Carousel Slide Content */}
        <div
          key={`slide-content-${currentIndex}`}
          className="relative z-10 w-full px-6 sm:px-16 py-20 max-w-3xl mx-auto"
        >
          <p
            style={{ color: accentColor }}
            className="text-xs font-bold uppercase tracking-[0.35em] mb-4 animate-micro-fade-in"
          >
            {slideEyebrow}
          </p>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.03] mb-4 text-white drop-shadow-sm animate-micro-fade-in">
            {slideTitle}
          </h1>

          <div className="flex justify-center mt-6 animate-micro-fade-in">
            <Link
              href={slideHref}
              className="inline-block px-8 py-3.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 active:bg-zinc-300 active:scale-95 shadow-lg cursor-pointer select-none transition duration-75 ease-out touch-manipulation"
            >
              {slideBtn}
            </Link>
          </div>
        </div>

        {/* Carousel Nav Chevrons (Desktop & Tablet) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 active:bg-black/80 backdrop-blur-xs text-white border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 active:bg-black/80 backdrop-blur-xs text-white border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer touch-manipulation"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Pagination Dots / Line Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {activeSlides.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
