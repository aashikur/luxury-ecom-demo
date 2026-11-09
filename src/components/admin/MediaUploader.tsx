'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Star,
  Loader2,
  ImagePlus,
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
  description = 'Add high-resolution photos of your garment. The first photo will be used as the primary cover.',
  folder = 'products',
  disabled = false,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map aspect ratio string to CSS tailwind class
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '3:4':
        return 'aspect-[3/4]';
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-[16/9]';
      case '4:5':
        return 'aspect-[4/5]';
      default:
        return 'aspect-auto min-h-[140px]';
    }
  };

  const containerRatioClass = getAspectRatioClasses();

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

    const uploadedItems: MediaItem[] = [];

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
        console.error('Upload error:', err);
        alert(`Upload error for "${rawFile.name}"`);
      }
    }

    if (uploadedItems.length > 0) {
      if (multiple) {
        onChange([...value, ...uploadedItems]);
      } else {
        onChange([uploadedItems[0]]);
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
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{label}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>

        {multiple && value.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
            {value.length}/{maxFiles}
          </span>
        )}
      </div>

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

      {/* Clean Drag & Drop Zone */}
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
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/30'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center mb-2.5 shadow-2xs">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
            ) : (
              <UploadCloud className="w-5 h-5 text-slate-600" />
            )}
          </div>

          <p className="text-xs font-semibold text-slate-800">
            {isUploading ? (
              'Uploading...'
            ) : (
              <>
                <span className="text-slate-900 underline font-semibold">Click to upload</span> or drag and drop photos
              </>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepted ratio {aspectRatio} · Max size 500 KB · WebP, PNG, JPG
          </p>
        </div>
      )}

      {/* Uploaded Gallery Grid */}
      {value.length > 0 && (
        <div className="space-y-2 pt-1">
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
                  className={`group relative rounded-lg border overflow-hidden bg-slate-100 transition ${containerRatioClass} ${
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
                    <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-white" />
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
                        className="w-full py-1 rounded bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-bold transition shadow-xs cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Add More Button Tile */}
            {multiple && value.length < maxFiles && (
              <button
                type="button"
                onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className={`rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer ${containerRatioClass}`}
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
