'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Package,
  MoreHorizontal,
  Tag,
  Globe,
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

export interface BrandTableItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: { url: string; key: string };
  website?: string;
  order: number;
  featured: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export default function BrandsClient({
  initialBrands = [],
}: {
  initialBrands: BrandTableItem[];
}) {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandTableItem[]>(initialBrands);
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
  const [deletingBrand, setDeletingBrand] = useState<BrandTableItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) {
      return brands;
    }
    const q = searchQuery.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.website && b.website.toLowerCase().includes(q))
    );
  }, [brands, searchQuery]);

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginated slice
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  // Delete Brand handler
  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/brands?id=${deletingBrand._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete brand');
      }

      setBrands((prev) => prev.filter((b) => b._id !== deletingBrand._id));
      setToastMsg(data.message || `Brand "${deletingBrand.name}" deleted.`);
      setTimeout(() => setToastMsg(null), 3000);
      setDeletingBrand(null);
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete brand.');
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Brands' },
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
            Brands
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage product manufacturers, fashion labels, and brand partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/brands/new">
            <Button
              className="bg-[#076E46] hover:bg-[#055C3A] text-white gap-1.5 shadow-xs shrink-0 cursor-pointer"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brand</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search brands by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredBrands.length}</span> brands
        </div>
      </div>

      {/* 3. Brands Table */}
      <TableContainer className="border border-slate-200 shadow-2xs rounded-xl overflow-visible bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200">
              <TableHead className="w-12 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                #
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Brand
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
            {filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <Tag className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No brands found</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search query or add a new brand partner.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBrands.map((b, index) => {
                const isMenuOpen = activeMenuId === b._id;

                return (
                  <TableRow
                    key={b._id}
                    onClick={() => router.push(`/admin/brands/${b._id}/edit`)}
                    className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-none cursor-pointer"
                  >
                    {/* Index */}
                    <TableCell className="text-center text-[11px] font-mono text-slate-400">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* Brand Name & Logo */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {/* Logo Thumbnail / Fallback Initial */}
                        {b.logo?.url ? (
                          <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                            <Image
                              src={b.logo.url}
                              alt={b.name}
                              fill
                              sizes="36px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-xs text-slate-600">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-[#060d11]">
                              {b.name}
                            </p>
                            {b.website && (
                              <a
                                href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-slate-700 transition"
                                title={b.website}
                              >
                                <Globe className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {b.description && (
                            <p className="text-[10px] text-slate-400 truncate max-w-sm">
                              {b.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Slug */}
                    <TableCell>
                      <span className="font-mono text-xs text-slate-500">
                        {b.slug}
                      </span>
                    </TableCell>

                    {/* Linked Products Count */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.productCount}</span>
                      </span>
                    </TableCell>

                    {/* 3-Dot Actions Menu */}
                    <TableCell
                      className="text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : b._id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                          title="Brand actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 top-10 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-30 text-xs text-slate-700 animate-scale-in text-left"
                          >
                            <Link
                              href={`/admin/brands/${b._id}/edit`}
                              className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </Link>

                            <Link
                              href={`/shop?brand=${encodeURIComponent(b.name)}`}
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
                                setDeletingBrand(b);
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

      {/* 4. Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredBrands.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* 5. Delete Confirmation Modal */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
            onClick={() => !isDeleting && setDeletingBrand(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Brand</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete &ldquo;{deletingBrand.name}&rdquo;?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {deleteError}
              </div>
            )}

            {deletingBrand.productCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>Contains {deletingBrand.productCount} assigned product{deletingBrand.productCount > 1 ? 's' : ''}</span>
                </p>
                <p className="text-[11px] text-amber-700">
                  Deleting this brand will un-assign it from your products. Your products will not be deleted.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                This action cannot be undone. Are you sure you want to permanently delete this brand?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingBrand(null)}
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
