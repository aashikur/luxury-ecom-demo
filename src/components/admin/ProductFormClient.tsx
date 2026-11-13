'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus, X } from 'lucide-react';
import MediaUploader, { MediaItem } from '@/components/admin/MediaUploader';
import { ProductType, ProductStatus, StockStatus } from '@/models/Product';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  Textarea,
  Badge,
  Breadcrumb,
} from '@/components/ui';

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

  // Total stock calculation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingVariants = product?.variants || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantsSumStock = existingVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
  const totalStock = product?.totalStock ?? (existingVariants.length > 0 ? variantsSumStock : 0);

  const [images, setImages] = useState<MediaItem[]>(product?.media || product?.images || []);
  const initialKeys = useRef<Set<string>>(
    new Set((product?.images || []).map((img: MediaItem) => img.key))
  );
  const sessionUploadedKeys = useRef<string[]>([]);

  // Main Form State
  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    productType: (product?.productType as ProductType) || 'CLOTHING',
    hasVariants: product?.hasVariants !== undefined ? Boolean(product.hasVariants) : existingVariants.length > 0,
    price: product?.basePrice ?? (isEdit ? 0 : ''),
    discountPrice: product?.discountPrice ?? '',
    sku: product?.sku || '',
    stock: isEdit ? totalStock : 0,
    stockStatus: (product?.stockStatus as StockStatus) || 'AUTO',
    brandName: product?.brandName || '',
    categoryId: product?.categoryId || '',
    categorySlug: product?.categorySlug || '',
    categoryPath: (product?.categoryPath as string[]) || [],
    primaryCategory: product?.primaryCategory || (isEdit ? 'Garments' : ''),
    collections: (product?.collections as string[]) || ['winter-drop-2026'],
    status: (product?.status as ProductStatus) || (product?.isActive ? 'PUBLISHED' : 'DRAFT'),
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
      try {
        await Promise.all(
          keysToClean.map((key) =>
            fetch(`/api/upload?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
          )
        );
      } catch (e) {
        console.error('Failed to cleanup uncommitted uploaded keys:', e);
      }
    }
    router.push('/admin/products');
  };

  const findCategoryInTree = (nodes: CategoryNode[], id: string): CategoryNode | null => {
    for (const node of nodes) {
      if (node._id === id) return node;
      if (node.children?.length > 0) {
        const found = findCategoryInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeRoot = selectedRootId ? findCategoryInTree(categoryTree, selectedRootId) : null;
  const activeParentList = activeRoot?.children || [];
  const activeParent = selectedParentId ? findCategoryInTree(activeParentList, selectedParentId) : null;
  const activeSubList = activeParent?.children || [];
  const activeSub = selectedSubId ? findCategoryInTree(activeSubList, selectedSubId) : null;

  const applyCategorySelection = (rootId: string, parentId: string, subId: string) => {
    const root = rootId ? findCategoryInTree(categoryTree, rootId) : null;
    const parent = parentId && root ? findCategoryInTree(root.children || [], parentId) : null;
    const sub = subId && parent ? findCategoryInTree(parent.children || [], subId) : null;
    const active = sub || parent || root;

    if (active) {
      const pathSlugs = [...(active.ancestors || []), active.slug];
      setForm((prev) => ({
        ...prev,
        categoryId: active._id,
        categorySlug: active.slug,
        categoryPath: pathSlugs,
        primaryCategory: active.name,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        categoryId: '',
        categorySlug: '',
        categoryPath: [],
      }));
    }
  };

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

  const handleToggleCollection = (slug: string) => {
    setForm((prev) => {
      const exists = prev.collections.includes(slug);
      const nextCollections = exists
        ? prev.collections.filter((c) => c !== slug)
        : [...prev.collections, slug];
      return { ...prev, collections: nextCollections };
    });
  };

  const handleAddCustomTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const rawTitle = customTagInput.trim();
      if (!rawTitle) return;

      try {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: rawTitle, isActive: true }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          await fetchTaxonomies();
          const newSlug = data.data.slug;
          if (!form.collections.includes(newSlug)) {
            setForm((prev) => ({
              ...prev,
              collections: [...prev.collections, newSlug],
            }));
          }
        }
      } catch (err) {
        console.error('Failed to create collection in DB:', err);
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
      const fallbackSlug =
        product?.slug ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') ||
        'new-product';

      const payload = {
        title: form.title,
        description: form.description,
        productType: form.productType,
        hasVariants: form.hasVariants,
        basePrice: Number(form.price) || 0,
        discountPrice: form.discountPrice !== '' ? Number(form.discountPrice) : undefined,
        sku: form.sku.trim(),
        brandName: form.brandName.trim(),
        stockStatus: form.stockStatus,
        categoryId: form.categoryId || undefined,
        categorySlug: form.categorySlug || undefined,
        categoryPath: form.categoryPath.length > 0 ? form.categoryPath : undefined,
        categoryName: form.primaryCategory || 'Garments',
        primaryCategory: form.primaryCategory || 'Garments',
        collections: form.collections,
        status: form.status,
        isActive: form.status === 'PUBLISHED',
      };

      let finalVariants = existingVariants;
      let finalTotalStock = Number(form.stock) || 0;

      if (!form.hasVariants) {
        finalVariants = [];
        finalTotalStock = Number(form.stock) || 0;
      } else {
        if (existingVariants.length > 0) {
          if (existingVariants.length === 1) {
            finalVariants = [
              {
                ...existingVariants[0],
                stock: Number(form.stock) || 0,
                stockStatus: form.stockStatus,
              },
            ];
          } else {
            finalVariants = existingVariants;
          }
        } else {
          finalVariants = [
            {
              size: form.productType === 'CLOTHING' ? 'M' : '',
              label: form.productType === 'CLOTHING' ? 'M' : 'Default Variant',
              stock: Number(form.stock) || 0,
              sku: `${fallbackSlug.toUpperCase()}-DEF`,
              stockStatus: form.stockStatus,
              isActive: true,
            },
          ];
        }
      }

      const formattedMedia = (images.length > 0 ? images : [
        {
          url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          key: 'seed/placeholder.webp',
        },
      ]).map((img: any) => ({
        ...img,
        type: img.type || 'IMAGE',
      }));

      if (isEdit && product) {
        const res = await fetch(`/api/products/${product._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            totalStock: finalTotalStock,
            variants: finalVariants,
            media: formattedMedia,
            images: formattedMedia,
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
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            totalStock: finalTotalStock,
            variants: finalVariants,
            media: formattedMedia,
            images: formattedMedia,
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    ...(isEdit && product?.title ? [{ label: product.title }] : []),
    { label: isEdit ? 'Edit' : 'New Product' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-950 text-emerald-200 border border-emerald-800 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header (Matching Image 1: Locked Hierarchy) */}
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-[#060d11]">
          {isEdit ? `Edit ${product?.title || 'Product'}` : 'New Product'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isEdit ? 'Update the product details below.' : 'Add a new product to your catalog.'}
        </p>
      </div>

      {/* Unified 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Information & Media */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Update the product details and save your changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Product Title */}
              <Input
                label="Name"
                required
                placeholder="Product name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              {/* Description */}
              <Textarea
                label="Description"
                rows={4}
                placeholder="Product description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              {/* Price & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />

                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>

              {/* Secondary Details (Clean & Minimal) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <Input
                  label="Discount Price"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Optional"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                />

                <Input
                  label="SKU"
                  placeholder="e.g. PRO-001"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />

                <Input
                  label="Brand"
                  placeholder="e.g. Apple"
                  value={form.brandName}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                />
              </div>

              {/* Product Type & Variant Mode (Minimal & Clean) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Select
                  label="Product Type"
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value as ProductType })}
                >
                  <option value="CLOTHING">Clothing & Apparel</option>
                  <option value="GADGET">Gadgets & Tech</option>
                  <option value="REGULAR">Regular Product</option>
                  <option value="FOOD">Food & Beverage</option>
                  <option value="SERVICE">Service</option>
                </Select>

                <div className="space-y-1.5 text-xs">
                  <label className="block font-semibold text-slate-700">Variants</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasVariants: !form.hasVariants })}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span>{form.hasVariants ? 'Multi-Variant Matrix' : 'Single SKU'}</span>
                    <Badge variant={form.hasVariants ? 'success' : 'secondary'}>
                      {form.hasVariants ? 'Variants On' : 'Regular'}
                    </Badge>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Media Uploader */}
          <MediaUploader
            value={images}
            onChange={handleImagesChange}
            multiple={true}
            maxFiles={8}
            aspectRatio="3:4"
          />
        </div>

        {/* Right Column: Organization (Simplified, Clean, Unboxed) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader bordered={false} className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Organization</CardTitle>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                >
                  + New
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category (Clean, Direct Selects - No Icons, No Nested Backgrounds) */}
              <Select
                label="Category"
                value={selectedRootId}
                disabled={isLoadingTaxonomies}
                onChange={(e) => {
                  const newRootId = e.target.value;
                  setSelectedRootId(newRootId);
                  setSelectedParentId('');
                  setSelectedSubId('');
                  applyCategorySelection(newRootId, '', '');
                }}
              >
                <option value="">Select Category...</option>
                {categoryTree.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              {/* Sub-Category (Only shown if root has children) */}
              {activeParentList.length > 0 && (
                <Select
                  label="Subcategory"
                  value={selectedParentId}
                  onChange={(e) => {
                    const newParentId = e.target.value;
                    setSelectedParentId(newParentId);
                    setSelectedSubId('');
                    applyCategorySelection(selectedRootId, newParentId, '');
                  }}
                >
                  <option value="">Select Subcategory...</option>
                  {activeParentList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              )}

              {/* Item Type (Only shown if parent has children) */}
              {activeSubList.length > 0 && (
                <Select
                  label="Item Type"
                  value={selectedSubId}
                  onChange={(e) => {
                    const newSubId = e.target.value;
                    setSelectedSubId(newSubId);
                    applyCategorySelection(selectedRootId, selectedParentId, newSubId);
                  }}
                >
                  <option value="">Select Item Type...</option>
                  {activeSubList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              )}

              {/* Status Dropdown (Minimal Shopify/WordPress Copy) */}
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
              >
                <option value="PUBLISHED">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </Select>

              {/* Stock Status Override (Clean) */}
              <Select
                label="Stock Status"
                value={form.stockStatus}
                onChange={(e) => setForm({ ...form, stockStatus: e.target.value as StockStatus })}
              >
                <option value="AUTO">Auto</option>
                <option value="FORCE_OUT_OF_STOCK">Force Out of Stock</option>
                <option value="PRE_ORDER">Pre-Order</option>
              </Select>

              {/* Marketing Collections Tags (No Icons) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 text-xs">
                  Collections
                </label>

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

                <Input
                  placeholder="+ Add new collection to database (press Enter)"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                />

                {form.collections.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {form.collections.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700"
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
            </CardContent>
          </Card>

          {/* Action Buttons (Matching Image 1) */}
          <div className="space-y-2.5">
            <Button
              type="submit"
              variant="default"
              isLoading={isSaving}
              className="w-full h-10 text-xs"
            >
              Save Changes
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full h-10 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Category</CardTitle>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input
                  label="Category Name"
                  required
                  placeholder="e.g. Smart Watches"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />

                <Select
                  label="Parent Category"
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                >
                  <option value="">None (Root Category)</option>
                  {categoryTree.map((root) => (
                    <React.Fragment key={root._id}>
                      <option value={root._id}>{root.name}</option>
                      {root.children?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          &nbsp;&nbsp;↳ {sub.name}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </Select>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCategoryModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" isLoading={isCreatingCategory}>
                    Create
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
