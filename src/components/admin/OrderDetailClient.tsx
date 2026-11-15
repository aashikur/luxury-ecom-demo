'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  User,
  ShoppingBag,
  Pencil,
  Trash2,
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Calendar,
  Clock,
  Check,
  X,
} from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';

export interface OrderItemData {
  productId?: string;
  variantId?: string | null;
  sku?: string;
  title: string;
  image?: string;
  size?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface OrderDetailData {
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
  items: OrderItemData[];
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
  inventoryState?: string;
  courier?: {
    provider?: string;
    consignmentId?: string;
    trackingCode?: string;
    status?: string;
    bookingError?: string;
  };
  createdAt: string | Date;
  updatedAt?: string | Date;
}

function getInitials(name?: string, fallback = 'CU'): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatStatus(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return { label: 'Pending', badge: 'warning' as const };
    case 'CONFIRMED':
      return { label: 'Confirmed', badge: 'secondary' as const };
    case 'PROCESSING':
      return { label: 'Processing', badge: 'secondary' as const };
    case 'SHIPPED':
      return { label: 'Shipped', badge: 'secondary' as const };
    case 'DELIVERED':
    case 'COMPLETED':
      return { label: 'Completed', badge: 'success' as const };
    case 'CANCELLED':
      return { label: 'Cancelled', badge: 'destructive' as const };
    case 'RETURNED':
      return { label: 'Returned', badge: 'destructive' as const };
    default:
      return { label: status, badge: 'secondary' as const };
  }
}

