'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PriceRangeSliderProps {
  minLimit: number;
  maxLimit: number;
  initialMin?: number;
  initialMax?: number;
  accentColor?: string;
  onChange: (min: number | null, max: number | null) => void;
}

export default function PriceRangeSlider({
  minLimit = 0,
  maxLimit = 20000,
  initialMin,
  initialMax,
  accentColor = '#076E46',
  onChange,
}: PriceRangeSliderProps) {
  const [minVal, setMinVal] = useState<number>(initialMin ?? minLimit);
  const [maxVal, setMaxVal] = useState<number>(initialMax ?? maxLimit);

  // Sync internal state when URL props change
  useEffect(() => {
    setMinVal(initialMin ?? minLimit);
  }, [initialMin, minLimit]);

  useEffect(() => {
    setMaxVal(initialMax ?? maxLimit);
  }, [initialMax, maxLimit]);

  // Debounced callback to avoid rapid URL updates
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerChange = useCallback(
    (newMin: number, newMax: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const outMin = newMin > minLimit ? newMin : null;
        const outMax = newMax < maxLimit ? newMax : null;
        onChange(outMin, outMax);
      }, 350);
    },
    [minLimit, maxLimit, onChange]
  );

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 100);
    setMinVal(val);
    triggerChange(val, maxVal);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 100);
    setMaxVal(val);
    triggerChange(minVal, val);
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setMinVal(val);
      if (val >= minLimit && val < maxVal) {
        triggerChange(val, maxVal);
      }
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setMaxVal(val);
      if (val <= maxLimit && val > minVal) {
        triggerChange(minVal, val);
      }
    }
  };

  // Calculate percentage for filled track between thumbs
  const minPercent = Math.min(
    100,
    Math.max(0, Math.round(((minVal - minLimit) / (maxLimit - minLimit || 1)) * 100))
  );
  const maxPercent = Math.min(
    100,
    Math.max(0, Math.round(((maxVal - minLimit) / (maxLimit - minLimit || 1)) * 100))
  );

  return (
    <div className="space-y-4 pt-1">
      {/* Dual Slider Track */}
      <div className="relative h-6 flex items-center">
        {/* Base Background Track */}
        <div className="absolute w-full h-1.5 bg-zinc-200 rounded-full" />

        {/* Highlighted Active Range Track */}
        <div
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
            backgroundColor: accentColor,
          }}
          className="absolute h-1.5 rounded-full pointer-events-none transition-all duration-75"
        />

        {/* Min Thumb Input */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={50}
          value={minVal}
          onChange={handleMinSlider}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#076E46] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#076E46] [&::-moz-range-thumb]:shadow-md"
          aria-label="Minimum Price"
        />

        {/* Max Thumb Input */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={50}
          value={maxVal}
          onChange={handleMaxSlider}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#076E46] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#076E46] [&::-moz-range-thumb]:shadow-md"
          aria-label="Maximum Price"
        />
      </div>

      {/* Numerical BDT Value Inputs */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
            Min Price
          </label>
          <div className="flex items-center border border-zinc-200 rounded px-2 py-1 bg-white focus-within:border-zinc-900 transition">
            <span className="text-zinc-400 mr-1 font-sans">৳</span>
            <input
              type="number"
              min={minLimit}
              max={maxVal - 100}
              value={minVal}
              onChange={handleMinInput}
              className="w-full text-xs font-semibold text-zinc-900 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <span className="text-zinc-300 self-end mb-2">—</span>

        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
            Max Price
          </label>
          <div className="flex items-center border border-zinc-200 rounded px-2 py-1 bg-white focus-within:border-zinc-900 transition">
            <span className="text-zinc-400 mr-1 font-sans">৳</span>
            <input
              type="number"
              min={minVal + 100}
              max={maxLimit}
              value={maxVal}
              onChange={handleMaxInput}
              className="w-full text-xs font-semibold text-zinc-900 focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
