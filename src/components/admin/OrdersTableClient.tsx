'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Button,
  TablePagination,
} from '@/components/ui';
import {
  Search,
  Truck,
  CheckCircle2,
  AlertCircle,
  Download,
  Columns3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
  X,
  Minus,
} from 'lucide-react';

export interface OrderItemRow {
  productId?: string;
  title: string;
  variantLabel?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface OrderRow {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    altPhone?: string;
    email?: string;
    address: string;
    deliveryZone: 'INSIDE_DHAKA' | 'DHAKA_SUBURBS' | 'OUTSIDE_DHAKA';
    district?: string;
    thana?: string;
    note?: string;
  };
  items: OrderItemRow[];
  subtotal?: number;
  deliveryFee?: number;
  discountAmount?: number;
  totalAmount?: number;
  financials?: {
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    totalAmount?: number;
    isAdvancePaid?: boolean;
    advanceAmount?: number;
  };
  payment: {
    method: string;
    status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'FAILED' | 'REFUNDED';
    trxId?: string;
    senderPhone?: string;
  };
  orderStatus: string;
  status: string;
  courier?: {
    provider?: string;
    consignmentId?: string;
    trackingCode?: string;
    status?: string;
    bookingError?: string;
  };
  createdAt: string | Date;
}

interface OrdersTableClientProps {
  initialOrders: OrderRow[];
  totalCount: number;
}

type SortField = 'orderNumber' | 'customer' | 'items' | 'status' | 'createdAt' | 'totalAmount';
type SortDirection = 'asc' | 'desc';

