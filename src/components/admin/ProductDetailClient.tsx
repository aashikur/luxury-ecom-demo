'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Tag } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Breadcrumb,
} from '@/components/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images =
    (product.media?.length > 0 ? product.media : null) || [
      { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', key: '', type: 'IMAGE' },
    ];
  const currentImage = images[activeImageIdx]?.url || images[0]?.url;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalStock = product.totalStock ?? (product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0);
  const displayStatus = product.status || (product.isActive ? 'PUBLISHED' : 'DRAFT');
  const isPublished = displayStatus === 'PUBLISHED';

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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: product.title },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Actions (Matching Image 1 & 2 standard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">{product.title}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/admin/products/${product._id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 shadow-2xs">
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </Button>
          </Link>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Details Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Name
                </label>
                <p className="text-sm font-semibold text-[#060d11]">{product.title}</p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Description
                </label>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs">
                  {product.description || 'Full-featured luxury minimal garment with custom-milled fleece.'}
                </p>
              </div>

              {/* Status, Category & Created Row */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Status
                  </label>
                  <div className="flex flex-col gap-1 items-start">
                    <Badge variant={isPublished ? 'success' : 'warning'}>
                      {isPublished ? 'Active' : 'Draft'}
                    </Badge>
                    {product.stockStatus === 'FORCE_OUT_OF_STOCK' && (
                      <span className="text-[9px] font-bold text-red-600 uppercase">
                        FORCE OOS
                      </span>
                    )}
                    {product.stockStatus === 'PRE_ORDER' && (
                      <span className="text-[9px] font-bold text-blue-600 uppercase">
                        PRE-ORDER
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Category & Type
                  </label>
                  <div className="space-y-1">
                    <Badge variant="secondary">
                      {product.categoryName || 'General'}
                    </Badge>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px] font-mono border border-slate-100 block w-fit">
                      {product.productType || 'CLOTHING'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
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
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono border border-slate-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Image & Pricing Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Image Showcase */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Image</CardTitle>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeImageIdx + 1} of {images.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
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
                <div className="flex gap-2 pt-1">
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
            </CardContent>
          </Card>

          {/* Card 2: Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Base Price</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  ${product.basePrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Total Stock</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {totalStock} units
                </span>
              </div>

              {/* Variant breakdown table */}
              {product.variants?.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Variant Matrix Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {product.variants.map((v: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center"
                      >
                        <span className="text-xs font-bold text-slate-700 block truncate">
                          {v.label || v.size || v.sku || `Variant ${idx + 1}`}
                        </span>
                        <strong className="text-xs font-mono text-slate-900 block mt-0.5">
                          {v.stock} in stock
                        </strong>
                        {v.price && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            ${v.discountPrice ?? v.price}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
