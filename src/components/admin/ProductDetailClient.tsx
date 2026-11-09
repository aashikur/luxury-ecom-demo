'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, ArrowLeft, Check, Sparkles, Tag } from 'lucide-react';

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
      {/* 1. Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-850">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-300 transition">Dashboard</Link>
            <span>&gt;</span>
            <Link href="/admin/products" className="hover:text-zinc-300 transition">Products</Link>
            <span>&gt;</span>
            <span className="text-zinc-300 font-medium truncate max-w-xs">{product.title}</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">{product.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Matching Apex Image 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Details Card */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-850 rounded-lg p-6 space-y-6">
          <div className="border-b border-zinc-850 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Product Details</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Name
              </label>
              <p className="text-sm font-semibold text-white">{product.title}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Slug (URL Identifier)
              </label>
              <code className="text-xs font-mono text-emerald-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 inline-block">
                /products/{product.slug}
              </code>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Description
              </label>
              <p className="text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-md border border-zinc-850">
                {product.description || 'No description provided.'}
              </p>
            </div>

            {/* Status & Category Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-850">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    product.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{product.isActive ? 'Active' : 'Draft'}</span>
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Category
                </label>
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-[11px] font-medium text-zinc-200 uppercase tracking-wide inline-block border border-zinc-700">
                  {product.primaryCategory || 'Garment'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Created
                </label>
                <span className="text-zinc-400 font-medium">
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
              <div className="pt-4 border-t border-zinc-850">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  Tagged Collections
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.collections.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 text-[11px] font-mono flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-zinc-500" />
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
          <div className="bg-zinc-900/60 border border-zinc-850 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Garment Photo</h2>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                {activeImageIdx + 1} / {images.length}
              </span>
            </div>

            <div className="relative aspect-[3/4] w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
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
                    className={`relative w-14 aspect-[3/4] rounded overflow-hidden border cursor-pointer ${
                      activeImageIdx === i ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Pricing & Inventory */}
          <div className="bg-zinc-900/60 border border-zinc-850 rounded-lg p-6 space-y-4">
            <div className="border-b border-zinc-850 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Pricing & Inventory</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-md bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400 font-medium">Selling Price:</span>
                <span className="text-lg font-bold text-white font-mono">
                  {product.basePrice?.toLocaleString()}৳
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400 font-medium">Total In-Stock:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {totalStock} units
                </span>
              </div>

              {/* Variant breakdown table */}
              {product.variants?.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                    Stock By Size Matrix
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {product.variants.map((v: any) => (
                      <div
                        key={v.size}
                        className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-center"
                      >
                        <span className="text-xs font-bold text-zinc-400 block">{v.size}</span>
                        <strong className="text-sm font-mono text-white block mt-0.5">
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
