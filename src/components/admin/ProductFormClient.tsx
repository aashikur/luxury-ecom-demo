'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import MediaUploader, { MediaItem } from '@/components/admin/MediaUploader';

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

  // Calculate existing stock or default to 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalStock = product?.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;

  const [images, setImages] = useState<MediaItem[]>(product?.images || []);

  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.basePrice ?? (isEdit ? 0 : ''),
    stock: isEdit ? totalStock : '',
    primaryCategory: product?.primaryCategory || (isEdit ? 'Heavyweight Hoodies' : ''),
    status: isEdit ? (product?.isActive ? 'Active' : 'Draft') : 'Draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
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
            title: form.title,
            description: form.description,
            basePrice: Number(form.price) || 0,
            primaryCategory: form.primaryCategory || 'Heavyweight Hoodies',
            isActive: form.status === 'Active',
            variants: updatedVariants,
            images: images,
          }),
        });

        const data = await res.json();
        if (data.success) {
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
            title: form.title,
            description: form.description,
            basePrice: Number(form.price) || 0,
            primaryCategory: form.primaryCategory || 'Heavyweight Hoodies',
            isActive: form.status === 'Active',
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Breadcrumbs & Title (Matching Apex Reference Image 1 & 2) */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/admin" className="hover:text-slate-800 transition">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/admin/products" className="hover:text-slate-800 transition">Products</Link>
          <span>&gt;</span>
          {isEdit ? (
            <>
              <Link href={`/admin/products/${product?._id}`} className="hover:text-slate-800 transition truncate max-w-xs">
                {product?.title}
              </Link>
              <span>&gt;</span>
              <span className="text-slate-900 font-medium">Edit</span>
            </>
          ) : (
            <span className="text-slate-900 font-medium">New Product</span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEdit ? `Edit ${product?.title}` : 'New Product'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isEdit ? 'Update the product details below.' : 'Add a new product to the catalog.'}
        </p>
      </div>

      {/* 2. Main Two-Column Layout (Matching Apex Reference Image 1 & 2) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Information Card + Media Gallery Card */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Product Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Product Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEdit
                  ? 'Update the product details and save your changes.'
                  : 'Enter the basic details for the new product.'}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Product name"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-xs shadow-2xs"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Description</label>
                <textarea
                  rows={4}
                  placeholder="Product description"
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
            onChange={setImages}
            multiple={true}
            maxFiles={8}
            aspectRatio="3:4"
            label="Product Media & Gallery"
            description="Add high-resolution garment photos. The first image will be used as the primary display cover."
            folder="products"
            disabled={isSaving}
          />
        </div>

        {/* Right Column: Organization Card (Matching Apex Reference Image 1 & 2) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Organization</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Category</label>
              <select
                value={form.primaryCategory}
                onChange={(e) => setForm({ ...form, primaryCategory: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
              >
                <option value="" disabled>Select category</option>
                <option value="Heavyweight Hoodies">Heavyweight Hoodies</option>
                <option value="Oversized Tees">Oversized Tees</option>
                <option value="Streetwear Archive">Streetwear Archive</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Templates">Templates</option>
                <option value="Plans">Plans</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Action Buttons (Full-Width) */}
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

              <Link
                href="/admin/products"
                className="w-full block py-2.5 px-4 text-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
