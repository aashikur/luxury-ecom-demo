'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  SlidersHorizontal,
  Columns,
  Layers,
  ChevronDown,
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
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Popover menu state: which row has action menu open
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Inline Stock Editing state (Image 3)
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.primaryCategory).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeTab === 'ACTIVE' && !p.isActive) return false;
      if (activeTab === 'DRAFT' && p.isActive) return false;
      if (activeTab === 'ARCHIVED' && p.isActive) return false;

      if (selectedCategory !== 'ALL' && p.primaryCategory !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCat = p.primaryCategory?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedCategory, searchQuery]);

  // Delete handler
  const handleDelete = async (id: string, title: string) => {
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

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
    }
  };

  // Inline Stock Edit handlers (Matching Image 3)
  const handleStartStockEdit = (product: ProductItem) => {
    const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) || 0;
    setEditingStockId(product._id);
    setTempStockValue(totalStock);
  };

  const handleSaveStockEdit = async (productId: string) => {
    setIsUpdatingStock(true);
    const targetProduct = products.find((p) => p._id === productId);
    if (!targetProduct) return;

    // Distribute stock across existing variants proportionally or set first variant
    const currentVariants = targetProduct.variants || [];
    const updatedVariants = currentVariants.length > 0
      ? currentVariants.map((v, idx) => (idx === 0 ? { ...v, stock: tempStockValue } : v))
      : [{ size: 'M', stock: tempStockValue, sku: `${targetProduct.slug.toUpperCase()}-M` }];

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: updatedVariants }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, variants: updatedVariants } : p
          )
        );
        setEditingStockId(null);
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Title,Category,Status,TotalStock,Price\n'];
    const rows = filteredProducts.map((p) => {
      const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
      return `"${p.title}","${p.primaryCategory}",${p.isActive ? 'Active' : 'Draft'},${totalStock},${p.basePrice}\n`;
    });
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-catalog-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header (Matching Reference Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-slate-800 transition">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-medium">Products</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse and manage your product catalog.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* 2. Filter Pills Tabs (All, Active, Draft, Archived) */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'All' },
          { id: 'ACTIVE', label: 'Active' },
          { id: 'DRAFT', label: 'Draft' },
          { id: 'ARCHIVED', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Search and Action Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input + Category Button */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 flex-1 focus-within:border-emerald-500 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-slate-900 text-xs"
            />
          </div>

          {/* Category Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedCategory === 'ALL' ? 'Category' : selectedCategory}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {isCategoryMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs text-slate-700">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCategory(c);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      selectedCategory === c ? 'font-bold text-emerald-600 bg-emerald-50/50' : ''
                    }`}
                  >
                    {c === 'ALL' ? 'All Categories' : c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Tools: Views, Columns, Export */}
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Views</span>
          </button>

          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-2xs">
            <Columns className="w-3.5 h-3.5 text-slate-400" />
            <span>Columns</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4. High-Clarity Table (Matching Apex Reference Image 1 & 3) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                </th>
                <th className="py-3 px-4">Product <span className="text-slate-400 font-normal">↑↓</span></th>
                <th className="py-3 px-4">Category <span className="text-slate-400 font-normal">↑↓</span></th>
                <th className="py-3 px-4">Status <span className="text-slate-400 font-normal">↑↓</span></th>
                <th className="py-3 px-4 text-center">Stock <span className="text-slate-400 font-normal">↑↓</span></th>
                <th className="py-3 px-4 text-right">Price <span className="text-slate-400 font-normal">↑↓</span></th>
                <th className="py-3 px-4 text-right">Created <span className="text-slate-400 font-normal">↑↓</span></th>
                <th className="py-3 px-4 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    No products found matching your active filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                  const thumb = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80';
                  const isMenuOpen = activeMenuId === product._id;
                  const isEditingStock = editingStockId === product._id;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      </td>

                      {/* Product Thumbnail + Name + Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-11 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={thumb}
                              alt={product.title}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="font-semibold text-slate-900 hover:text-emerald-600 transition block truncate"
                            >
                              {product.title}
                            </Link>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {product.description || 'Full-featured luxury minimal garment'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          {product.primaryCategory || 'General'}
                        </span>
                      </td>

                      {/* Status Pill (Active Green / Draft Orange) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            product.isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Stock Column with Inline Stepper Edit (Image 3 Feature) */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {isEditingStock ? (
                          <div className="inline-flex items-center gap-1.5 animate-scale-in">
                            <div className="inline-flex items-center rounded-md border-2 border-emerald-500 bg-white px-2 py-0.5 shadow-xs">
                              <input
                                type="number"
                                min="0"
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(Number(e.target.value))}
                                className="w-12 text-center text-xs font-mono font-bold text-slate-900 focus:outline-none"
                                autoFocus
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveStockEdit(product._id)}
                              disabled={isUpdatingStock}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                              title="Save stock"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStockId(null)}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartStockEdit(product)}
                            className="font-mono text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer group-hover:text-emerald-700"
                            title="Click to edit stock inline"
                          >
                            {totalStock}
                          </button>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {product.basePrice.toLocaleString()}৳
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                        {new Date(product.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Three-Dots Action Menu Popover (Matching Reference Image 1) */}
                      <td className="py-3.5 px-4 text-center relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : product._id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Floating Popover Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-6 top-10 w-32 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 text-left text-xs space-y-0.5 animate-scale-in"
                          >
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                              onClick={() => setActiveMenuId(null)}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View</span>
                            </Link>

                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                              onClick={() => setActiveMenuId(null)}
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(product._id, product.title)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bottom Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-800">{products.length}</strong> results
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 text-xs font-medium cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
              1
            </span>
            <button
              disabled
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 text-xs font-medium cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
