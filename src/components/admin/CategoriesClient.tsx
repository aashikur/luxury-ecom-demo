'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FolderTree,
  Folder,
  Layers,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Package,
  MoreHorizontal,
} from 'lucide-react';
import {
  Button,
  Breadcrumb,
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from '@/components/ui';

export interface CategoryTableItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  ancestors: string[];
  image?: { url: string; key: string };
  level: number;
  displayOrder: number;
  isFeaturedHome: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

/**
 * In-Order Depth-First Search (DFS) Tree Flattening
 * Ensures every Parent Category is immediately followed by its children and sub-children.
 */
function flattenCategoryTree(items: CategoryTableItem[]): CategoryTableItem[] {
  const roots: CategoryTableItem[] = [];
  const childrenMap = new Map<string, CategoryTableItem[]>();

  items.forEach((cat) => {
    if (!cat.parentId || cat.level === 0) {
      roots.push(cat);
    } else {
      const list = childrenMap.get(cat.parentId) || [];
      list.push(cat);
      childrenMap.set(cat.parentId, list);
    }
  });

  // Sort roots by displayOrder then name
  roots.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));

  const result: CategoryTableItem[] = [];
  const visited = new Set<string>();

  function traverse(node: CategoryTableItem) {
    result.push(node);
    visited.add(node._id);
    const children = childrenMap.get(node._id) || [];
    children.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));
    children.forEach((child) => traverse(child));
  }

  roots.forEach((root) => traverse(root));

  // Append any orphaned categories whose parent was missing
  items.forEach((cat) => {
    if (!visited.has(cat._id)) {
      result.push(cat);
    }
  });

  return result;
}

