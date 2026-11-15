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
  Globe,
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

export interface BrandFormData {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: { url: string; key: string };
  website?: string;
  order?: number;
  featured?: boolean;
  isActive?: boolean;
}

interface BrandFormProps {
  mode: 'create' | 'edit';
  initialData?: BrandFormData;
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

export default function BrandFormClient({
  mode,
  initialData,
}: BrandFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugLocked, setIsSlugLocked] = useState(!isEdit);
  const [description, setDescription] = useState(initialData?.description || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [order, setOrder] = useState<number>(initialData?.order ?? 0);

  // Hidden flags with clean defaults
  const [featured] = useState(Boolean(initialData?.featured));
  const [isActive] = useState(
    initialData?.isActive !== undefined ? Boolean(initialData.isActive) : true
  );

  const [logo, setLogo] = useState<{ url: string; key: string }[]>(
    initialData?.logo?.url ? [initialData.logo] : []
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (isSlugLocked) {
      setSlug(slugify(val));
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const compression = await optimizeImageRuleBased(file, 800);
      const formData = new FormData();
      formData.append('file', compression.file);
      formData.append('folder', 'brands');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload brand logo');
      }

      setLogo([{ url: data.url, key: data.key }]);
    } catch (err: any) {
      alert(err.message || 'Logo upload failed');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Brand name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      id: initialData?._id,
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      logo: logo[0] || { url: '', key: '' },
      website: website.trim(),
      order: Number(order) || 0,
      featured,
      isActive,
    };

    try {
      const endpoint = '/api/brands';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save brand');
      }

      setToastMsg(isEdit ? 'Brand updated successfully!' : 'Brand created successfully!');

      setTimeout(() => {
        router.push('/admin/brands');
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
    { label: 'Brands', href: '/admin/brands' },
    { label: isEdit ? 'Edit Brand' : 'Create Brand' },
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
            {isEdit ? 'Edit Brand' : 'Create Brand'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/brands">
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
            <span>{isEdit ? 'Save Changes' : 'Create Brand'}</span>
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
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Aurem Luxury"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
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
                    /brand/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    disabled={isSlugLocked}
                    placeholder="aurem-luxury"
                    className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-slate-900 font-mono text-xs disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Website URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="url"
                    placeholder="https://brand-website.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-9 pl-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <Textarea
                  placeholder="Optional brand heritage or summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Clean Brand Logo Upload */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Brand Logo
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />

                {logo[0]?.url ? (
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                    <Image
                      src={logo[0].url}
                      alt="Brand Logo"
                      fill
                      sizes="112px"
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setLogo([])}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow-xs"
                      title="Remove logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="w-28 h-28 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#076E46] bg-slate-50/60 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-[#076E46] transition cursor-pointer"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#076E46]" />
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] font-semibold">Upload logo</span>
                        <span className="text-[10px] text-slate-400">Square 1:1</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Display Priority (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border border-slate-200 shadow-2xs bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#060d11]">
                Settings
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
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Lower numbers appear first in catalog brand lists.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
