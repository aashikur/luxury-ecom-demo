'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Plus, Tag, Layers, ChevronRight, X } from 'lucide-react';
import MediaUploader, { MediaItem } from '@/components/admin/MediaUploader';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  ancestors: string[];
  level: number;
  children: CategoryNode[];
}

interface CollectionItem {
  _id: string;
  title: string;
  slug: string;
  badgeText?: string;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any;
}

export default function ProductFormClient({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Categories & Collections state from DB
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [availableCollections, setAvailableCollections] = useState<CollectionItem[]>([]);
  const [isLoadingTaxonomies, setIsLoadingTaxonomies] = useState(true);

  // Cascading Category selection states
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string>(product?.categoryId || '');

  // Quick Add Category Modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Custom collection tag input
  const [customTagInput, setCustomTagInput] = useState('');

  // Calculate existing stock or default to 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalStock = product?.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;

  const [images, setImages] = useState<MediaItem[]>(product?.images || []);
  const initialKeys = useRef<Set<string>>(
    new Set((product?.images || []).map((img: MediaItem) => img.key))
  );
  const sessionUploadedKeys = useRef<string[]>([]);

  // Main Form State
  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.basePrice ?? (isEdit ? 0 : ''),
    stock: isEdit ? totalStock : '',
    categoryId: product?.categoryId || '',
    categorySlug: product?.categorySlug || '',
    categoryPath: product?.categoryPath || [],
    primaryCategory: product?.primaryCategory || (isEdit ? 'Heavyweight Hoodies' : ''),
    collections: (product?.collections as string[]) || ['winter-drop-2026'],
    status: isEdit ? (product?.isActive ? 'Active' : 'Draft') : 'Draft',
  });

  // Fetch Category Tree and Collections from Database
  const fetchTaxonomies = async () => {
    try {
      setIsLoadingTaxonomies(true);
      const [catRes, colRes] = await Promise.all([
        fetch('/api/categories?tree=true'),
        fetch('/api/collections'),
      ]);
      const catData = await catRes.json();
      const colData = await colRes.json();

      if (catData.success && Array.isArray(catData.data)) {
        setCategoryTree(catData.data);
      }
      if (colData.success && Array.isArray(colData.data)) {
        setAvailableCollections(colData.data);
      }
    } catch (err) {
      console.error('Failed to load taxonomies:', err);
    } finally {
      setIsLoadingTaxonomies(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  // Sync Category Hierarchy if Editing an existing product
  useEffect(() => {
    if (categoryTree.length > 0 && product?.categoryId) {
      // Find where this categoryId sits in the tree
      for (const root of categoryTree) {
        if (root._id === product.categoryId) {
          setSelectedRootId(root._id);
          return;
        }
        for (const parent of root.children || []) {
          if (parent._id === product.categoryId) {
            setSelectedRootId(root._id);
            setSelectedParentId(parent._id);
            return;
          }
          for (const sub of parent.children || []) {
            if (sub._id === product.categoryId) {
              setSelectedRootId(root._id);
              setSelectedParentId(parent._id);
              setSelectedSubId(sub._id);
              return;
            }
          }
        }
      }
    }
  }, [categoryTree, product?.categoryId]);

  const handleImagesChange = (newImages: MediaItem[]) => {
    newImages.forEach((img) => {
      if (img.key && !initialKeys.current.has(img.key) && !sessionUploadedKeys.current.includes(img.key)) {
        sessionUploadedKeys.current.push(img.key);
      }
    });
    setImages(newImages);
  };

  const handleCancel = async () => {
    if (sessionUploadedKeys.current.length > 0) {
      const keysToClean = [...sessionUploadedKeys.current];
      sessionUploadedKeys.current = [];
      await Promise.allSettled(
        keysToClean
          .filter((k) => !k.startsWith('seed/'))
          .map((key) =>
            fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
              method: 'DELETE',
            })
          )
      );
    }
    router.push('/admin/products');
  };

  // Derive child categories dynamically based on selected parent
  const activeRoot = categoryTree.find((r) => r._id === selectedRootId);
  const activeParentList = activeRoot?.children || [];
  const activeParent = activeParentList.find((p) => p._id === selectedParentId);
  const activeSubList = activeParent?.children || [];
  const activeSub = activeSubList.find((s) => s._id === selectedSubId);

  // Compute final selected category object
  const finalCategory = activeSub || activeParent || activeRoot;

  // Update Form Category Fields when Cascading Selection changes
  const applyCategorySelection = (rootId: string, parentId: string, subId: string) => {
    const root = categoryTree.find((r) => r._id === rootId);
    const parent = root?.children?.find((p) => p._id === parentId);
    const sub = parent?.children?.find((s) => s._id === subId);

    const target = sub || parent || root;
    if (target) {
      const path = [...(target.ancestors || []), target.slug];
      setForm((prev) => ({
        ...prev,
        categoryId: target._id,
        categorySlug: target.slug,
        categoryPath: path,
        primaryCategory: target.name,
      }));
    }
  };

  // Quick Create New Category handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          parentId: newCatParentId || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        await fetchTaxonomies();
        setShowAddCategoryModal(false);
        setNewCatName('');
        setNewCatParentId('');
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      console.error(err);
      alert('Network error creating category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Toggle Collection selection pill
  const handleToggleCollection = (slug: string) => {
    setForm((prev) => {
      const exists = prev.collections.includes(slug);
      const nextCollections = exists
        ? prev.collections.filter((c) => c !== slug)
        : [...prev.collections, slug];
      return { ...prev, collections: nextCollections };
    });
  };

  // Add custom collection tag
  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanSlug = customTagInput
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (cleanSlug && !form.collections.includes(cleanSlug)) {
        setForm((prev) => ({
          ...prev,
          collections: [...prev.collections, cleanSlug],
        }));
      }
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (slugToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      collections: prev.collections.filter((c) => c !== slugToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        basePrice: Number(form.price) || 0,
        categoryId: form.categoryId || undefined,
        categorySlug: form.categorySlug || undefined,
        categoryPath: form.categoryPath.length > 0 ? form.categoryPath : undefined,
        primaryCategory: form.primaryCategory || 'Heavyweight Hoodies',
        collections: form.collections,
        isActive: form.status === 'Active',
      };

      if (isEdit && product) {
        // Edit Mode: PUT /api/products/[id]
        const currentVariants = product.variants || [];
        const updatedVariants = currentVariants.length > 0
          ? currentVariants.map((v: { size: string; stock: number; sku: string }, idx: number) =>
              idx === 0 ? { ...v, stock: Number(form.stock) || 0 } : v
            )
          : [{ size: 'M', stock: Number(form.stock) || 0, sku: `${(product.slug || 'product').toUpperCase()}-M` }];

        const res = await fetch(`/api/products/${product._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            variants: updatedVariants,
            images: images,
          }),
        });

        const data = await res.json();
        if (data.success) {
          sessionUploadedKeys.current = [];
          setToast('Product updated successfully!');
          setTimeout(() => {
            router.push('/admin/products');
            router.refresh();
          }, 1000);
        } else {
          alert(data.error || 'Failed to update product');
          setIsSaving(false);
        }
      } else {
        // Create Mode: POST /api/products
        const fallbackSlug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'new-product';
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            variants: [
              {
                size: 'M',
                stock: Number(form.stock) || 0,
                sku: `${fallbackSlug.toUpperCase()}-M`,
              },
            ],
            images: images.length > 0 ? images : [
              {
                url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
                key: 'seed/placeholder.webp',
              },
            ],
          }),
        });

        const data = await res.json();
        if (data.success) {
          sessionUploadedKeys.current = [];
          setToast('Product created successfully!');
          setTimeout(() => {
            router.push('/admin/products');
            router.refresh();
          }, 1000);
        } else {
          alert(data.error || 'Failed to create product');
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving product');
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-950 text-emerald-200 border border-emerald-800 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header with Title and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/products" className="hover:text-slate-800 transition">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? `Edit: ${product?.title || 'Product'}` : 'New Product'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </div>

      {/* Unified 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Info & Media Uploader */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Product Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Product Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set core garment title, description, retail price, and inventory stock.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Heavyweight Acid-Wash Hoodie 450 GSM"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-xs shadow-2xs font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Description</label>
                <textarea
                  rows={4}
                  placeholder="Specify fabric weight (GSM), wash technique, fit profile, and care instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed shadow-2xs"
                />
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Price (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Reusable Universal Media & Gallery Card with Browser Compressor */}
          <MediaUploader
            value={images}
            onChange={handleImagesChange}
            multiple={true}
            maxFiles={8}
            aspectRatio="3:4"
            label="Product Media & Gallery"
            description="Add high-resolution garment photos. The first image will be used as the primary display cover."
            folder="products"
            disabled={isSaving}
          />
        </div>

        {/* Right Column: Taxonomy & Organization Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs h-fit">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Organization & Taxonomy</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Database-driven categories & collections</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCategoryModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition"
              title="Add a new category"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Category</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Cascading Category Tree Selectors */}
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Category Hierarchy</span>
              </div>

              {/* Level 0: Department / Root */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">1. Department (Root)</label>
                <select
                  value={selectedRootId}
                  disabled={isLoadingTaxonomies}
                  onChange={(e) => {
                    const newRootId = e.target.value;
                    setSelectedRootId(newRootId);
                    setSelectedParentId('');
                    setSelectedSubId('');
                    applyCategorySelection(newRootId, '', '');
                  }}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select Department...</option>
                  {categoryTree.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 1: Parent Group (Tops, Bottoms, Modest) */}
              {activeParentList.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">2. Section / Group</label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => {
                      const newParentId = e.target.value;
                      setSelectedParentId(newParentId);
                      setSelectedSubId('');
                      applyCategorySelection(selectedRootId, newParentId, '');
                    }}
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Section...</option>
                    {activeParentList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Level 2: Specific Subcategory (Hoodies, T-Shirts, Hijab) */}
              {activeSubList.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">3. Garment / Item Type</label>
                  <select
                    value={selectedSubId}
                    onChange={(e) => {
                      const newSubId = e.target.value;
                      setSelectedSubId(newSubId);
                      applyCategorySelection(selectedRootId, selectedParentId, newSubId);
                    }}
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Item Type...</option>
                    {activeSubList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Active Path Breadcrumb Badge */}
              {finalCategory && (
                <div className="pt-1.5 flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2 py-1 rounded">
                  <span>{activeRoot?.name}</span>
                  {activeParent && (
                    <>
                      <ChevronRight className="w-3 h-3 text-emerald-500" />
                      <span>{activeParent.name}</span>
                    </>
                  )}
                  {activeSub && (
                    <>
                      <ChevronRight className="w-3 h-3 text-emerald-500" />
                      <span className="font-semibold">{activeSub.name}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 2. Marketing Collections Multi-Select */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Marketing Collections</span>
              </div>

              {/* Quick toggle pills for existing collections */}
              <div className="flex flex-wrap gap-1.5">
                {availableCollections.map((col) => {
                  const isSelected = form.collections.includes(col.slug);
                  return (
                    <button
                      key={col._id}
                      type="button"
                      onClick={() => handleToggleCollection(col.slug)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {col.title}
                    </button>
                  );
                })}
              </div>

              {/* Active Tag Chips & Custom Tag Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-slate-500">
                  Custom Tags / Campaign Badges (Press Enter)
                </label>
                <input
                  type="text"
                  placeholder="e.g. flash-sale, oversized, fleece"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                />

                {form.collections.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {form.collections.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Product Status */}
            <div className="space-y-1.5 pt-1">
              <label className="font-semibold text-slate-700 block">Publish Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
              >
                <option value="Draft">Draft (Hidden from storefront)</option>
                <option value="Active">Active (Live on storefront)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2.5">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSaving
                  ? isEdit ? 'Saving Changes...' : 'Creating Product...'
                  : isEdit ? 'Save Changes' : 'Create Product'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full block py-2.5 px-4 text-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal: Quick Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Jackets, Hijab, Ghee"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Parent Category (Optional)</label>
                <select
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">None (Create as Root / Department)</option>
                  {categoryTree.map((root) => (
                    <React.Fragment key={root._id}>
                      <option value={root._id}>📁 {root.name}</option>
                      {root.children?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          &nbsp;&nbsp;↳ {sub.name}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Select a parent to nest it, or leave empty to make it a Root department.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition disabled:opacity-50"
                >
                  {isCreatingCategory ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
