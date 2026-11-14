'use client';

import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

interface TrackOrderData {
  orderNumber: string;
  customer: {
    name: string;
    phoneMasked: string;
  };
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'INCOMPLETE';
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
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function TrackOrderModal({
  isOpen,
  onClose,
  accentColor = '#B8860B',
}: TrackOrderModalProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<TrackOrderData | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrderData(null);

    const cleanOrderNumber = orderNumber.trim();
    const cleanPhoneLast4 = phoneLast4.trim();

    if (!cleanOrderNumber || !cleanPhoneLast4) {
      setError('Please provide both Order Number and the last 4 digits of your phone.');
      return;
    }

    if (cleanPhoneLast4.length !== 4 || !/^\d{4}$/.test(cleanPhoneLast4)) {
      setError('Phone verification must be exactly the last 4 digits.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(cleanOrderNumber)}&phoneLast4=${encodeURIComponent(cleanPhoneLast4)}`
      );
      const data = await res.json();

      if (data.success && data.data) {
        setOrderData(data.data);
      } else {
        setError(data.error || 'No matching order found. Please check your credentials.');
      }
    } catch {
      setError('Network communication failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
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
  const isTerminalNegative = orderData?.orderStatus === 'CANCELLED' || orderData?.orderStatus === 'RETURNED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white max-w-lg w-full rounded-none shadow-2xl border border-zinc-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-zinc-950" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950">
                Live Order & Parcel Tracking
              </h3>
              <p className="text-[11px] text-zinc-500">
                Steadfast Courier & Dispatch Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 transition cursor-pointer"
            aria-label="Close Tracking Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUR-12345"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-zinc-300 text-xs font-mono uppercase focus:outline-none focus:border-zinc-950 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Last 4 Digits of Phone
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. 5678"
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-zinc-300 text-xs font-mono focus:outline-none focus:border-zinc-950 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: accentColor }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white cursor-pointer hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Locating Consignment...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Parcel</span>
                </>
              )}
            </button>
          </form>

          {/* Error Notice */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Card */}
          {orderData && (
            <div className="mt-6 border border-zinc-200 bg-zinc-50 p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Order Reference
                  </span>
                  <span className="text-sm font-bold text-zinc-950 font-mono">
                    {orderData.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    Customer
                  </span>
                  <span className="text-xs font-semibold text-zinc-900">
                    {orderData.customer.name} ({orderData.customer.phoneMasked})
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              {isTerminalNegative ? (
                <div className="p-3 bg-red-100/70 border border-red-300 text-red-900 text-xs font-semibold uppercase tracking-wider text-center">
                  Order Status: {orderData.orderStatus}
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-center justify-between relative">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                              isCompleted
                                ? 'bg-zinc-950 text-white'
                                : 'bg-zinc-200 text-zinc-500'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[9px] uppercase tracking-wider mt-1.5 text-center ${
                              isCurrent
                                ? 'font-bold text-zinc-950'
                                : isCompleted
                                ? 'font-medium text-zinc-700'
                                : 'text-zinc-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Courier Consignment Section */}
              <div className="pt-3 border-t border-zinc-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-zinc-400" />
                    Courier Service:
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {orderData.courier?.provider || 'STEADFAST'} EXPRESS
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Consignment ID:</span>
                  <span className="font-mono font-bold text-zinc-950">
                    {orderData.courier?.consignmentId || 'Pending Dispatch'}
                  </span>
                </div>

                {orderData.courier?.trackingCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Tracking Code:</span>
                    <span className="font-mono text-zinc-800">
                      {orderData.courier.trackingCode}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Payable Amount:</span>
                  <span className="font-bold text-zinc-950">
                    ৳{orderData.totalAmount.toLocaleString()} ({orderData.paymentStatus || 'UNPAID'})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Placed on:
                  </span>
                  <span>{new Date(orderData.createdAt).toLocaleDateString()}</span>
                </div>

                {orderData.courier?.trackingUrl && (
                  <div className="pt-2">
                    <a
                      href={orderData.courier.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-white border border-zinc-300 hover:border-zinc-950 text-zinc-900 text-xs font-semibold transition"
                    >
                      <span>Open Steadfast Tracking Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
