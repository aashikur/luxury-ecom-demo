'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, ArrowLeft, Tag } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', key: '' }];
  const currentImage = images[activeImageIdx]?.url || images[0]?.url;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${product._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        alert(data.error || 'Failed to delete product');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting product');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Breadcrumb & Top Actions (Matching Reference Image 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-slate-800 transition">Dashboard</Link>
            <span>&gt;</span>
            <Link href="/admin/products" className="hover:text-slate-800 transition">Products</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-medium truncate max-w-xs">{product.title}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{product.title}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/admin/products/${product._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Matching Apex Image 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Details Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Product Details</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Name
              </label>
              <p className="text-sm font-semibold text-slate-900">{product.title}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Description
              </label>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {product.description || 'Full-featured luxury minimal garment with custom-milled fleece.'}
              </p>
            </div>

            {/* Status, Category & Created Row */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    product.isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Draft'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Category
                </label>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 inline-block">
                  {product.primaryCategory || 'Templates'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Created
                </label>
                <span className="text-slate-600 font-medium">
                  {new Date(product.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Collection Tags */}
            {product.collections?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Tagged Collections
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.collections.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono border border-slate-200 flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Image & Pricing Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Image Showcase */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Image</h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeImageIdx + 1} of {images.length}
              </span>
            </div>

            <div className="relative aspect-[4/5] w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
              <Image
                src={currentImage}
                alt={product.title}
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img: { url: string }, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-14 aspect-[3/4] rounded-md overflow-hidden border cursor-pointer ${
                      activeImageIdx === i ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Pricing & Inventory */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Pricing & Inventory</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Price</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {product.basePrice?.toLocaleString()}৳
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Stock</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {totalStock}
                </span>
              </div>

              {/* Variant breakdown table */}
              {product.variants?.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Size Matrix Breakdown
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {product.variants.map((v: any) => (
                      <div
                        key={v.size}
                        className="p-2 rounded-md bg-slate-50 border border-slate-100 text-center"
                      >
                        <span className="text-xs font-bold text-slate-500 block">{v.size}</span>
                        <strong className="text-xs font-mono text-slate-900 block mt-0.5">
                          {v.stock}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
