'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Unlock,
  Check,
  Loader2,
  ImagePlus,
  X,
  Calendar,
} from 'lucide-react';
import { optimizeImageRuleBased } from '@/lib/imageCompressor';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Breadcrumb,
} from '@/components/ui';

export interface CollectionFormData {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  bannerImage?: { url: string; key: string };
  badgeText?: string;
  displayOrder?: number;
  isFeaturedHome?: boolean;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

interface CollectionFormProps {
  mode: 'create' | 'edit';
  initialData?: CollectionFormData;
}

// Helper: auto-generate clean URL slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default function CollectionFormClient({
  mode,
  initialData,
}: CollectionFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugLocked, setIsSlugLocked] = useState(!isEdit);
  const [description, setDescription] = useState(initialData?.description || '');
  const [badgeText, setBadgeText] = useState(initialData?.badgeText || '');
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 10) : ''
  );

  // Hidden flags with clean defaults matching Category
  const [isFeaturedHome] = useState(Boolean(initialData?.isFeaturedHome));
  const [isActive] = useState(
    initialData?.isActive !== undefined ? Boolean(initialData.isActive) : true
  );

  const [bannerImage, setBannerImage] = useState<{ url: string; key: string }[]>(
    initialData?.bannerImage?.url ? [initialData.bannerImage] : []
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isSlugLocked) {
      setSlug(slugify(val));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingImage(true);
    try {
      const compression = await optimizeImageRuleBased(file, 1600);
      const formData = new FormData();
      formData.append('file', compression.file);
      formData.append('folder', 'collections');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload banner image');
      }

      setBannerImage([{ url: data.url, key: data.key }]);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Collection title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      id: initialData?._id,
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      description: description.trim(),
      bannerImage: bannerImage[0] || { url: '', key: '' },
      badgeText: badgeText.trim(),
      displayOrder: Number(displayOrder) || 0,
      isFeaturedHome,
      isActive,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      const endpoint = '/api/collections';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save collection');
      }

      setToastMsg(isEdit ? 'Collection updated successfully!' : 'Collection created successfully!');

      setTimeout(() => {
        router.push('/admin/collections');
        router.refresh();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Collections', href: '/admin/collections' },
    { label: isEdit ? 'Edit Collection' : 'Create Collection' },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#076E46] text-xs font-semibold rounded-lg flex items-center justify-between shadow-2xs">
          <span>{toastMsg}</span>
          <Check className="w-4 h-4 text-[#076E46]" />
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg shadow-2xs">
          {errorMsg}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
            {isEdit ? 'Edit Collection' : 'Create Collection'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/collections">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#076E46] hover:bg-[#055C3A] text-white shadow-xs"
            size="sm"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            <span>{isEdit ? 'Save Changes' : 'Create Collection'}</span>
          </Button>
        </div>
      </div>

      {/* Clean Minimal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General Information & Media (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="border border-slate-200 shadow-2xs bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#060d11]">
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Collection Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Winter Drop 2026"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSlugLocked((prev) => !prev)}
                    className="text-[11px] text-slate-500 hover:text-[#060d11] inline-flex items-center gap-1 transition cursor-pointer"
                  >
                    {isSlugLocked ? (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Custom</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-600 focus-within:bg-white text-xs overflow-hidden shadow-2xs">
                  <span className="px-3 py-2 text-slate-400 bg-slate-100/70 border-r border-slate-200 select-none">
                    /collections/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    disabled={isSlugLocked}
                    placeholder="winter-drop-2026"
                    className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-slate-900 font-mono text-xs disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Badge Text (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. LIMITED DROP, 20% OFF"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <Textarea
                  placeholder="Optional description describing this campaign or drop..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Clean Banner Image Upload */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Banner / Cover Image
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {bannerImage[0]?.url ? (
                  <div className="relative w-full max-w-md h-36 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                    <Image
                      src={bannerImage[0].url}
                      alt="Collection Banner"
                      fill
                      sizes="(max-width: 768px) 100vw, 448px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBannerImage([])}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow-xs"
                      title="Remove banner"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full max-w-md h-32 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#076E46] bg-slate-50/60 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-[#076E46] transition cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#076E46]" />
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] font-semibold">Upload banner photo</span>
                        <span className="text-[10px] text-slate-400">Recommended 16:9 or 21:9 landscape</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Display Order & Dates (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border border-slate-200 shadow-2xs bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#060d11]">
                Settings &amp; Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Priority
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Lower numbers appear first in menu and homepage bars.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Campaign Dates (Optional)</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