export default function CategoriesClient({
  initialCategories = [],
}: {
  initialCategories: CategoryTableItem[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryTableItem[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ROOT' | 'SUBS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 3-dot dropdown popover state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
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

  // Delete Confirmation Modal state
  const [deletingCategory, setDeletingCategory] = useState<CategoryTableItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sub-categories count for cascade delete preview
  const childSubcategoriesCount = useMemo(() => {
    if (!deletingCategory) return 0;
    return categories.filter(
      (c) => c.parentId === deletingCategory._id || c.ancestors?.includes(deletingCategory.slug)
    ).length;
  }, [deletingCategory, categories]);

  // Filtered categories with DFS tree hierarchy
  const filteredCategories = useMemo(() => {
    // If filtering by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return categories.filter((cat) => {
        if (activeTab === 'ROOT' && cat.level !== 0) return false;
        if (activeTab === 'SUBS' && cat.level === 0) return false;
        return cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
      });
    }

    // If filtering by tab
    if (activeTab === 'ROOT') {
      return categories.filter((c) => c.level === 0);
    }
    if (activeTab === 'SUBS') {
      return categories.filter((c) => c.level > 0);
    }

    // Default 'ALL': In-Order Depth-First Search tree (Parent -> Children -> Sub-children)
    return flattenCategoryTree(categories);
  }, [categories, activeTab, searchQuery]);

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Paginated categories slice
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Delete Category with safeguards
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/categories?id=${deletingCategory._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete category');
      }

      if (data.deletedCategoryIds && Array.isArray(data.deletedCategoryIds)) {
        const deletedSet = new Set(data.deletedCategoryIds);
        setCategories((prev) => prev.filter((c) => !deletedSet.has(c._id)));
      } else {
        setCategories((prev) => prev.filter((c) => c._id !== deletingCategory._id));
      }
      setToastMsg(data.message || `Category "${deletingCategory.name}" removed.`);
      setTimeout(() => setToastMsg(null), 4000);
      setDeletingCategory(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Categories' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#076E46] text-xs font-semibold rounded-lg flex items-center justify-between shadow-2xs">
          <span>{toastMsg}</span>
          <Check className="w-4 h-4 text-[#076E46]" />
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
            Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your product catalog into departments and sub-categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/categories/new">
            <Button
              className="bg-[#076E46] hover:bg-[#055C3A] text-white gap-1.5 shadow-xs shrink-0 cursor-pointer"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filter Pills Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'All' },
          { id: 'ROOT', label: 'Departments' },
          { id: 'SUBS', label: 'Subcategories' },
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

      {/* 3. Search & Quick Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* 4. Hierarchical Categories Table */}
      <TableContainer className="border border-slate-200 shadow-2xs rounded-xl overflow-visible bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              <TableHead className="w-12 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                #
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Category &amp; Hierarchy
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Slug
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Products
              </TableHead>
              <TableHead className="w-16 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <FolderTree className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No categories found</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search query or add a new category.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((cat, index) => {
                const indentClass =
                  cat.level === 0
                    ? 'pl-0'
                    : cat.level === 1
                    ? 'pl-6'
                    : 'pl-12';

                const isMenuOpen = activeMenuId === cat._id;

                return (
                  <TableRow
                    key={cat._id}
                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-none"
                  >
                    {/* Index */}
                    <TableCell className="text-center text-[11px] font-mono text-slate-400">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* Name & Indentation Tree View */}
                    <TableCell>
                      <div className={`flex items-center gap-2.5 ${indentClass}`}>
                        {/* Tree connector branch */}
                        {cat.level === 1 && (
                          <span className="text-slate-400 select-none font-mono text-xs">
                            ↳
                          </span>
                        )}
                        {cat.level === 2 && (
                          <span className="text-slate-400 select-none font-mono text-xs">
                            └── ↳
                          </span>
                        )}

                        {/* Thumbnail / Folder Icon */}
                        {cat.image?.url ? (
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                            <Image
                              src={cat.image.url}
                              alt={cat.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            {cat.level === 0 ? (
                              <Folder className="w-4 h-4 text-emerald-700" />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>
                        )}

                        <div>
                          <p
                            className={`text-xs ${
                              cat.level === 0
                                ? 'font-bold text-[#060d11]'
                                : 'font-medium text-slate-800'
                            }`}
                          >
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Slug */}
                    <TableCell>
                      <span className="font-mono text-xs text-slate-500">
                        {cat.slug}
                      </span>
                    </TableCell>

                    {/* Linked Products Count */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cat.productCount}</span>
                      </span>
                    </TableCell>

                    {/* 3-Dot Actions Menu */}
                    <TableCell className="text-right relative">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : cat._id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                          title="Category actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 top-10 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-30 text-xs text-slate-700 animate-scale-in text-left"
                          >
                            <Link
                              href={`/admin/categories/${cat._id}/edit`}
                              className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </Link>

                            <Link
                              href={`/shop?category=${cat.slug}`}
                              target="_blank"
                              className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Store</span>
                            </Link>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteError(null);
                                setDeletingCategory(cat);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-red-50 text-red-600 transition cursor-pointer text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredCategories.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* 5. Delete Confirmation Safeguard Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
            onClick={() => !isDeleting && setDeletingCategory(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Category</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete &ldquo;{deletingCategory.name}&rdquo;?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {deleteError}
              </div>
            )}

            {childSubcategoriesCount > 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5 text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Cascade Delete: {childSubcategoriesCount} subcategory(s) will also be deleted</span>
                </p>
                <p className="text-[11px] text-red-600 leading-relaxed">
                  Deleting &ldquo;{deletingCategory.name}&rdquo; will automatically delete all of its subcategories. Any assigned products will be safely marked as <span className="font-mono font-semibold">Uncategorized</span> without being deleted.
                </p>
              </div>
            ) : deletingCategory.productCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>Contains {deletingCategory.productCount} active product{deletingCategory.productCount > 1 ? 's' : ''}</span>
                </p>
                <p className="text-[11px] text-amber-700">
                  Deleting this category will safely detach these products and mark them as <span className="font-mono font-semibold">Uncategorized</span>. Your products will not be deleted.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                This action cannot be undone. Are you sure you want to permanently delete this category?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
