'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import { optimizeImageRuleBased } from '@/lib/imageCompressor';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Textarea,
  Breadcrumb,
} from '@/components/ui';

export interface CategoryFormData {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: { url: string; key: string };
  level?: number;
  displayOrder?: number;
  isFeaturedHome?: boolean;
  isActive?: boolean;
}

export interface ParentOption {
  _id: string;
  name: string;
  slug: string;
  level?: number;
  parentId?: string | null;
}

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialData?: CategoryFormData;
  availableParents?: ParentOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default function CategoryFormClient({
  mode,
  initialData,
  availableParents = [],
  onSuccess,
  onCancel,
  isModal = false,
}: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugLocked, setIsSlugLocked] = useState(!isEdit);
  const [description, setDescription] = useState(initialData?.description || '');
  const [parentId, setParentId] = useState<string>(initialData?.parentId || '');
  const [image, setImage] = useState<{ url: string; key: string }[]>(
    initialData?.image?.url ? [initialData.image] : []
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hidden flags with clean defaults
  const [isFeaturedHome] = useState(Boolean(initialData?.isFeaturedHome));
  const [isActive] = useState(
    initialData?.isActive !== undefined ? Boolean(initialData.isActive) : true
  );

  const [parents, setParents] = useState<ParentOption[]>(availableParents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch available parent categories if not passed
  useEffect(() => {
    if (availableParents.length === 0) {
      fetch('/api/categories?all=true')
        .then((res) => res.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const filtered = isEdit && initialData?._id
              ? res.data.filter((c: any) => c._id !== initialData._id)
              : res.data;
            setParents(
              filtered.map((c: any) => ({
                _id: String(c._id),
                name: c.name,
                slug: c.slug,
                level: typeof c.level === 'number' ? c.level : 0,
                parentId: c.parentId ? String(c.parentId) : null,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [availableParents, isEdit, initialData?._id]);

  // Hierarchical parent options: Root category followed by its indented children with ↳
  const hierarchicalParents = useMemo(() => {
    const filtered = parents.filter((p) => !isEdit || p._id !== initialData?._id);

    const roots: ParentOption[] = [];
    const childrenMap = new Map<string, ParentOption[]>();

    filtered.forEach((p) => {
      if (!p.parentId || p.level === 0) {
        roots.push(p);
      } else {
        const list = childrenMap.get(p.parentId) || [];
        list.push(p);
        childrenMap.set(p.parentId, list);
      }
    });

    const result: { _id: string; label: string }[] = [];
    const visited = new Set<string>();

    roots.forEach((root) => {
      result.push({ _id: root._id, label: root.name });
      visited.add(root._id);

      const children = childrenMap.get(root._id) || [];
      children.forEach((child) => {
        result.push({ _id: child._id, label: `\u00A0\u00A0↳ ${child.name}` });
        visited.add(child._id);

        const subChildren = childrenMap.get(child._id) || [];
        subChildren.forEach((sub) => {
          result.push({ _id: sub._id, label: `\u00A0\u00A0\u00A0\u00A0↳ ${sub.name}` });
          visited.add(sub._id);
        });
      });
    });

    filtered.forEach((p) => {
      if (!visited.has(p._id)) {
        const indent = p.level === 1 ? '\u00A0\u00A0↳ ' : p.level && p.level > 1 ? '\u00A0\u00A0\u00A0\u00A0↳ ' : '';
        result.push({ _id: p._id, label: `${indent}${p.name}` });
      }
    });

    return result;
  }, [parents, isEdit, initialData?._id]);

  // Live auto-slug generation when locked
  const handleNameChange = (val: string) => {
    setName(val);
    if (isSlugLocked) {
      setSlug(slugify(val));
    }
  };

  // Direct clean image upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingImage(true);
    try {
      const compression = await optimizeImageRuleBased(file, 1200);
      const formData = new FormData();
      formData.append('file', compression.file);
      formData.append('folder', 'categories');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImage([{ url: data.url, key: data.key }]);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImage([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      id: initialData?._id,
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      parentId: parentId || null,
      image: image[0] || { url: '', key: '' },
      isFeaturedHome,
      isActive,
    };

    try {
      const endpoint = '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      setToastMsg(isEdit ? 'Category updated successfully!' : 'Category created successfully!');

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push('/admin/categories');
          router.refresh();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Categories', href: '/admin/categories' },
    { label: isEdit ? 'Edit Category' : 'Create Category' },
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

      {/* Header section (when standalone page, not modal) */}
      {!isModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <Breadcrumb items={breadcrumbs} />
            <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
              {isEdit ? 'Edit Category' : 'Create Category'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/categories">
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
              <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Clean Minimal Layout */}
      <div className={`grid grid-cols-1 ${isModal ? 'gap-5' : 'lg:grid-cols-12 gap-6'}`}>
        {/* Left Column: Information & Media (8 cols on desktop) */}
        <div className={isModal ? 'space-y-5' : 'lg:col-span-8 space-y-5'}>
          <Card className="border border-slate-200 shadow-2xs bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#060d11]">
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Acid Wash Hoodies"
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
                    /category/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    disabled={isSlugLocked}
                    placeholder="acid-wash-hoodies"
                    className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-slate-900 font-mono text-xs disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <Textarea
                  placeholder="Optional category description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Clean Image Picker (No extra box borders, no thumbnail text) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Category Image
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {image[0]?.url ? (
                  <div className="relative w-28 h-36 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                    <Image
                      src={image[0].url}
                      alt="Category image"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black text-white transition cursor-pointer shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-28 h-36 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#076E46] bg-slate-50/60 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-[#076E46] transition cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#076E46]" />
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-slate-400" />
                        <span className="text-[11px] font-semibold">Upload photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Parent Category (4 cols on desktop) */}
        <div className={isModal ? 'space-y-5' : 'lg:col-span-4 space-y-5'}>
          <Card className="border border-slate-200 shadow-2xs bg-white rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#060d11]">
                Parent Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="">None</option>
                {hierarchicalParents.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Modal bottom actions (when embedded in slide-over drawer) */}
          {isModal && (
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#076E46] hover:bg-[#055C3A] text-white shadow-xs"
                size="sm"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
