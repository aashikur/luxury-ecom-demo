'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Trash2,
  Package,
  Layers,
} from 'lucide-react';

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  primaryCategory: string;
  collections?: string[];
  basePrice: number;
  discountPrice?: number;
  images: { url: string; key: string }[];
  variants?: { size: string; stock: number }[];
  isActive: boolean;
  createdAt: string;
}

export default function ProductsTableClient({
  initialProducts,
}: {
  initialProducts: ProductItem[];
}) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.primaryCategory).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === 'ACTIVE' && !p.isActive) return false;
      if (activeTab === 'DRAFT' && p.isActive) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && p.primaryCategory !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCat = p.primaryCategory?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat) return false;
      }

      return true;
    });
  }, [products, activeTab, categoryFilter, searchQuery]);

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting product');
    } finally {
      setIsDeleting(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Title,Category,Price,TotalStock,Status,CreatedAt\n'];
    const rows = filteredProducts.map((p) => {
      const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
      return `"${p.title}","${p.primaryCategory}",${p.basePrice},${totalStock},${p.isActive ? 'Active' : 'Draft'},"${new Date(p.createdAt).toLocaleDateString()}"\n`;
    });
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurem-products-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-850">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-300 transition">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-zinc-300 font-medium">Products</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Products</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Browse and manage your engineered garment catalog & inventory.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-emerald-500/10 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* 2. Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-md">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'DRAFT', label: 'Draft' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Search, Category Dropdown & Export */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-zinc-200 text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 3. Data Table (Apex Reference Image 3 Style) */}
      <div className="rounded-lg border border-zinc-850 bg-zinc-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" />
                </th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">Created</th>
                <th className="py-3.5 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                  const thumb = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80';

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-zinc-850/50 transition group"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" />
                      </td>

                      {/* Product Thumbnail + Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-zinc-800 rounded overflow-hidden shrink-0 border border-zinc-750">
                            <Image
                              src={thumb}
                              alt={p.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/admin/products/${p._id}`}
                              className="font-semibold text-white hover:text-emerald-400 transition block truncate"
                            >
                              {p.title}
                            </Link>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {p.description || 'Engineered luxury garment'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-[11px] font-medium text-zinc-300 uppercase tracking-wide">
                          {p.primaryCategory || 'General'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.isActive ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{p.isActive ? 'Active' : 'Draft'}</span>
                        </span>
                      </td>

                      {/* Stock Counter */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-200">
                        {totalStock}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {p.basePrice.toLocaleString()}৳
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-right text-zinc-500 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/products/${p._id}`}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                            title="View / Inspect"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            disabled={isDeleting === p._id}
                            className="p-1.5 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>
            Showing <strong className="text-zinc-300">{filteredProducts.length}</strong> of{' '}
            <strong className="text-zinc-300">{products.length}</strong> garments
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-medium cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-xs">
              1
            </span>
            <button
              disabled
              className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-medium cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
