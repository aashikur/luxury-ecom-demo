'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumb, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function NewOrderFormClient() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'New Order' },
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
      // Map display label to domain status
      const statusMap: Record<string, string> = {
        Pending: 'PENDING',
        Processing: 'PROCESSING',
        Confirmed: 'CONFIRMED',
        Shipped: 'SHIPPED',
        Completed: 'DELIVERED',
        Cancelled: 'CANCELLED',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isManualOrder: true,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          customerEmail: customerEmail.trim(),
          productName: productName.trim(),
          amount: parseFloat(amount) || 0,
          status: statusMap[status] || 'PENDING',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to create order');
      }

      router.push('/admin/orders');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating order';
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
          New Order
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new customer order.
        </p>
      </div>

      {/* 2. Order Details Form Card */}
      <Card className="border border-slate-200 bg-white shadow-2xs rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold leading-none tracking-tight text-[#060d11]">
            Order Details
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 mt-1">
            Fill in the customer information and order details below.
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
                placeholder="e.g. Emma Wilson"
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
                placeholder="e.g. 01712345678"
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
                placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka"
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
                placeholder="e.g. emma@example.com"
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
                placeholder="e.g. Pro Dashboard License"
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
                placeholder="0.00"
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
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </Button>

              <Link href="/admin/orders">
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
