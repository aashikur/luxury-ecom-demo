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
import {
  Button,
  Badge,
  Input,
  Breadcrumb,
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  categoryName?: string;
  primaryCategory?: string;
  productType?: string;
  hasVariants?: boolean;
  stockStatus?: string;
  status?: string;
  totalStock?: number;
  collections?: string[];
  basePrice: number;
  discountPrice?: number;
  images: { url: string; key: string }[];
  variants?: { size: string; stock: number; sku?: string }[];
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

  // Sync state if server passes updated initialProducts prop
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Client-side live sync fallback to guarantee fresh inventory & images on mount
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to sync products in table:', err);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Popover menu state: which row has action menu open
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Inline Stock Editing state
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
    const cats = new Set(products.map((p) => p.categoryName || p.primaryCategory).filter((c): c is string => Boolean(c)));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isPublished = p.status === 'PUBLISHED' || (!p.status && p.isActive);
      const isDraft = p.status === 'DRAFT' || (!p.status && !p.isActive);
      const isArchived = p.status === 'ARCHIVED';

      if (activeTab === 'ACTIVE' && !isPublished) return false;
      if (activeTab === 'DRAFT' && !isDraft) return false;
      if (activeTab === 'ARCHIVED' && !isArchived) return false;

      const catName = p.categoryName || p.primaryCategory;
      if (selectedCategory !== 'ALL' && catName !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCat = catName?.toLowerCase().includes(q);
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
        refreshProducts();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting product');
    }
  };

  // Inline Stock Edit handlers
  const handleStartStockEdit = (product: ProductItem) => {
    const totalStock = product.totalStock ?? (product.variants?.reduce((s, v) => s + v.stock, 0) || 0);
    setEditingStockId(product._id);
    setTempStockValue(totalStock);
  };

  const handleSaveStockEdit = async (productId: string) => {
    setIsUpdatingStock(true);
    const targetProduct = products.find((p) => p._id === productId);
    if (!targetProduct) return;

    let payload: Record<string, unknown> = {};

    if (targetProduct.hasVariants === false) {
      payload = { totalStock: tempStockValue };
    } else {
      const currentVariants = targetProduct.variants || [];
      const updatedVariants = currentVariants.length > 0
        ? currentVariants.map((v, idx) => (idx === 0 ? { ...v, stock: tempStockValue } : v))
        : [{ size: 'M', stock: tempStockValue, sku: `${targetProduct.slug.toUpperCase()}-M` }];
      payload = { variants: updatedVariants, totalStock: tempStockValue };
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? {
                  ...p,
                  totalStock: tempStockValue,
                  ...(targetProduct.hasVariants !== false && {
                    variants: (payload.variants as typeof targetProduct.variants) || p.variants,
                  }),
                }
              : p
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
      const totalStock = p.totalStock ?? (p.variants?.reduce((s, v) => s + v.stock, 0) || 0);
      return `"${p.title}","${p.categoryName || p.primaryCategory || 'General'}",${p.isActive ? 'Active' : 'Draft'},${totalStock},${p.basePrice}\n`;
    });
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-catalog-${Date.now()}.csv`;
    a.click();
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Products' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header (Matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage your product catalog.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button variant="default" className="gap-1.5 shadow-xs shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* 2. Filter Pills Tabs (Matching Image 2: All, Active, Draft, Archived) */}
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-100 text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Search and Action Controls Toolbar (Matching Image 2) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Search Bar + Category Filter Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
              className="gap-1.5 text-xs font-semibold h-9"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedCategory === 'ALL' ? 'Category' : selectedCategory}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </Button>

            {isCategoryMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-44 rounded-lg border border-slate-200 bg-white py-1 text-xs text-slate-700 shadow-lg z-30">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCategory(c);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer ${
                      selectedCategory === c ? 'font-bold text-emerald-700 bg-emerald-50/50' : ''
                    }`}
                  >
                    {c === 'ALL' ? 'All Categories' : c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Views, Columns, Export */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Views</span>
          </Button>

          <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium text-slate-600">
            <Columns className="w-3.5 h-3.5 text-slate-400" />
            <span>Columns</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 font-medium text-slate-600"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* 4. High-Clarity Table (Matching Image 2) */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </TableHead>
              <TableHead>Product <span className="text-slate-400 font-normal">↑↓</span></TableHead>
              <TableHead>Category <span className="text-slate-400 font-normal">↑↓</span></TableHead>
              <TableHead>Status <span className="text-slate-400 font-normal">↑↓</span></TableHead>
              <TableHead className="text-center">Stock <span className="text-slate-400 font-normal">↑↓</span></TableHead>
              <TableHead className="text-right">Price <span className="text-slate-400 font-normal">↑↓</span></TableHead>
              <TableHead className="text-right">Created <span className="text-slate-400 font-normal">↑↓</span></TableHead>
              <TableHead className="text-center w-12"></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <tr>
                <TableCell colSpan={8} className="py-14 text-center text-slate-400">
                  No products found matching your active filter.
                </TableCell>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const rowStock = product.totalStock ?? (product.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0);
                const thumb = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80';
                const isMenuOpen = activeMenuId === product._id;
                const isEditingStock = editingStockId === product._id;
                const isPublished = product.status === 'PUBLISHED' || (!product.status && product.isActive);

                return (
                  <TableRow key={product._id}>
                    {/* Checkbox */}
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </TableCell>

                    {/* Product Thumbnail + Name + Subtitle */}
                    <TableCell>
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
                            className="font-semibold text-[#060d11] hover:text-[#076E46] transition block truncate"
                          >
                            {product.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {product.description || 'Full-featured luxury minimal garment'}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category Pill */}
                    <TableCell>
                      <Badge variant="secondary">
                        {product.categoryName || product.primaryCategory || 'General'}
                      </Badge>
                    </TableCell>

                    {/* Status Pill (Active Green / Draft Orange matching Image 2) */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={isPublished ? 'success' : 'warning'}>
                          {isPublished ? 'Active' : 'Draft'}
                        </Badge>
                        {product.stockStatus === 'FORCE_OUT_OF_STOCK' && (
                          <span className="text-[9px] font-bold text-red-600 uppercase">
                            OOS
                          </span>
                        )}
                        {product.stockStatus === 'PRE_ORDER' && (
                          <span className="text-[9px] font-bold text-blue-600 uppercase">
                            PRE
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Stock Column with Inline Stepper Edit */}
                    <TableCell className="text-center font-mono">
                      {isEditingStock ? (
                        <div className="inline-flex items-center gap-1.5 animate-scale-in">
                          <div className="inline-flex items-center rounded-md border-2 border-emerald-600 bg-white px-2 py-0.5 shadow-xs">
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
                            className="p-1 rounded bg-[#076E46] hover:bg-[#055C3A] text-white transition cursor-pointer"
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
                          className="font-mono text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer group-hover:text-emerald-700 inline-flex items-center gap-1"
                          title="Click to edit stock"
                        >
                          <span>{rowStock}</span>
                          <Pencil className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right font-mono font-semibold text-[#060d11]">
                      ${product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-right text-slate-500 text-[11px]">
                      {new Date(product.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-center relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : product._id)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                        title="Product actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-10 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-30 text-xs text-slate-700 animate-scale-in"
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Preview</span>
                          </Link>

                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit</span>
                          </Link>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => handleDelete(product._id, product.title)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-red-50 text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
