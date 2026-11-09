'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';

export default function NewProductClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    primaryCategory: 'Heavyweight Hoodies',
    collections: 'hoodies, winter-drop-2026',
    basePrice: 2690,
    discountPrice: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85',
    description: 'Cut from custom-milled 450 GSM French Terry cotton. Pre-shrunk and enzyme-treated for a lived-in luxury handfeel.',
    stocks: {
      S: 25,
      M: 50,
      L: 50,
      XL: 25,
    },
  });

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm((p) => ({ ...p, title: val, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.basePrice) {
      alert('Please fill in Product Title, Slug, and Price.');
      return;
    }

    setIsSubmitting(true);

    try {
      const collectionsArray = form.collections
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);

      const variants = [
        { size: 'S', stock: Number(form.stocks.S), sku: `${form.slug.toUpperCase()}-S` },
        { size: 'M', stock: Number(form.stocks.M), sku: `${form.slug.toUpperCase()}-M` },
        { size: 'L', stock: Number(form.stocks.L), sku: `${form.slug.toUpperCase()}-L` },
        { size: 'XL', stock: Number(form.stocks.XL), sku: `${form.slug.toUpperCase()}-XL` },
      ];

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          description: form.description,
          primaryCategory: form.primaryCategory,
          collections: collectionsArray,
          basePrice: Number(form.basePrice),
          discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
          images: [{ url: form.imageUrl, key: `products/${form.slug}.jpg` }],
          variants,
          sizeChart: [
            { size: 'S', chest: '42', length: '27.5', sleeve: '24' },
            { size: 'M', chest: '44', length: '28.5', sleeve: '25' },
            { size: 'L', chest: '46', length: '29.5', sleeve: '26' },
            { size: 'XL', chest: '48', length: '30.5', sleeve: '27' },
          ],
          isPinned: false,
          priority: 0,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        alert(data.error || 'Failed to create product');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while creating garment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-slate-800 transition">Dashboard</Link>
            <span>&gt;</span>
            <Link href="/admin/products" className="hover:text-slate-800 transition">Products</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-medium">New Garment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Garment</h1>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-semibold text-slate-700">
              Garment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Obsidian Acid-Wash Boxy Hoodie"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs shadow-2xs"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-emerald-600 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Primary Category *
            </label>
            <input
              type="text"
              required
              placeholder="Heavyweight Hoodies"
              value={form.primaryCategory}
              onChange={(e) => setForm({ ...form, primaryCategory: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Base Price */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Selling Price (৳) *
            </label>
            <input
              type="number"
              required
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Compare At Price */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Original Strike-through Price (৳)
            </label>
            <input
              type="number"
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-semibold text-slate-700">
              Garment Image URL (Cloudflare R2 / Unsplash) *
            </label>
            <input
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Collections Tags */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-semibold text-slate-700">
              Collections Tags (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="hoodies, winter-drop-2026, featured"
              value={form.collections}
              onChange={(e) => setForm({ ...form, collections: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-semibold text-slate-700">
              Garment Specs & Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Size Inventory Matrix */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Initial Stock by Size
          </label>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
              <div key={sz} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                <span className="font-bold text-slate-600 block">{sz}</span>
                <input
                  type="number"
                  min="0"
                  value={form.stocks[sz]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stocks: { ...form.stocks, [sz]: Number(e.target.value) },
                    })
                  }
                  className="w-full text-center py-1 bg-white border border-slate-200 rounded-md font-mono text-slate-900 text-xs shadow-2xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Garment...' : 'Publish Garment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
