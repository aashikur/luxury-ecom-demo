'use client';

import React, { useState, useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Badge,
  Input,
  Button,
} from '@/components/ui';
import {
  Search,
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  Download,
  ExternalLink,
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

export default function OrdersTableClient({
  initialOrders,
  totalCount,
}: OrdersTableClientProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = (order.orderStatus || order.status || 'PENDING').toUpperCase();

      if (activeTab !== 'ALL' && currentStatus !== activeTab) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = order.customer?.name?.toLowerCase().includes(q);
        const matchesPhone = order.customer?.phone?.includes(q);
        const matchesTracking = order.courier?.trackingCode?.toLowerCase().includes(q);
        return matchesNumber || matchesCustomer || matchesPhone || matchesTracking;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Dispatch to Steadfast Courier
  const handleDispatchSteadfast = async (order: OrderRow) => {
    if (dispatchingId) return;
    setDispatchingId(order._id);

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

      // Optimistically update local state
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

  // Update Status manually
  const handleStatusChange = async (order: OrderRow, nextStatus: string) => {
    if (statusUpdatingId) return;
    setStatusUpdatingId(order._id);

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

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'OrderNumber,Customer,Phone,Zone,Total,PaymentStatus,OrderStatus,TrackingCode,CreatedAt\n';
    const rows = filteredOrders
      .map((o) => {
        const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
        const effectiveTotal = o.totalAmount ?? o.financials?.totalAmount ?? 0;
        return `"${o.orderNumber}","${o.customer?.name || ''}","${o.customer?.phone || ''}","${o.customer?.deliveryZone || ''}",${effectiveTotal},"${o.payment?.status || ''}","${o.orderStatus || ''}","${o.courier?.trackingCode || ''}","${dateStr}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${Date.now()}.csv`;
    a.click();
  };

  const getStatusBadgeVariant = (st: string) => {
    switch (st.toUpperCase()) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
        return 'info';
      case 'CONFIRMED':
        return 'outline';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
      case 'RETURNED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case 'INSIDE_DHAKA':
        return { label: 'Inside Dhaka (৳70)', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'DHAKA_SUBURBS':
        return { label: 'Dhaka Suburbs (৳100)', cls: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'OUTSIDE_DHAKA':
        return { label: 'Outside Dhaka (৳130)', cls: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { label: zone || 'Standard', cls: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#060d11] text-white px-4 py-3 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls: Tabs, Search, Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#060d11] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                {tab === 'ALL' && ` (${totalCount})`}
              </button>
            );
          })}
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order, phone, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#076E46]"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs text-slate-700 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Orders Table Container */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Order ID</TableHead>
              <TableHead className="w-48">Customer</TableHead>
              <TableHead className="w-36">Delivery Zone</TableHead>
              <TableHead className="w-48">Items</TableHead>
              <TableHead className="w-28 text-right">Amount</TableHead>
              <TableHead className="w-28">Payment</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-44 text-right">Steadfast Dispatch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                    <span>No orders found matching the filter criteria.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const currentStatus = (order.orderStatus || order.status || 'PENDING').toUpperCase();
                const zoneInfo = getZoneLabel(order.customer?.deliveryZone);
                const isDispatched = Boolean(order.courier?.trackingCode);
                const isDispatching = dispatchingId === order._id;
                const isStatusUpdating = statusUpdatingId === order._id;

                return (
                  <TableRow key={order._id}>
                    {/* Order Number & Date */}
                    <TableCell>
                      <div className="font-semibold text-[#060d11]">{order.orderNumber}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </TableCell>

                    {/* Customer Info */}
                    <TableCell>
                      <div className="font-medium text-[#060d11]">{order.customer?.name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.customer?.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5" title={order.customer?.address}>
                        {order.customer?.address}
                      </div>
                    </TableCell>

                    {/* Delivery Zone Badge */}
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${zoneInfo.cls}`}>
                        {zoneInfo.label}
                      </span>
                    </TableCell>

                    {/* Order Items */}
                    <TableCell>
                      <div className="text-[11px] text-slate-700">
                        <span className="font-semibold">{order.items?.length || 0} item(s)</span>
                        {order.items?.[0] && (
                          <div className="text-slate-400 truncate max-w-[180px] mt-0.5" title={order.items[0].title}>
                            {order.items[0].title}
                            {order.items[0].size ? ` (${order.items[0].size})` : ''}
                            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="text-right">
                      {(() => {
                        const effectiveTotal = order.totalAmount ?? order.financials?.totalAmount ?? 0;
                        const effectiveDelivery = order.deliveryFee ?? order.financials?.deliveryFee ?? 0;
                        return (
                          <>
                            <div className="font-semibold text-[#060d11]">৳{effectiveTotal.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {effectiveDelivery > 0 ? `incl. ৳${effectiveDelivery} del` : 'Free shipping'}
                            </div>
                          </>
                        );
                      })()}
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={
                            order.payment?.status === 'PAID'
                              ? 'success'
                              : order.payment?.status === 'PENDING_VERIFICATION'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {order.payment?.status || 'UNPAID'}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {order.payment?.method || 'COD'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Order Status Dropdown */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={currentStatus}
                          disabled={isStatusUpdating}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className="text-[11px] font-semibold rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#076E46]"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="RETURNED">Returned</option>
                        </select>
                      </div>
                    </TableCell>

                    {/* Steadfast Dispatch Action */}
                    <TableCell className="text-right">
                      {isDispatched ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            {order.courier?.trackingCode}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {order.courier?.provider || 'STEADFAST'}
                          </span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isDispatching || currentStatus === 'CANCELLED'}
                          onClick={() => handleDispatchSteadfast(order)}
                          className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-7 px-2.5 font-medium shadow-2xs"
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          {isDispatching ? 'Booking...' : 'Dispatch'}
                        </Button>
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
