'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Check,
  Copy,
  Tag,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useCart, getCartItemKey } from '@/context/CartContext';

interface CheckoutClientViewProps {
  storeName?: string;
  accentColor?: string;
  insideDhakaFee?: number;
  dhakaSuburbsFee?: number;
  outsideDhakaFee?: number;
  freeShippingThreshold?: number;
  manualBkashNumber?: string;
  supportPhone?: string;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

export default function CheckoutClientView({
  accentColor = '#B8860B',
  insideDhakaFee = 70,
  dhakaSuburbsFee = 100,
  outsideDhakaFee = 130,
  freeShippingThreshold = 2500,
  manualBkashNumber = '01700000000',
}: CheckoutClientViewProps) {
  const router = useRouter();
  const { cart, subtotal, clearCart, setIsCartOpen } = useCart();

  const [deliveryZone, setDeliveryZone] = useState<'INSIDE_DHAKA' | 'DHAKA_SUBURBS' | 'OUTSIDE_DHAKA'>(
    'INSIDE_DHAKA'
  );
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MANUAL_BKASH'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    note: '',
    trxId: '',
  });

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Price calculations
  const isFreeShipping = subtotal >= freeShippingThreshold && subtotal > 0;
  const deliveryFee =
    cart.length === 0 || isFreeShipping
      ? 0
      : deliveryZone === 'INSIDE_DHAKA'
      ? insideDhakaFee
      : deliveryZone === 'DHAKA_SUBURBS'
      ? dhakaSuburbsFee
      : outsideDhakaFee;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const copyBkashNumber = () => {
    navigator.clipboard?.writeText(manualBkashNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  // Silent lead capture on phone blur for abandoned cart recovery
  const handlePhoneBlur = async () => {
    const rawPhone = customerForm.phone.trim();
    if (/^01[3-9]\d{8}$/.test(rawPhone) && cart.length > 0) {
      try {
        await fetch('/api/orders/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: rawPhone,
            name: customerForm.name.trim(),
            address: customerForm.address.trim(),
            deliveryZone,
            cartItems: cart.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
          }),
        });
      } catch {
        // Silent catch
      }
    }
  };

  // Coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);

    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    setIsApplyingCoupon(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          cartTotal: subtotal,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.valid) {
        setAppliedCoupon({
          code: data.data.code,
          discountAmount: data.data.discountAmount,
        });
        setCouponCodeInput('');
      } else {
        setCouponError(data.error || data.data?.message || 'Invalid or expired promo code');
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Place Order handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerForm.name.trim() || !customerForm.phone.trim() || !customerForm.address.trim()) {
      alert('Please fill in your Full Name, 11-Digit Mobile Number, and Delivery Address.');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(customerForm.phone.trim())) {
      alert('Please enter a valid 11-digit Bangladeshi mobile number (013-019XXXXXXXX).');
      return;
    }

    if (paymentMethod === 'MANUAL_BKASH' && !customerForm.trxId.trim()) {
      alert('Please enter your 10-character bKash Transaction ID (TrxID).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerForm.name.trim(),
            phone: customerForm.phone.trim(),
            address: customerForm.address.trim(),
            city: customerForm.city.trim() || 'Dhaka',
            deliveryZone,
            note: customerForm.note.trim() || undefined,
          },
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            sku: item.sku || '',
            title: item.title,
            image: item.image,
            size: item.size || '',
            variantLabel: item.variantLabel || item.size || '',
            attributes: item.attributes || [],
            modifiers: item.modifiers || [],
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          paymentMethod,
          trxId: customerForm.trxId.trim().toUpperCase(),
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const orderNumber = data.data.orderNumber;
        const phone = customerForm.phone.trim();
        clearCart();
        // Immediately route to live consignment tracking & invoice page
        router.push(`/track-order?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      } else {
        alert(data.error || 'Failed to place order. Please review your details and try again.');
      }
    } catch {
      alert('Network error while placing order. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is completely empty
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4">
          <div
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          >
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You do not have any garments queued for checkout. Explore our latest luxury curation.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              style={{ backgroundColor: accentColor }}
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-xs font-bold uppercase tracking-[0.18em] rounded hover:opacity-95 transition active:scale-[0.98] duration-75 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-16">
      <main className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigator & Security Badge (No Duplicate Header) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-medium mb-8 pb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Link href="/shop" className="hover:text-zinc-900 transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Catalog</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hover:text-zinc-900 transition cursor-pointer"
            >
              Shopping Bag
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <span className="text-zinc-950 font-bold">Smart Checkout</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full text-[11px] font-medium">
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* =========================================================
              LEFT COLUMN: Contact, Shipping & Payment (7 Columns)
             ========================================================= */}
          <div className="lg:col-span-7 space-y-8">
            <form id="main-checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              {/* SECTION 1: Contact Information */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200/80 pb-2">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-950">
                    1. Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wide">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={customerForm.phone}
                      onBlur={handlePhoneBlur}
                      onChange={(e) =>
                        setCustomerForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      SMS order confirmation & delivery updates will be sent here
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wide">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Recipient Full Name"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Delivery Address */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200/80 pb-2">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-950">
                    2. Delivery Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wide">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="House / Flat No, Road No, Area, Police Station / Upazila"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wide">
                        City / District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dhaka, Chittagong, Sylhet"
                        value={customerForm.city}
                        onChange={(e) =>
                          setCustomerForm((p) => ({ ...p, city: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1.5 uppercase tracking-wide">
                        Delivery Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Leave with gate security / Landmark"
                        value={customerForm.note}
                        onChange={(e) =>
                          setCustomerForm((p) => ({ ...p, note: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-300 rounded text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: 3-Zone Delivery Logistics */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200/80 pb-2">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-950">
                    3. Shipping Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Inside Dhaka */}
                  <label
                    onClick={() => setDeliveryZone('INSIDE_DHAKA')}
                    className={`p-3.5 border rounded-lg cursor-pointer transition flex flex-col justify-between ${
                      deliveryZone === 'INSIDE_DHAKA'
                        ? 'border-zinc-950 bg-zinc-50/80 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                          Inside Dhaka
                        </span>
                        <input
                          type="radio"
                          name="shipping_zone"
                          checked={deliveryZone === 'INSIDE_DHAKA'}
                          onChange={() => setDeliveryZone('INSIDE_DHAKA')}
                          className="w-3.5 h-3.5 text-zinc-950"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 block mt-1">24–48h Express</span>
                    </div>
                    <div className="pt-3">
                      {isFreeShipping ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs line-through text-zinc-400">৳{insideDhakaFee}</span>
                          <span style={{ color: accentColor }} className="text-xs font-bold">FREE</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-zinc-950">৳{insideDhakaFee}</span>
                      )}
                    </div>
                  </label>

                  {/* Dhaka Suburbs */}
                  <label
                    onClick={() => setDeliveryZone('DHAKA_SUBURBS')}
                    className={`p-3.5 border rounded-lg cursor-pointer transition flex flex-col justify-between ${
                      deliveryZone === 'DHAKA_SUBURBS'
                        ? 'border-zinc-950 bg-zinc-50/80 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                          Dhaka Suburbs
                        </span>
                        <input
                          type="radio"
                          name="shipping_zone"
                          checked={deliveryZone === 'DHAKA_SUBURBS'}
                          onChange={() => setDeliveryZone('DHAKA_SUBURBS')}
                          className="w-3.5 h-3.5 text-zinc-950"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 block mt-1">Savar, Gazipur, Narayanganj</span>
                    </div>
                    <div className="pt-3">
                      {isFreeShipping ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs line-through text-zinc-400">৳{dhakaSuburbsFee}</span>
                          <span style={{ color: accentColor }} className="text-xs font-bold">FREE</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-zinc-950">৳{dhakaSuburbsFee}</span>
                      )}
                    </div>
                  </label>

                  {/* Outside Dhaka */}
                  <label
                    onClick={() => setDeliveryZone('OUTSIDE_DHAKA')}
                    className={`p-3.5 border rounded-lg cursor-pointer transition flex flex-col justify-between ${
                      deliveryZone === 'OUTSIDE_DHAKA'
                        ? 'border-zinc-950 bg-zinc-50/80 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                          Outside Dhaka
                        </span>
                        <input
                          type="radio"
                          name="shipping_zone"
                          checked={deliveryZone === 'OUTSIDE_DHAKA'}
                          onChange={() => setDeliveryZone('OUTSIDE_DHAKA')}
                          className="w-3.5 h-3.5 text-zinc-950"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-500 block mt-1">All other 63 districts</span>
                    </div>
                    <div className="pt-3">
                      {isFreeShipping ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs line-through text-zinc-400">৳{outsideDhakaFee}</span>
                          <span style={{ color: accentColor }} className="text-xs font-bold">FREE</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-zinc-950">৳{outsideDhakaFee}</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* SECTION 4: Payment Method */}
              <div className="space-y-4">
                <div className="border-b border-zinc-200/80 pb-2">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-950">
                    4. Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* COD Option */}
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border rounded-lg cursor-pointer transition block ${
                      paymentMethod === 'COD'
                        ? 'border-zinc-950 bg-zinc-50/50 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="w-4 h-4 text-zinc-950"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        Pay upon receipt
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 pl-6">
                      Pay with cash directly to the courier delivery agent upon package arrival at your door.
                    </p>
                  </label>

                  {/* Manual bKash Option */}
                  <label
                    onClick={() => setPaymentMethod('MANUAL_BKASH')}
                    className={`p-4 border rounded-lg cursor-pointer transition block ${
                      paymentMethod === 'MANUAL_BKASH'
                        ? 'border-zinc-950 bg-zinc-50/50 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'MANUAL_BKASH'}
                          onChange={() => setPaymentMethod('MANUAL_BKASH')}
                          className="w-4 h-4 text-zinc-950"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                          bKash Send Money / Merchant
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                        Fast Verification
                      </span>
                    </div>

                    {paymentMethod === 'MANUAL_BKASH' && (
                      <div className="mt-3.5 pl-6 space-y-3 pt-3 border-t border-zinc-200 text-xs">
                        <div className="p-3 bg-white border border-zinc-200 rounded flex items-center justify-between">
                          <div>
                            <span className="text-zinc-400 uppercase text-[10px] font-semibold block">
                              bKash Number
                            </span>
                            <span className="font-mono font-bold text-zinc-900 text-sm">
                              {manualBkashNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={copyBkashNumber}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 rounded hover:border-zinc-950 text-xs font-semibold cursor-pointer"
                          >
                            {copiedPhone ? (
                              <>
                                <Check style={{ color: accentColor }} className="w-3.5 h-3.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Copy Number</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-700 mb-1">
                            10-Character Transaction ID (TrxID) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. BL9A7X92Q"
                            value={customerForm.trxId}
                            onChange={(e) =>
                              setCustomerForm((p) => ({
                                ...p,
                                trxId: e.target.value.toUpperCase(),
                              }))
                            }
                            className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded font-mono text-xs uppercase focus:outline-none focus:border-zinc-950 transition"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Complete Order CTA (DESKTOP ONLY: Shown below payment on large screens) */}
              <div className="hidden lg:block pt-4">
                <button
                  type="submit"
                  form="main-checkout-form"
                  disabled={isSubmitting}
                  style={{ backgroundColor: accentColor }}
                  className="w-full py-4 px-6 text-white text-xs font-bold uppercase tracking-[0.2em] rounded transition hover:opacity-95 active:scale-[0.98] duration-75 disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Confirming Consignment...</span>
                    </>
                  ) : (
                    <>
                      <span>COMPLETE ORDER • ৳{grandTotal.toLocaleString()}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-zinc-400 text-center mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck style={{ color: accentColor }} className="w-3.5 h-3.5" />
                  <span>By placing your order, you agree to our 3-Day Return & Replacement Policy</span>
                </p>
              </div>
            </form>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Sticky Order Summary (5 Columns)
             ========================================================= */}
          <div className="lg:col-span-5 bg-zinc-50/80 p-5 sm:p-8 rounded-xl border border-zinc-200/90 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.length === 1 ? 'Item' : 'Items'})
              </h3>
              {/* 1-Click Access to Bag / Cart Drawer */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold underline underline-offset-4 cursor-pointer transition active:scale-[0.98] duration-75"
              >
                Edit Bag
              </button>
            </div>

            {/* Line Items List with Image 2 Thumbnail Bubble Badge */}
            <div className="divide-y divide-zinc-200/70 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => {
                const itemKey = getCartItemKey(item);
                return (
                  <div key={itemKey} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                    {/* Thumbnail with Quantity Badge on Top-Right */}
                    <div className="relative w-14 h-18 bg-white rounded border border-zinc-200 overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-[10px] text-zinc-400">
                          Garment
                        </div>
                      )}
                      <span
                        style={{ backgroundColor: accentColor }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-xs"
                      >
                        {item.quantity}
                      </span>
                    </div>

                    {/* Title & Variant Details */}
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-semibold text-zinc-900 truncate">
                        {item.title}
                      </h4>
                      {item.variantLabel && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                          {item.variantLabel}
                        </p>
                      )}
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Qty: {item.quantity} × ৳{item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Item Total */}
                    <div className="text-right text-xs font-bold text-zinc-950 font-mono">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Discount / Coupon Box */}
            <div className="pt-2 border-t border-zinc-200">
              {appliedCoupon ? (
                <div
                  style={{ backgroundColor: `${accentColor}12`, borderColor: `${accentColor}30` }}
                  className="flex items-center justify-between p-2.5 border text-xs rounded text-zinc-900"
                >
                  <div className="flex items-center gap-2">
                    <Tag style={{ color: accentColor }} className="w-3.5 h-3.5" />
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span className="text-zinc-600 font-medium">(-৳{appliedCoupon.discountAmount.toLocaleString()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code / Promo"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded font-mono text-xs uppercase focus:outline-none focus:border-zinc-950 transition"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    className="px-4 py-2 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Financials Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-zinc-200">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 font-mono">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between font-medium" style={{ color: accentColor }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Shipping ({deliveryZone === 'INSIDE_DHAKA' ? 'Inside Dhaka' : deliveryZone === 'DHAKA_SUBURBS' ? 'Suburbs' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-zinc-900 font-mono">
                  {isFreeShipping ? (
                    <span style={{ color: accentColor }} className="font-bold">FREE</span>
                  ) : (
                    `৳${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-sm font-bold text-zinc-950 pt-3 border-t border-zinc-200">
                <span className="text-sm uppercase tracking-wider">Total Payable</span>
                <div className="text-right">
                  <span className="text-lg font-black text-zinc-950 font-mono">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-normal text-zinc-400">
                    Including BDT VAT & Logistics
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Order CTA (MOBILE ONLY: Placed EKDOM LAST E after order summary and totals) */}
            <div className="lg:hidden block pt-3 border-t border-zinc-200">
              <button
                type="submit"
                form="main-checkout-form"
                disabled={isSubmitting}
                style={{ backgroundColor: accentColor }}
                className="w-full py-4 px-6 text-white text-xs font-bold uppercase tracking-[0.2em] rounded transition hover:opacity-95 active:scale-[0.98] duration-75 disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Confirming Consignment...</span>
                  </>
                ) : (
                  <>
                    <span>COMPLETE ORDER • ৳{grandTotal.toLocaleString()}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-400 text-center mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck style={{ color: accentColor }} className="w-3.5 h-3.5" />
                <span>By placing your order, you agree to our 3-Day Return & Replacement Policy</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
