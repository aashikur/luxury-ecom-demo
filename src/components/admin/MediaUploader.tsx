'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  Star,
  Loader2,
  ImagePlus,
  Play,
  Video,
  Link2,
} from 'lucide-react';
import { optimizeImageRuleBased, CompressionResult } from '@/lib/imageCompressor';

export interface MediaItem {
  url: string;
  key: string;
  thumbnailUrl?: string;
  type?: 'IMAGE' | 'VIDEO';
  videoProvider?: 'YOUTUBE' | 'VIMEO' | 'R2' | 'BUNNY_STREAM';
  altText?: string;
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

function extractYouTubeId(url: string): string | null {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function MediaUploader({
  value = [],
  onChange,
  multiple = true,
  maxFiles = 8,
  aspectRatio = '3:4',
  label = 'Product Media & Gallery',
  description = 'Add high-resolution photos and video clips of your garment. The first asset serves as primary cover.',
  folder = 'products',
  disabled = false,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [optimizationFeedbacks, setOptimizationFeedbacks] = useState<string[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
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
      alert(`You can upload a maximum of ${maxFiles} media items.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setIsUploading(true);
    setOptimizationFeedbacks([]);

    const uploadedItems: MediaItem[] = [];
    const newFeedbacks: string[] = [];

    for (const rawFile of filesToUpload) {
      const isVideo = rawFile.type.startsWith('video/');
      const isImage = rawFile.type.startsWith('image/');

      if (!isImage && !isVideo) {
        alert(`File "${rawFile.name}" is not a supported format.`);
        continue;
      }

      try {
        let fileToSend: File | Blob = rawFile;

        if (isImage) {
          // Client-Side Canvas Optimization (WebP, max dimension cap 1200px)
          const compression: CompressionResult = await optimizeImageRuleBased(rawFile, 1200);
          fileToSend = compression.file;
          newFeedbacks.push(compression.feedback);
        } else {
          newFeedbacks.push(`Video "${rawFile.name}" prepared for Cloudflare R2 streaming`);
        }

        // Upload to Cloudflare R2 API
        const formData = new FormData();
        formData.append('file', fileToSend, rawFile.name);
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
            type: isVideo ? 'VIDEO' : 'IMAGE',
            videoProvider: isVideo ? 'R2' : undefined,
            altText: rawFile.name,
          });
        } else {
          alert(data.error || `Failed to upload "${rawFile.name}"`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert(`Upload error for "${rawFile.name}"`);
      }
    }

    if (newFeedbacks.length > 0) {
      setOptimizationFeedbacks(newFeedbacks);
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

  const handleAddVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;

    const ytId = extractYouTubeId(url);
    if (ytId) {
      const newItem: MediaItem = {
        url: `https://www.youtube.com/watch?v=${ytId}`,
        key: `yt-${ytId}-${Date.now()}`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        type: 'VIDEO',
        videoProvider: 'YOUTUBE',
        altText: 'YouTube Product Video',
      };
      onChange([...value, newItem]);
      setVideoUrlInput('');
      setShowVideoModal(false);
      return;
    }

    // Direct MP4 / WebM URL
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('vimeo.com')) {
      const isVimeo = url.includes('vimeo.com');
      const newItem: MediaItem = {
        url,
        key: `video-link-${Date.now()}`,
        type: 'VIDEO',
        videoProvider: isVimeo ? 'VIMEO' : 'R2',
        altText: 'Product Video Showcase',
      };
      onChange([...value, newItem]);
      setVideoUrlInput('');
      setShowVideoModal(false);
      return;
    }

    alert('Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=...) or direct MP4 URL.');
  };

  const handleRemove = async (indexToRemove: number) => {
    if (disabled) return;
    const itemToRemove = value[indexToRemove];

    // Optimistic UI update
    onChange(value.filter((_, idx) => idx !== indexToRemove));

    // Cleanup storage in Cloudflare R2
    if (itemToRemove?.key && !itemToRemove.key.startsWith('seed/') && !itemToRemove.key.startsWith('yt-')) {
      try {
        await fetch(`/api/upload?key=${encodeURIComponent(itemToRemove.key)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to cleanup asset on remove:', err);
      }
    }
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
      <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{label}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-slate-600" />
            <span>+ Video Link</span>
          </button>

          {multiple && value.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              {value.length}/{maxFiles}
            </span>
          )}
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/png,image/jpeg,image/webp,image/jpg,video/mp4,video/webm,video/quicktime"
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
              'Processing & Uploading to R2...'
            ) : (
              <>
                <span className="text-slate-900 underline font-semibold">Click to upload</span> or drag and drop photos & videos
              </>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            WebP, PNG, JPG or MP4/WebM videos · Auto-optimized for Cloudflare R2 CDN
          </p>
        </div>
      )}

      {/* Live Optimization Feedback Pills */}
      {optimizationFeedbacks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {optimizationFeedbacks.map((fb, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{fb}</span>
            </span>
          ))}
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
              const isVideo = item.type === 'VIDEO';
              const displayImgUrl = item.thumbnailUrl || (isVideo ? '/placeholder.webp' : item.url);

              return (
                <div
                  key={`${item.url}-${idx}`}
                  className={`group relative rounded-lg border overflow-hidden bg-slate-900 transition ${containerRatioClass} ${
                    isCover
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Thumbnail / Video Preview */}
                  {isVideo && item.videoProvider !== 'YOUTUBE' ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <Image
                      src={displayImgUrl}
                      alt={item.altText || `Uploaded asset ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}

                  {/* Primary Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      <span>Cover</span>
                    </div>
                  )}

                  {/* Video Badge */}
                  {isVideo && (
                    <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>{item.videoProvider === 'YOUTUBE' ? 'YouTube' : 'Video'}</span>
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
                        title="Remove asset"
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

      {/* Video URL Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Add Product Video</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Video Link</label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or direct .mp4 URL"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVideoUrl();
                    }
                  }}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Supports YouTube watch links, shorts, and direct streaming MP4 URLs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddVideoUrl}
                className="px-4 py-1.5 rounded-md bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800 transition cursor-pointer"
              >
                Attach Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
