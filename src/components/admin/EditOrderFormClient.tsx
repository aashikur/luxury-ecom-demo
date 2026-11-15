'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumb, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export interface EditOrderData {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount?: number;
  financials?: {
    totalAmount?: number;
  };
  orderStatus: string;
  status: string;
}

export default function EditOrderFormClient({ order }: { order: EditOrderData }) {
  const router = useRouter();
  const currentTotal = order.totalAmount ?? order.financials?.totalAmount ?? 0;
  const currentProduct = order.items?.[0]?.title || '';

  const [customerName, setCustomerName] = useState(order.customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(order.customer?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(order.customer?.address || '');
  const [customerEmail, setCustomerEmail] = useState(order.customer?.email || '');
  const [productName, setProductName] = useState(currentProduct);
  const [amount, setAmount] = useState(String(currentTotal));

  // Map database status to display string
  const getDisplayStatus = (st: string) => {
    switch (st.toUpperCase()) {
      case 'DELIVERED':
        return 'Completed';
      case 'PROCESSING':
        return 'Processing';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'SHIPPED':
        return 'Shipped';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const [status, setStatus] = useState(getDisplayStatus(order.orderStatus || order.status || 'PENDING'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders', href: '/admin/orders' },
    { label: order.orderNumber, href: `/admin/orders/${order.orderNumber}` },
    { label: 'Edit' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Customer Name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Phone Number is required.');
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMessage('Address is required.');
      return;
    }
    if (!productName.trim()) {
      setErrorMessage('Product Name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const statusMap: Record<string, string> = {
        Pending: 'PENDING',
        Processing: 'PROCESSING',
        Confirmed: 'CONFIRMED',
        Shipped: 'SHIPPED',
        Completed: 'DELIVERED',
        Cancelled: 'CANCELLED',
      };

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          customerEmail: customerEmail.trim(),
          productName: productName.trim(),
          amount: parseFloat(amount) || 0,
          status: statusMap[status] || 'PENDING',
          updatedBy: 'ADMIN',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to update order');
      }

      router.push(`/admin/orders/${order.orderNumber}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating order';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-2xl">
      {/* 1. Header with Breadcrumb, Title & Subtitle */}
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1">
          Edit {order.orderNumber}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update order and customer information.
        </p>
      </div>

      {/* 2. Order Details Form Card */}
      <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold leading-none tracking-tight text-[#060d11]">
            Order Details
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 mt-1">
            Modify the customer details and order fields below and save to update this order.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Emma Wilson"
                required
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46]"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                required
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46]"
              />
            </div>

            {/* Customer Address */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="House 12, Road 4, Sector 7, Uttara, Dhaka"
                required
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46] resize-none"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Customer Email <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="emma@example.com"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46]"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Pro Dashboard License"
                required
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46]"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Amount (৳)
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="299"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46]"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs focus:border-[#076E46] focus:outline-none focus:ring-1 focus:ring-[#076E46] cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-9 px-4 font-semibold shadow-2xs cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>

              <Link href={`/admin/orders/${order.orderNumber}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs h-9 px-4 font-medium border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
