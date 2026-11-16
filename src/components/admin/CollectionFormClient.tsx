'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Plus,
  Trash2,
  Search,
  FolderTree,
} from 'lucide-react';
import { optimizeImageRuleBased } from '@/lib/imageCompressor';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Textarea,
  Breadcrumb,
} from '@/components/ui';

export interface CollectionFormData {
  _id?: string;
  title: string;
  slug: string;
  parentSlug?: string | null;
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
  const [parentSlug, setParentSlug] = useState<string>(initialData?.parentSlug || '');
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

  // Parent collection selector options
  const [allCollections, setAllCollections] = useState<CollectionFormData[]>([]);

  // Attached products state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attachedProducts, setAttachedProducts] = useState<any[]>([]);
  const [isLoadingAttached, setIsLoadingAttached] = useState(false);

  // Bulk Attach Modal state
  const [showAttachModal, setShowAttachModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);

  // Fetch collections for parent dropdown
  useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAllCollections(data.data.filter((c: any) => c._id !== initialData?._id));
        }
      })
      .catch((err) => console.error('Failed to load collections:', err));
  }, [initialData?._id]);

  // Fetch products attached to this collection
  const refreshAttachedProducts = async () => {
    if (!initialData?.slug) return;
    setIsLoadingAttached(true);
    try {
      const res = await fetch(`/api/products?collection=${encodeURIComponent(initialData.slug)}&limit=100`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAttachedProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load attached products:', err);
    } finally {
      setIsLoadingAttached(false);
    }
  };

  useEffect(() => {
    if (isEdit && initialData?.slug) {
      refreshAttachedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialData?.slug]);

  // Open attach modal and load catalog products
  const handleOpenAttachModal = async () => {
    setShowAttachModal(true);
    try {
      const res = await fetch('/api/products?all=true&limit=200', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCatalogProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load catalog products for modal:', err);
    }
  };

  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAttachSelected = async () => {
    if (selectedProductIds.length === 0 || !slug) return;
    setIsAttaching(true);
    try {
      const res = await fetch('/api/collections/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionSlug: slug,
          productIds: selectedProductIds,
          action: 'attach',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAttachModal(false);
        setSelectedProductIds([]);
        await refreshAttachedProducts();
      } else {
        alert(data.error || 'Failed to attach products');
      }
    } catch (err) {
      console.error('Error attaching products:', err);
    } finally {
      setIsAttaching(false);
    }
  };

  const handleDetachProduct = async (productId: string) => {
    if (!slug) return;
    try {
      const res = await fetch('/api/collections/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionSlug: slug,
          productIds: [productId],
          action: 'detach',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAttachedProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (err) {
      console.error('Failed to detach product:', err);
    }
  };

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      alert(msg);
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
      parentSlug: parentSlug ? parentSlug.trim() : null,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Collections', href: '/admin/collections' },
    { label: isEdit ? 'Edit Collection' : 'Create Collection' },
  ];

  const filteredModalProducts = catalogProducts.filter((p) => {
    const q = searchFilter.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

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

              {/* Parent Collection Selector (Parent-Child Hierarchy) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Parent Collection (Hierarchy)
                </label>
                <select
                  value={parentSlug}
                  onChange={(e) => setParentSlug(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-emerald-600 shadow-2xs"
                >
                  <option value="">[ None - Top Level Parent Collection ]</option>
                  {allCollections
                    .filter((c) => !c.parentSlug)
                    .map((col) => (
                      <option key={col._id} value={col.slug}>
                        {col.title} (/collections/{col.slug})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Child collections appear as horizontal sibling navigation pills on the storefront.
                </p>
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

          {/* Attached Products Section (Shown when editing or slug exists) */}
          {isEdit && slug && (
            <Card className="border border-slate-200 shadow-2xs bg-white rounded-xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-[#060d11]">
                    Collection Products ({attachedProducts.length})
                  </CardTitle>
                  <CardDescription>
                    Products currently merchandised inside this collection.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAttachModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#076E46] hover:bg-[#055C3A] transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Products</span>
                </button>
              </CardHeader>
              <CardContent>
                {isLoadingAttached ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading attached products...</div>
                ) : attachedProducts.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Stock</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attachedProducts.map((prod) => {
                          const thumb = prod.media?.[0]?.url || prod.images?.[0]?.url || '/placeholder.webp';
                          return (
                            <tr key={prod._id} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 flex items-center gap-2.5">
                                <div className="relative w-8 h-10 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                                  <Image src={thumb} alt="" fill className="object-cover" />
                                </div>
                                <span className="font-medium text-slate-900 truncate max-w-xs">{prod.title}</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{prod.categoryName || 'General'}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">৳{prod.basePrice}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    prod.totalStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  {prod.totalStock > 0 ? `${prod.totalStock} in stock` : 'Out of stock'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDetachProduct(prod._id)}
                                  className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
                                  title="Remove from this collection"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No products attached yet. Click &quot;Attach Products&quot; to merchandise items into this collection.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
                <div className="text-xs font-semibold text-slate-700">
                  Campaign Dates (Optional)
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

      {/* Bulk Attach Products Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attach Products to Collection</h3>
                <p className="text-xs text-slate-500">
                  Select catalog products to add to &quot;{title || slug}&quot;
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title or SKU..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredModalProducts.length > 0 ? (
                filteredModalProducts.map((prod) => {
                  const isAlreadyAttached = attachedProducts.some((p) => p._id === prod._id);
                  const isChecked = selectedProductIds.includes(prod._id);
                  const thumb = prod.media?.[0]?.url || prod.images?.[0]?.url || '/placeholder.webp';

                  return (
                    <label
                      key={prod._id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition ${
                        isAlreadyAttached ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isAlreadyAttached}
                        checked={isAlreadyAttached || isChecked}
                        onChange={() => !isAlreadyAttached && handleToggleProductSelection(prod._id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="relative w-8 h-10 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                        <Image src={thumb} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{prod.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {prod.categoryName} • ৳{prod.basePrice}
                          {isAlreadyAttached && ' • (Already in collection)'}
                        </p>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No products matched &quot;{searchFilter}&quot;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                {selectedProductIds.length} product(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAttachModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedProductIds.length === 0 || isAttaching}
                  onClick={handleAttachSelected}
                  className="bg-[#076E46] hover:bg-[#055C3A] text-white shadow-xs"
                >
                  {isAttaching && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  <span>Attach Selected</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
