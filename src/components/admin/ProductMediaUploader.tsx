'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Star, Loader2, ImagePlus } from 'lucide-react';

export interface MediaItem {
  url: string;
  key: string;
}

interface ProductMediaUploaderProps {
  images: MediaItem[];
  onChange: (images: MediaItem[]) => void;
  disabled?: boolean;
}

export default function ProductMediaUploader({
  images,
  onChange,
  disabled = false,
}: ProductMediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || disabled) return;
    setIsUploading(true);

    const newlyUploaded: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate MIME type
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          newlyUploaded.push({
            url: data.url,
            key: data.key || `product-image-${Date.now()}`,
          });
        } else {
          alert(data.error || `Failed to upload "${file.name}"`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert(`Network error uploading "${file.name}"`);
      }
    }

    if (newlyUploaded.length > 0) {
      onChange([...images, ...newlyUploaded]);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (disabled) return;
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (disabled || index === 0) return;
    const reordered = [...images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    onChange(reordered);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Product Media & Gallery</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add high-resolution garment photos. The first image will be used as the primary cover.
          </p>
        </div>
        {images.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </span>
        )}
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
            'Uploading to Cloudflare R2...'
          ) : (
            <>
              <span className="text-emerald-600 underline font-bold">Click to upload</span> or drag and drop garment photos
            </>
          )}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Supported formats: WebP, PNG, JPG (Front, Back, and Fabric details)
        </p>
      </div>

      {/* Uploaded Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((item, idx) => {
              const isCover = idx === 0;

              return (
                <div
                  key={`${item.url}-${idx}`}
                  className={`group relative rounded-lg border overflow-hidden aspect-square bg-slate-100 transition ${
                    isCover
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <Image
                    src={item.url}
                    alt={`Product image ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />

                  {/* Cover Badge */}
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
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(idx);
                        }}
                        disabled={disabled}
                        className="w-full py-1 rounded bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold transition shadow-xs cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Add More Button Tile */}
            <button
              type="button"
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 flex flex-col items-center justify-center gap-1.5 aspect-square text-slate-400 hover:text-emerald-600 transition cursor-pointer"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[11px] font-semibold">Add more</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
