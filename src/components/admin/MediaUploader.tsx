'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Star,
  Loader2,
  ImagePlus,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { compressImageInBrowser } from '@/lib/imageCompressor';

export interface MediaItem {
  url: string;
  key: string;
}

export type AspectRatioType = '3:4' | '1:1' | '16:9' | '4:5' | 'free';

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  aspectRatio?: AspectRatioType;
  label?: string;
  description?: string;
  helperGuide?: string;
  folder?: string;
  disabled?: boolean;
}

export default function MediaUploader({
  value = [],
  onChange,
  multiple = true,
  maxFiles = 8,
  aspectRatio = '3:4',
  label = 'Product Media & Gallery',
  description = 'Upload high-resolution images. The first image will be used as the primary display cover.',
  helperGuide,
  folder = 'products',
  disabled = false,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastCompressionStat, setLastCompressionStat] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map aspect ratio string to CSS tailwind class and dimensions guide
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '3:4':
        return {
          containerClass: 'aspect-[3/4]',
          recommendedDimension: '1200 x 1600 px (3:4 Portrait)',
        };
      case '1:1':
        return {
          containerClass: 'aspect-square',
          recommendedDimension: '1200 x 1200 px (1:1 Square)',
        };
      case '16:9':
        return {
          containerClass: 'aspect-[16/9]',
          recommendedDimension: '1920 x 1080 px (16:9 Banner)',
        };
      case '4:5':
        return {
          containerClass: 'aspect-[4/5]',
          recommendedDimension: '1200 x 1500 px (4:5 Portrait)',
        };
      default:
        return {
          containerClass: 'aspect-auto min-h-[140px]',
          recommendedDimension: 'Free aspect ratio',
        };
    }
  };

  const ratioInfo = getAspectRatioClasses();

  const handleProcessAndUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || disabled) return;

    // Check max file limit
    const availableSlots = multiple ? maxFiles - value.length : 1;
    if (availableSlots <= 0) {
      alert(`You can upload a maximum of ${maxFiles} images.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setIsUploading(true);
    setLastCompressionStat(null);

    const uploadedItems: MediaItem[] = [];
    let totalOriginalKB = 0;
    let totalCompressedKB = 0;

    for (const rawFile of filesToUpload) {
      if (!rawFile.type.startsWith('image/')) {
        alert(`File "${rawFile.name}" is not a valid image format.`);
        continue;
      }

      try {
        // 1. Client-Side Browser Compression (HTML5 Canvas Engine)
        const compression = await compressImageInBrowser(rawFile, {
          maxWidth: aspectRatio === '16:9' ? 1920 : 1600,
          maxHeight: aspectRatio === '16:9' ? 1080 : 2133,
          quality: 0.82,
          outputFormat: 'image/webp',
        });

        totalOriginalKB += compression.originalSizeKB;
        totalCompressedKB += compression.compressedSizeKB;

        // 2. Upload Compressed WebP to Cloudflare R2 API
        const formData = new FormData();
        formData.append('file', compression.file);
        if (folder) {
          formData.append('folder', folder);
        }

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          uploadedItems.push({
            url: data.url,
            key: data.key || `${folder}-${Date.now()}`,
          });
        } else {
          alert(data.error || `Failed to upload "${rawFile.name}"`);
        }
      } catch (err) {
        console.error('Compression/Upload error:', err);
        alert(`Upload error for "${rawFile.name}"`);
      }
    }

    if (uploadedItems.length > 0) {
      if (multiple) {
        onChange([...value, ...uploadedItems]);
      } else {
        // Single image mode replaces the existing image
        onChange([uploadedItems[0]]);
      }

      if (totalOriginalKB > totalCompressedKB) {
        const savingsPercent = Math.round(
          ((totalOriginalKB - totalCompressedKB) / totalOriginalKB) * 100
        );
        setLastCompressionStat(
          `Compressed ${totalOriginalKB}KB ➔ ${totalCompressedKB}KB WebP (${savingsPercent}% saved)`
        );
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (disabled) return;
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCover = (index: number) => {
    if (disabled || index === 0) return;
    const reordered = [...value];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    onChange(reordered);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
      {/* Header with Title and Ratio Guide Pill */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{label}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Aspect Ratio Badge */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            <Info className="w-3 h-3 text-slate-400" />
            <span>Ratio: {aspectRatio}</span>
          </span>

          {multiple && value.length > 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {value.length}/{maxFiles} Photos
            </span>
          )}
        </div>
      </div>

      {/* Recommended Sizing Guidance Notice */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-0.5">
          <p className="font-semibold text-slate-800">
            {helperGuide || `Recommended: ${ratioInfo.recommendedDimension}. Target: 100KB – 250KB.`}
          </p>
          <p className="text-[11px] text-slate-500">
            ⚡ Heavy DSLR and iPhone camera photos are automatically downsampled and converted to ultra-fast <strong>WebP</strong> format right in your browser.
          </p>
        </div>
      </div>

      {/* Compression Success Toast / Status Badge */}
      {lastCompressionStat && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{lastCompressionStat}</span>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={(e) => e.target.files && handleProcessAndUpload(e.target.files)}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      {(!multiple && value.length >= 1) ? null : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleProcessAndUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 hover:border-emerald-500 bg-slate-50/40 hover:bg-emerald-50/20'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <UploadCloud className="w-6 h-6 text-emerald-600" />
            )}
          </div>

          <p className="text-xs font-semibold text-slate-800">
            {isUploading ? (
              'Optimizing & uploading to Cloudflare R2...'
            ) : (
              <>
                <span className="text-emerald-600 underline font-bold">Click to upload</span> or drag and drop photos
              </>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts PNG, JPG, or WebP. Auto-compressed in browser.
          </p>
        </div>
      )}

      {/* Uploaded Gallery Grid */}
      {value.length > 0 && (
        <div className="space-y-2 pt-2">
          <div
            className={`grid gap-3 ${
              aspectRatio === '16:9'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {value.map((item, idx) => {
              const isCover = idx === 0 && multiple;

              return (
                <div
                  key={`${item.url}-${idx}`}
                  className={`group relative rounded-lg border overflow-hidden bg-slate-100 transition ${
                    ratioInfo.containerClass
                  } ${
                    isCover
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <Image
                    src={item.url}
                    alt={`Uploaded photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />

                  {/* Primary Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Cover</span>
                    </div>
                  )}

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(idx);
                        }}
                        disabled={disabled}
                        className="p-1 rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isCover && multiple && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(idx);
                        }}
                        disabled={disabled}
                        className="w-full py-1 rounded bg-white/95 hover:bg-white text-slate-800 text-[10px] font-bold transition shadow-xs cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Add More Button Tile (Only if multiple and within maxFiles) */}
            {multiple && value.length < maxFiles && (
              <button
                type="button"
                onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className={`rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer ${ratioInfo.containerClass}`}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[11px] font-semibold">Add more</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
