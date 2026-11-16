'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Search,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TrackOrderData {
  orderNumber: string;
  customer: {
    name: string;
    phoneMasked: string;
  };
  orderStatus:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURNED'
    | 'INCOMPLETE';
  paymentStatus?: string;
  totalAmount: number;
  courier?: {
    provider?: string;
    consignmentId?: string;
    trackingCode?: string;
    status?: string;
    trackingUrl?: string;
  };
  createdAt: string;
  itemCount: number;
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Order received into vault' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified & queued' },
  { key: 'PROCESSING', label: 'Processing', desc: 'Packaged & QC inspection' },
  { key: 'SHIPPED', label: 'In Transit', desc: 'Handed to courier express' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Safely delivered to door' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'CONFIRMED':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'PROCESSING':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'SHIPPED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'DELIVERED':
      return 'bg-emerald-600 text-white border-emerald-700';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'RETURNED':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    default:
      return 'bg-zinc-100 text-zinc-800 border-zinc-200';
  }
}

export default function TrackOrderView() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || searchParams.get('order') || '';
  const initialPhone = searchParams.get('phone') || searchParams.get('phoneLast4') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<TrackOrderData | null>(null);
  const [, startTransition] = useTransition();

  // Auto-track on mount if valid parameters are provided in URL
  useEffect(() => {
    if (initialOrder.trim() && initialPhone.trim().length >= 4) {
      executeTrack(initialOrder.trim(), initialPhone.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeTrack = async (targetOrder: string, targetPhone: string) => {
    setError(null);
    setOrderData(null);

    const cleanOrder = targetOrder.trim().toUpperCase();
    const cleanDigits = targetPhone.replace(/\D/g, '');

    if (!cleanOrder) {
      setError('Please enter your Order Reference Number (e.g. AUR-12345).');
      return;
    }

    if (cleanDigits.length < 4) {
      setError('Please provide your full 11-digit mobile number or at least the last 4 digits.');
      return;
    }

    setIsLoading(true);

    try {
      const query = new URLSearchParams({
        orderNumber: cleanOrder,
        phone: cleanDigits,
      });

      const res = await fetch(`/api/orders/track?${query.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        startTransition(() => {
          setOrderData(data.data);
        });
      } else {
        setError(data.error || 'No matching order found. Please verify your order number and mobile number.');
      }
    } catch {
      setError('Network communication failed. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrack(orderNumber, phone);
  };

  const handleReset = () => {
    setOrderNumber('');
    setPhone('');
    setError(null);
    setOrderData(null);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = orderData ? getStepIndex(orderData.orderStatus) : 0;
  const isTerminalNegative =
    orderData?.orderStatus === 'CANCELLED' || orderData?.orderStatus === 'RETURNED';

  return (
    <div className="min-h-[70vh] bg-[#fbfbfa] py-8 sm:py-14 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#060d11] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#060d11]">Track Order</span>
        </nav>

        {/* Minimal Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#076E46]/10 text-[#076E46] text-[11px] font-bold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Live Parcel Dispatch Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#060d11] tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Enter your order reference and mobile number to verify live Steadfast courier dispatch
            and delivery progression.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white border border-zinc-200/90 rounded-none sm:rounded-xl shadow-xs p-6 sm:p-8 transition-all">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#060d11] mb-1.5 uppercase tracking-wide">
                  Order Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUR-12345"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs font-mono uppercase text-[#060d11] placeholder:text-zinc-400 focus:outline-none focus:border-[#076E46] focus:bg-white transition"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Found in your order SMS or receipt
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#060d11] mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX or last 4 digits"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs font-mono text-[#060d11] placeholder:text-zinc-400 focus:outline-none focus:border-[#076E46] focus:bg-white transition"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  11-digit BD number or last 4 digits
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#076E46] hover:bg-[#055C3A] text-white rounded text-xs font-bold uppercase tracking-[0.16em] transition active:scale-[0.98] duration-75 disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Locating Consignment...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Consignment</span>
                </>
              )}
            </button>
          </form>

          {/* Error Notice */}
          {error && (
            <div className="mt-5 p-3.5 bg-red-50/80 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Verification Notice</p>
                <p className="mt-0.5 text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {orderData && (
            <div className="mt-8 pt-6 border-t border-zinc-200 space-y-6 animate-in fade-in duration-200">
              {/* Order Reference & Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-200/80">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Order Reference
                  </div>
                  <div className="text-base font-bold text-[#060d11] font-mono tracking-tight mt-0.5">
                    {orderData.orderNumber}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                      orderData.orderStatus
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {orderData.orderStatus}
                  </span>
                </div>
              </div>

              {/* Status Progression Timeline */}
              {isTerminalNegative ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs text-center font-medium">
                  This order has been flagged as{' '}
                  <span className="font-bold uppercase">{orderData.orderStatus}</span>. For
                  clarification, please contact our concierge helpline.
                </div>
              ) : (
                <div className="py-2">
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-zinc-200 hidden sm:block -z-0">
                      <div
                        className="h-full bg-[#076E46] transition-all duration-500"
                        style={{
                          width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center text-center p-2 rounded sm:p-0"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isCompleted
                                  ? 'bg-[#076E46] text-white ring-4 ring-[#076E46]/15'
                                  : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-xs mt-2 font-semibold tracking-wide ${
                                isCurrent
                                  ? 'text-[#076E46]'
                                  : isCompleted
                                  ? 'text-[#060d11]'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 hidden sm:block leading-tight">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Courier & Dispatch Logistics Card */}
              <div className="bg-zinc-50 rounded-lg border border-zinc-200/90 p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#076E46]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#060d11]">
                      Express Courier Logistics
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase">
                    {orderData.courier?.provider || 'STEADFAST'} EXPRESS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 uppercase text-[10px] font-semibold tracking-wider block">
                      Consignment ID
                    </span>
                    <span className="font-mono font-bold text-[#060d11] text-sm">
                      {orderData.courier?.consignmentId || 'Pending Dispatch'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 uppercase text-[10px] font-semibold tracking-wider block">
                      Steadfast Tracking Code
                    </span>
                    <span className="font-mono font-medium text-zinc-800 text-xs">
                      {orderData.courier?.trackingCode || 'Generated upon pickup'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 uppercase text-[10px] font-semibold tracking-wider block">
                      Courier Status
                    </span>
                    <span className="font-semibold text-zinc-800 uppercase">
                      {orderData.courier?.status || 'In Transit Queued'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 uppercase text-[10px] font-semibold tracking-wider block">
                      Estimated Delivery
                    </span>
                    <span className="font-medium text-zinc-700">
                      Dhaka 24-48h | Suburbs & Outside 48-72h
                    </span>
                  </div>
                </div>

                {orderData.courier?.trackingUrl && (
                  <div className="pt-2">
                    <a
                      href={orderData.courier.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-white border border-zinc-300 hover:border-[#060d11] rounded text-[#060d11] text-xs font-semibold transition active:scale-[0.98] duration-75 shadow-xs"
                    >
                      <span>Open Steadfast Live Tracker</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Order Details & Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white border border-zinc-200 rounded">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
                    Customer
                  </span>
                  <span className="font-bold text-[#060d11] mt-0.5 block truncate">
                    {orderData.customer.name}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {orderData.customer.phoneMasked}
                  </span>
                </div>

                <div className="p-3 bg-white border border-zinc-200 rounded">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
                    Payable Total
                  </span>
                  <span className="font-bold text-[#060d11] text-sm mt-0.5 block">
                    ৳{orderData.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-emerald-700">
                    {orderData.paymentStatus || 'COD'}
                  </span>
                </div>

                <div className="p-3 bg-white border border-zinc-200 rounded">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
                    Garments
                  </span>
                  <span className="font-bold text-[#060d11] text-sm mt-0.5 block">
                    {orderData.itemCount} {orderData.itemCount === 1 ? 'Item' : 'Items'}
                  </span>
                  <span className="text-[10px] text-zinc-400">Vault Checked</span>
                </div>

                <div className="p-3 bg-white border border-zinc-200 rounded">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
                    Booked Date
                  </span>
                  <span className="font-semibold text-zinc-800 mt-0.5 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {new Date(orderData.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] text-zinc-400">Dhaka Standard Time</span>
                </div>
              </div>

              {/* Track Another Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#060d11] transition active:scale-[0.98] duration-75 cursor-pointer py-2 px-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Track Another Order</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support & Concierge Assistance Card */}
        <div className="mt-8 p-5 bg-white border border-zinc-200/80 rounded-none sm:rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-[#076E46]/10 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-[#076E46]" />
            </div>
            <div>
              <h4 className="font-bold text-[#060d11]">Need Urgent Courier Support?</h4>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Address modifications or reschedule delivery before consignment dispatch.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:+8801823392110"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white rounded text-xs font-bold tracking-wider uppercase hover:bg-zinc-800 transition active:scale-[0.98] duration-75"
            >
              Concierge Call
            </a>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-300 text-[#060d11] rounded text-xs font-semibold tracking-wider uppercase hover:border-[#060d11] transition active:scale-[0.98] duration-75"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore</span>
            </Link>
          </div>
        </div>

        {/* Security & Authenticity Trust Seal */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>IDOR-protected secure tracking powered by Steadfast Express Bangladesh</span>
        </div>
      </div>
    </div>
  );
}