function getInitials(name?: string, fallback = 'CU'): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateInput: string | Date): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(amount?: number): string {
  const val = amount ?? 0;
  return `৳${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function OrdersTableClient({
  initialOrders,
  totalCount,
}: OrdersTableClientProps) {
  const router = useRouter();

  // Core order state
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Checkbox Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Interactive UI states
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Delete modal state
  const [orderToDelete, setOrderToDelete] = useState<OrderRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Column visibility
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    customer: true,
    product: true,
    status: true,
    courier: true,
    date: true,
    amount: true,
  });

  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(event.target as Node)
      ) {
        setShowColumnsMenu(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveActionMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: orders.length,
      COMPLETED: 0,
      PROCESSING: 0,
      PENDING: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      const st = (o.orderStatus || o.status || 'PENDING').toUpperCase();
      if (st === 'DELIVERED' || st === 'COMPLETED') counts.COMPLETED++;
      else if (st === 'PROCESSING' || st === 'CONFIRMED' || st === 'SHIPPED') counts.PROCESSING++;
      else if (st === 'PENDING') counts.PENDING++;
      else if (st === 'CANCELLED' || st === 'RETURNED') counts.CANCELLED++;
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = (order.orderStatus || order.status || 'PENDING').toUpperCase();

      if (activeTab !== 'ALL') {
        if (activeTab === 'COMPLETED' && currentStatus !== 'DELIVERED' && currentStatus !== 'COMPLETED') {
          return false;
        } else if (
          activeTab === 'PROCESSING' &&
          currentStatus !== 'PROCESSING' &&
          currentStatus !== 'CONFIRMED' &&
          currentStatus !== 'SHIPPED'
        ) {
          return false;
        } else if (activeTab === 'PENDING' && currentStatus !== 'PENDING') {
          return false;
        } else if (
          activeTab === 'CANCELLED' &&
          currentStatus !== 'CANCELLED' &&
          currentStatus !== 'RETURNED'
        ) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = order.customer?.name?.toLowerCase().includes(q);
        const matchesPhone = order.customer?.phone?.includes(q);
        const matchesEmail = order.customer?.email?.toLowerCase().includes(q);
        const matchesTracking = order.courier?.trackingCode?.toLowerCase().includes(q);
        const matchesProduct = order.items?.some((item) =>
          item.title?.toLowerCase().includes(q)
        );
        return matchesNumber || matchesCustomer || matchesPhone || matchesEmail || matchesTracking || matchesProduct;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Sorted orders
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'orderNumber':
          valA = a.orderNumber || '';
          valB = b.orderNumber || '';
          break;
        case 'customer':
          valA = a.customer?.name || '';
          valB = b.customer?.name || '';
          break;
        case 'items':
          valA = a.items?.[0]?.title || '';
          valB = b.items?.[0]?.title || '';
          break;
        case 'status':
          valA = (a.orderStatus || a.status || '').toUpperCase();
          valB = (b.orderStatus || b.status || '').toUpperCase();
          break;
        case 'createdAt':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'totalAmount':
          valA = a.totalAmount ?? a.financials?.totalAmount ?? 0;
          valB = b.totalAmount ?? b.financials?.totalAmount ?? 0;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredOrders, sortField, sortDirection]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  // Handle column header sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Checkbox selection handlers
  const isAllCurrentSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedIds.has(o._id));

  const handleSelectAllCurrentPage = () => {
    const next = new Set(selectedIds);
    if (isAllCurrentSelected) {
      paginatedOrders.forEach((o) => next.delete(o._id));
    } else {
      paginatedOrders.forEach((o) => next.add(o._id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Row navigation handler (user requirement: "row gula clickable to go to view pages")
  const handleRowClick = (order: OrderRow) => {
    router.push(`/admin/orders/${order.orderNumber || order._id}`);
  };

  // Dispatch to Steadfast Courier
  const handleDispatchSteadfast = async (order: OrderRow, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (dispatchingId) return;
    setDispatchingId(order._id);
    setActiveActionMenuId(null);

    try {
      const res = await fetch('/api/courier/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          orderNumber: order.orderNumber,
          operator: 'ADMIN',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to dispatch to Steadfast');
      }

      const trackingCode = json.data?.trackingCode || json.data?.consignmentId;
      showToast(`Order ${order.orderNumber} booked with Steadfast! Tracking: ${trackingCode}`);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                orderStatus: 'SHIPPED',
                status: 'SHIPPED',
                courier: {
                  ...o.courier,
                  provider: 'STEADFAST',
                  consignmentId: json.data?.consignmentId,
                  trackingCode: json.data?.trackingCode,
                  status: 'in_review',
                },
              }
            : o
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error booking order';
      showToast(`Booking error: ${msg}`);
    } finally {
      setDispatchingId(null);
    }
  };

  // Update Status
  const handleStatusChange = async (order: OrderRow, nextStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (statusUpdatingId) return;
    setStatusUpdatingId(order._id);
    setActiveActionMenuId(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          status: nextStatus,
          updatedBy: 'ADMIN',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update order status');
      }

      showToast(`Order ${order.orderNumber} updated to ${nextStatus}`);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                orderStatus: nextStatus,
                status: nextStatus,
              }
            : o
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      showToast(`Update error: ${msg}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Delete Order
  const handleConfirmDelete = async () => {
    if (!orderToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/orders?id=${orderToDelete._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to delete order');
      }

      showToast(`Order ${orderToDelete.orderNumber} deleted and stock restored.`);
      setOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderToDelete._id);
        return next;
      });
      setOrderToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting order';
      showToast(`Delete failed: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk status update
  const handleBulkStatusChange = async (targetStatus: string) => {
    if (selectedIds.size === 0) return;
    const idsToUpdate = Array.from(selectedIds);

    try {
      for (const id of idsToUpdate) {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: id,
            status: targetStatus,
            updatedBy: 'ADMIN',
          }),
        });
      }

      setOrders((prev) =>
        prev.map((o) =>
          selectedIds.has(o._id)
            ? { ...o, orderStatus: targetStatus, status: targetStatus }
            : o
        )
      );
      showToast(`Updated ${selectedIds.size} orders to ${targetStatus}`);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating bulk orders';
      showToast(msg);
    }
  };

  // Export CSV
  const handleExportCSV = (onlySelected = false) => {
    const listToExport = onlySelected
      ? orders.filter((o) => selectedIds.has(o._id))
      : filteredOrders;

    if (listToExport.length === 0) {
      showToast('No orders to export.');
      return;
    }

    const headers =
      'OrderNumber,Customer,Phone,Email,ItemsCount,TotalAmount,PaymentStatus,OrderStatus,CourierTracking,CreatedAt\n';
    const rows = listToExport
      .map((o) => {
        const dateStr = formatDate(o.createdAt);
        const effectiveTotal = o.totalAmount ?? o.financials?.totalAmount ?? 0;
        const itemsCount = o.items?.length || 0;
        return `"${o.orderNumber}","${o.customer?.name || ''}","${o.customer?.phone || ''}","${o.customer?.email || ''}",${itemsCount},${effectiveTotal},"${o.payment?.status || ''}","${o.orderStatus || o.status || ''}","${o.courier?.trackingCode || ''}","${dateStr}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${Date.now()}.csv`;
    a.click();
    showToast(`Exported ${listToExport.length} orders to CSV`);
  };

  // Copy tracking code
  const handleCopyTracking = (trackingCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trackingCode);
    setCopiedTrackingId(trackingCode);
    showToast(`Copied tracking code: ${trackingCode}`);
    setTimeout(() => setCopiedTrackingId(null), 2500);
  };

  // Pill badge style matching the reference design
  const renderStatusBadge = (rawStatus: string) => {
    const st = (rawStatus || 'PENDING').toUpperCase();
    let badgeClass = '';
    let label = rawStatus;

    switch (st) {
      case 'DELIVERED':
      case 'COMPLETED':
        badgeClass = 'bg-[#076E46] text-white';
        label = 'Completed';
        break;
      case 'PROCESSING':
        badgeClass = 'bg-[#076E46] text-white';
        label = 'Processing';
        break;
      case 'CONFIRMED':
        badgeClass = 'bg-teal-600 text-white';
        label = 'Confirmed';
        break;
      case 'SHIPPED':
        badgeClass = 'bg-sky-600 text-white';
        label = 'Shipped';
        break;
      case 'PENDING':
        badgeClass = 'bg-amber-500 text-white';
        label = 'Pending';
        break;
      case 'CANCELLED':
        badgeClass = 'bg-rose-500 text-white';
        label = 'Cancelled';
        break;
      case 'RETURNED':
        badgeClass = 'bg-orange-600 text-white';
        label = 'Returned';
        break;
      default:
        badgeClass = 'bg-slate-500 text-white';
        label = rawStatus;
        break;
    }

    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-1 text-[11px] font-semibold rounded-full shadow-2xs whitespace-nowrap ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#060d11] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Row 1: Status Filter Tabs (Matching Reference Design Pill Bar) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl w-fit border border-slate-200/60 overflow-x-auto max-w-full">
        {[
          { id: 'ALL', label: 'All', count: tabCounts.ALL },
          { id: 'COMPLETED', label: 'Completed', count: tabCounts.COMPLETED },
          { id: 'PROCESSING', label: 'Processing', count: tabCounts.PROCESSING },
          { id: 'PENDING', label: 'Pending', count: tabCounts.PENDING },
          { id: 'CANCELLED', label: 'Cancelled', count: tabCounts.CANCELLED },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-white text-[#060d11] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 text-[11px] font-medium ${
                    isActive ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Row 2: Search Input on Left + Columns & Export Buttons on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#076E46] focus:border-[#076E46] shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Columns & Export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Columns Selector Dropdown */}
          <div className="relative" ref={columnsMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnsMenu((prev) => !prev)}
              className="h-8 gap-1.5 text-xs font-medium text-slate-700 bg-white border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer rounded-lg"
            >
              <Columns3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </Button>

            {showColumnsMenu && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-30 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Toggle Columns
                </div>
                {Object.entries({
                  customer: 'Customer',
                  product: 'Product',
                  status: 'Status',
                  courier: 'Dispatch',
                  date: 'Date',
                  amount: 'Amount',
                }).map(([key, label]) => {
                  const isChecked = visibleColumns[key as keyof typeof visibleColumns];
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: !isChecked,
                          }))
                        }
                        className="rounded border-slate-300 text-[#076E46] focus:ring-[#076E46] cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV(false)}
            className="h-8 gap-1.5 text-xs font-medium text-slate-700 bg-white border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer rounded-lg"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Bulk Action Banner (when items are checked) */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-emerald-50/90 border border-emerald-200/80 px-4 py-2 rounded-xl text-xs text-emerald-950 animate-in fade-in slide-in-from-top-1 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-5 h-5 rounded-full bg-[#076E46] text-white flex items-center justify-center text-[11px] font-bold">
              {selectedIds.size}
            </span>
            <span>order(s) selected</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleBulkStatusChange('CONFIRMED')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              Mark Confirmed
            </button>
            <button
              onClick={() => handleBulkStatusChange('PROCESSING')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              Mark Processing
            </button>
            <button
              onClick={() => handleBulkStatusChange('DELIVERED')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              onClick={() => handleExportCSV(true)}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-slate-500" />
              Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition cursor-pointer ml-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Orders Table Container */}
      <TableContainer className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50/75">
              {/* Checkbox column */}
              <TableHead className="w-10 pl-4 pr-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isAllCurrentSelected}
                  onClick={handleSelectAllCurrentPage}
                  aria-label="Select all orders on this page"
                  className={`w-4 h-4 rounded-[5px] border transition-all flex items-center justify-center cursor-pointer select-none translate-y-0.5 ${
                    isAllCurrentSelected || (selectedIds.size > 0 && paginatedOrders.some((o) => selectedIds.has(o._id)))
                      ? 'bg-[#076E46] border-[#076E46] text-white shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isAllCurrentSelected ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : selectedIds.size > 0 && paginatedOrders.some((o) => selectedIds.has(o._id)) ? (
                    <Minus className="w-2.5 h-2.5 stroke-[3]" />
                  ) : null}
                </button>
              </TableHead>

              {/* Order column */}
              <TableHead className="w-32 py-3 px-3">
                <button
                  type="button"
                  onClick={() => handleSort('orderNumber')}
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer group"
                >
                  <span>Order</span>
                  {sortField === 'orderNumber' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[#076E46]" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-[#076E46]" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                  )}
                </button>
              </TableHead>

              {/* Customer column */}
              {visibleColumns.customer && (
                <TableHead className="w-56 py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('customer')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer group"
                  >
                    <span>Customer</span>
                    {sortField === 'customer' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#076E46]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#076E46]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </TableHead>
              )}

              {/* Product column */}
              {visibleColumns.product && (
                <TableHead className="w-52 py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('items')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer group"
                  >
                    <span>Product</span>
                    {sortField === 'items' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#076E46]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#076E46]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </TableHead>
              )}

              {/* Status column */}
              {visibleColumns.status && (
                <TableHead className="w-32 py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer group"
                  >
                    <span>Status</span>
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#076E46]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#076E46]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </TableHead>
              )}

              {/* Courier / Dispatch column */}
              {visibleColumns.courier && (
                <TableHead className="w-36 py-3 px-3">
                  <span className="font-semibold text-slate-600">Dispatch</span>
                </TableHead>
              )}

              {/* Date column */}
              {visibleColumns.date && (
                <TableHead className="w-32 py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('createdAt')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer group"
                  >
                    <span>Date</span>
                    {sortField === 'createdAt' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#076E46]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#076E46]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </TableHead>
              )}

              {/* Amount column */}
              {visibleColumns.amount && (
                <TableHead className="w-28 py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('totalAmount')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer group ml-auto"
                  >
                    <span>Amount</span>
                    {sortField === 'totalAmount' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[#076E46]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[#076E46]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </TableHead>
              )}

              {/* Ekdom right Action button column */}
              <TableHead className="w-14 py-3 px-3 text-right pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-16 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                    <span className="text-sm font-medium">
                      No orders found matching your criteria.
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[#076E46] hover:underline cursor-pointer mt-1"
                      >
                        Clear search filters
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order, index) => {
                const isSelected = selectedIds.has(order._id);
                const isDispatched = Boolean(order.courier?.trackingCode);
                const isDispatching = dispatchingId === order._id;
                const isStatusUpdating = statusUpdatingId === order._id;
                const effectiveTotal =
                  order.totalAmount ?? order.financials?.totalAmount ?? 0;
                const primaryProduct = order.items?.[0];
                const otherItemsCount = (order.items?.length || 0) - 1;
                const isActionMenuOpen = activeActionMenuId === order._id;
                // Position popup upwards if near bottom of table
                const isNearBottom =
                  index >= paginatedOrders.length - 2 &&
                  paginatedOrders.length > 2;

                return (
                  <TableRow
                    key={order._id}
                    onClick={() => handleRowClick(order)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-emerald-50/60 hover:bg-emerald-50/80'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Left Checkbox */}
                    <TableCell
                      className="pl-4 pr-1 py-3"
                      onClick={(e) => handleToggleSelectRow(order._id, e)}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`Select order ${order.orderNumber}`}
                        className={`w-4 h-4 rounded-[5px] border transition-all flex items-center justify-center cursor-pointer select-none translate-y-0.5 ${
                          isSelected
                            ? 'bg-[#076E46] border-[#076E46] text-white shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                    </TableCell>

                    {/* 2. Order Number */}
                    <TableCell className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-[#060d11] hover:text-[#076E46] transition-colors text-xs font-mono whitespace-nowrap">
                        {order.orderNumber}
                      </span>
                    </TableCell>

                    {/* 3. Customer Info (Initials Avatar + Name + Subtitle) */}
                    {visibleColumns.customer && (
                      <TableCell className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {/* Customer Avatar Initials Badge (Consistent Mint/Green Tone) */}
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#076E46] font-semibold text-xs flex items-center justify-center shrink-0 uppercase">
                            {getInitials(order.customer?.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#060d11] text-xs truncate max-w-[160px]">
                              {order.customer?.name || 'Guest Customer'}
                            </div>
                            <div
                              className="text-[11px] text-slate-400 truncate max-w-[160px] leading-tight"
                              title={order.customer?.email || order.customer?.phone || ''}
                            >
                              {order.customer?.email ||
                                order.customer?.phone ||
                                'No contact'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* 4. Product Column */}
                    {visibleColumns.product && (
                      <TableCell className="py-3 px-3">
                        <div className="min-w-0 max-w-[200px]">
                          <div
                            className="text-xs text-[#060d11] font-normal truncate"
                            title={primaryProduct?.title || 'No product'}
                          >
                            {primaryProduct?.title || 'No product'}
                          </div>
                          {otherItemsCount > 0 ? (
                            <div className="text-[11px] text-slate-400 font-medium">
                              +{otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                            </div>
                          ) : primaryProduct?.size || primaryProduct?.variantLabel ? (
                            <div className="text-[11px] text-slate-400">
                              {primaryProduct?.size || primaryProduct?.variantLabel}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                    )}

                    {/* 5. Status Badge */}
                    {visibleColumns.status && (
                      <TableCell className="py-3 px-3">
                        {renderStatusBadge(order.orderStatus || order.status)}
                      </TableCell>
                    )}

                    {/* 6. Dispatch Action / Status */}
                    {visibleColumns.courier && (
                      <TableCell
                        className="py-3 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isDispatched ? (
                          <button
                            type="button"
                            onClick={(e) =>
                              handleCopyTracking(
                                order.courier?.trackingCode || '',
                                e
                              )
                            }
                            title={`Tracking: ${order.courier?.trackingCode || 'Dispatched'} (Click to copy)`}
                            className="h-8 px-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100/70 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                          >
                            <span>Dispatched</span>
                            {copiedTrackingId === order.courier?.trackingCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-emerald-600/80 hover:text-emerald-950 shrink-0" />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              isDispatching ||
                              (order.orderStatus || order.status) === 'CANCELLED'
                            }
                            onClick={(e) => handleDispatchSteadfast(order, e)}
                            className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#076E46] text-white hover:bg-[#055C3A] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Truck className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {isDispatching ? 'Booking...' : 'Dispatch'}
                            </span>
                          </button>
                        )}
                      </TableCell>
                    )}

                    {/* 7. Date Column */}
                    {visibleColumns.date && (
                      <TableCell className="py-3 px-3">
                        <span className="text-xs text-slate-600 font-normal whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                    )}

                    {/* 8. Amount Column */}
                    {visibleColumns.amount && (
                      <TableCell className="py-3 px-3 text-right">
                        <span className="font-semibold text-xs text-[#060d11]">
                          {formatAmount(effectiveTotal)}
                        </span>
                      </TableCell>
                    )}

                    {/* 9. Ekdom right e Action Button (...) matching Image 2 */}
                    <TableCell
                      className="py-3 px-3 text-right pr-4 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionMenuId(
                            isActionMenuOpen ? null : order._id
                          );
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Order actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu matching Image 2 */}
                      {isActionMenuOpen && (
                        <div
                          ref={actionMenuRef}
                          className={`absolute right-4 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-40 text-left animate-in fade-in zoom-in-95 ${
                            isNearBottom
                              ? 'bottom-full mb-1.5'
                              : 'top-full mt-1.5'
                          }`}
                        >
                          {/* View option */}
                          <Link
                            href={`/admin/orders/${order.orderNumber || order._id}`}
                            onClick={() => setActiveActionMenuId(null)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#060d11] rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>View</span>
                          </Link>

                          {/* Edit option */}
                          <Link
                            href={`/admin/orders/${order.orderNumber || order._id}/edit`}
                            onClick={() => setActiveActionMenuId(null)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#060d11] rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>Edit</span>
                          </Link>

                          {/* Steadfast Dispatch option if not yet dispatched */}
                          {!isDispatched && (
                            <button
                              type="button"
                              onClick={(e) => handleDispatchSteadfast(order, e)}
                              disabled={isDispatching}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Truck className="w-4 h-4 text-[#076E46] shrink-0" />
                              <span>Dispatch Steadfast</span>
                            </button>
                          )}

                          <div className="h-px bg-slate-100 my-1" />

                          {/* Quick Status Submenu */}
                          <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Status
                          </div>
                          {['CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={(e) => handleStatusChange(order, st, e)}
                              disabled={isStatusUpdating}
                              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer capitalize"
                            >
                              <span>{st.toLowerCase()}</span>
                              {(order.orderStatus || order.status) === st && (
                                <Check className="w-3.5 h-3.5 text-[#076E46]" />
                              )}
                            </button>
                          ))}

                          <div className="h-px bg-slate-100 my-1" />

                          {/* Delete option (matching Image 2 with red Trash icon) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(null);
                              setOrderToDelete(order);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
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

      {/* Pagination Footer matching Image 1 */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#060d11]">
                  Delete Order {orderToDelete.orderNumber}?
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this order? Reserved items will
                  be automatically restored to inventory. This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="h-9 px-4 text-xs font-medium text-slate-700 cursor-pointer rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-9 px-4 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer rounded-xl shadow-2xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