export default function OrderDetailClient({ initialOrder }: { initialOrder: OrderDetailData }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetailData>(initialOrder);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentStatus = (order.orderStatus || order.status || 'PENDING').toUpperCase();
  const statusInfo = formatStatus(currentStatus);
  const totalAmount = order.totalAmount ?? order.financials?.totalAmount ?? 0;
  const subtotal = order.subtotal ?? order.financials?.subtotal ?? totalAmount;
  const deliveryFee = order.deliveryFee ?? order.financials?.deliveryFee ?? 0;
  const discountAmount = order.discountAmount ?? order.financials?.discount ?? 0;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders', href: '/admin/orders' },
    { label: order.orderNumber },
  ];

  // Update Status
  const handleStatusChange = async (newStatus: string) => {
    if (isUpdatingStatus || newStatus === currentStatus) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: newStatus,
          updatedBy: 'ADMIN',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update status');
      }

      setOrder((prev) => ({
        ...prev,
        orderStatus: newStatus,
        status: newStatus,
      }));
      showToast(`Order status updated to ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      showToast(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    if (
      !confirm(
        `Are you sure you want to delete order ${order.orderNumber}? This will permanently remove the record and restore reserved inventory.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/orders?id=${order._id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to delete order');
      }

      router.push('/admin/orders');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting order';
      alert(msg);
      setIsDeleting(false);
    }
  };

  // Dispatch to Steadfast Courier
  const handleDispatchCourier = async () => {
    if (isDispatching) return;
    setIsDispatching(true);

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
      showToast(`Consignment booked with Steadfast! Tracking: ${trackingCode}`);

      setOrder((prev) => ({
        ...prev,
        orderStatus: 'SHIPPED',
        status: 'SHIPPED',
        courier: {
          ...prev.courier,
          provider: 'STEADFAST',
          consignmentId: json.data?.consignmentId,
          trackingCode: json.data?.trackingCode,
          status: 'in_review',
        },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error dispatching order';
      showToast(msg);
    } finally {
      setIsDispatching(false);
    }
  };

  const isDispatched = Boolean(order.courier?.trackingCode);

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#060d11] text-white px-4 py-3 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Header with Title, Date, Edit & Delete Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11]">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Placed on {formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Action Button (Matching Reference) */}
          <Link href={`/admin/orders/${order.orderNumber || order._id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 gap-1.5 font-medium border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </Button>
          </Link>

          {/* Delete Action Button (Matching Reference) */}
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleDeleteOrder}
            className="h-9 px-3.5 gap-1.5 font-medium shadow-2xs cursor-pointer bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </Button>
        </div>
      </div>

      {/* 3 Core Cards Grid: Order Details | Customer | Product */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: ORDER DETAILS */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-base font-semibold leading-none tracking-tight text-[#060d11]">
                Order Details
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-slate-500 mt-1">
              Core order information
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Order ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Order ID</span>
              <span className="font-semibold text-[#060d11] font-mono">{order.orderNumber}</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : currentStatus === 'PENDING'
                      ? 'bg-amber-500 text-white'
                      : currentStatus === 'CANCELLED' || currentStatus === 'RETURNED'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {statusInfo.label}
                </span>
                <select
                  value={currentStatus}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-7 text-[11px] font-medium rounded border border-slate-200 bg-white px-1.5 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#076E46] cursor-pointer"
                  title="Change status"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-[#060d11]">{formattedDate}</span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-[#060d11]">৳{totalAmount.toLocaleString()}</span>
            </div>

            {/* Payment Method & Status */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-500">Payment</span>
              <div className="text-right">
                <span className="font-medium text-[#060d11] text-xs">
                  {order.payment?.method || 'Cash on Delivery'}
                </span>
                <span
                  className={`block text-[10px] font-semibold mt-0.5 ${
                    order.payment?.status === 'PAID'
                      ? 'text-emerald-600'
                      : order.payment?.status === 'PENDING_VERIFICATION'
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                >
                  {order.payment?.status || 'UNPAID'}
                  {order.payment?.trxId ? ` (Trx: ${order.payment.trxId})` : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: CUSTOMER */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-base font-semibold leading-none tracking-tight text-[#060d11]">
                Customer
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-slate-500 mt-1">
              Customer information
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Customer Avatar + Name + Email */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#076E46] flex items-center justify-center font-bold text-sm shrink-0">
                {getInitials(order.customer?.name)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#060d11] truncate">
                  {order.customer?.name || 'Customer'}
                </div>
                <div
                  className="text-xs text-slate-500 truncate"
                  title={order.customer?.email || ''}
                >
                  {order.customer?.email || 'No email provided'}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2.5 text-xs pt-2 border-t border-slate-100">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Phone</span>
                <span className="font-semibold text-[#060d11] font-mono">
                  {order.customer?.phone || 'No phone'}
                </span>
                {order.customer?.altPhone && (
                  <span className="text-slate-400 block text-[11px]">
                    Alt: {order.customer.altPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Delivery Address</span>
                <p className="text-slate-800 leading-relaxed font-medium mt-0.5">
                  {order.customer?.address || 'No address provided'}
                </p>
                {order.customer?.deliveryZone && (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {order.customer.deliveryZone === 'INSIDE_DHAKA'
                      ? 'Inside Dhaka'
                      : order.customer.deliveryZone === 'DHAKA_SUBURBS'
                      ? 'Dhaka Suburbs'
                      : 'Outside Dhaka'}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: PRODUCT */}
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-base font-semibold leading-none tracking-tight text-[#060d11]">
                Product
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-slate-500 mt-1">
              Purchased product details
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.image && (
                      <div className="relative w-8 h-10 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.size || item.variantLabel ? `Size: ${item.size || item.variantLabel} · ` : ''}
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-semibold text-[#060d11]">
                      ৳{(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ৳{item.unitPrice.toLocaleString()} each
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">No items in this order</div>
            )}

            {/* Financial Summary */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span>{deliveryFee > 0 ? `৳${deliveryFee}` : 'Free'}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#060d11] pt-1.5 border-t border-slate-200">
                <span>Total</span>
                <span>৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Steadfast Courier Fulfillment Card */}
      <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#076E46] border border-emerald-200 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#060d11]">Steadfast Courier Booking</h3>
                {isDispatched && (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Dispatched
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDispatched
                  ? `Consignment ID: ${order.courier?.consignmentId || 'N/A'} · Tracking Code: ${
                      order.courier?.trackingCode || 'N/A'
                    }`
                  : 'Automated 1-click booking to Steadfast Courier logistics.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDispatched ? (
              <a
                href={`https://steadfast.com.bd/t/${order.courier?.trackingCode}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>Track on Steadfast</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled={isDispatching || currentStatus === 'CANCELLED'}
                onClick={handleDispatchCourier}
                className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-9 px-4 font-semibold shadow-2xs gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{isDispatching ? 'Booking...' : 'Book Steadfast Courier'}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
