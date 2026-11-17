'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Copy,
  Tag,
  AlertCircle,
  ArrowRight,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart, getCartItemKey } from '@/context/CartContext';
import { getSafeImageUrl } from '@/lib/utils';

interface CartDrawerProps {
  insideDhakaFee?: number;
  dhakaSuburbsFee?: number;
  outsideDhakaFee?: number;
  freeShippingThreshold?: number;
  manualBkashNumber?: string;
  accentColor?: string;
  smartCheckoutEnabled?: boolean;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountType?: string;
  discountValue?: number;
}

export default function CartDrawer({
  insideDhakaFee = 70,
  dhakaSuburbsFee = 100,
  outsideDhakaFee = 130,
  freeShippingThreshold = 2500,
  manualBkashNumber = '01700000000',
  accentColor = '#B8860B',
  smartCheckoutEnabled = true,
}: CartDrawerProps) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal } =
    useCart();

  const [deliveryZone, setDeliveryZone] = useState<'INSIDE_DHAKA' | 'DHAKA_SUBURBS' | 'OUTSIDE_DHAKA'>(
    'INSIDE_DHAKA'
  );
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MANUAL_BKASH'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    consignmentId: string;
    total: number;
    zone: string;
    eta: string;
  } | null>(null);

  const [copiedPhone, setCopiedPhone] = useState(false);

  // Recipient form state (used for smartCheckoutEnabled = true mode)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    trxId: '',
  });

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

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

  // Silent lead capture when user completes 11-digit mobile number
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
        // Silent catch for background lead tracking
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
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
        });
        setCouponCodeInput('');
      } else {
        setCouponError(data.error || data.data?.message || 'Invalid or expired promo code');
      }
    } catch {
      setCouponError('Network error validating coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // In-Drawer Place order (for smartCheckoutEnabled = true mode)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerForm.name.trim() || !customerForm.phone.trim() || !customerForm.address.trim()) {
      alert('Please enter your Name, 11-Digit Mobile Number, and Full Delivery Address.');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(customerForm.phone.trim())) {
      alert('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (paymentMethod === 'MANUAL_BKASH' && !customerForm.trxId.trim()) {
      alert('Please enter your bKash Transaction ID (TrxID).');
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
            deliveryZone,
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
        const zoneLabel =
          deliveryZone === 'INSIDE_DHAKA'
            ? 'Inside Dhaka'
            : deliveryZone === 'DHAKA_SUBURBS'
            ? 'Dhaka Suburbs'
            : 'Outside Dhaka';

        const eta =
          deliveryZone === 'INSIDE_DHAKA'
            ? '24-48 Hours'
            : deliveryZone === 'DHAKA_SUBURBS'
            ? '2-3 Days'
            : '3-5 Days';

        setOrderSuccess({
          orderId: data.data.orderNumber,
          consignmentId: data.data.consignmentId || 'Generated on Pickup',
          total: data.data.totalAmount,
          zone: zoneLabel,
          eta,
        });

        clearCart();
      } else {
        alert(data.error || 'Failed to place order. Please try again.');
      }
    } catch {
      alert('An error occurred. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-Over Panel */}
      <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-950">
                Your Shopping Bag
              </h2>
              <span className="text-xs text-zinc-500 font-semibold">
                ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-950 transition cursor-pointer"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {orderSuccess ? (
              /* Success Screen */
              <div className="py-8 text-center space-y-4">
                <div
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                >
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-widest text-zinc-950">
                  Consignment Booked!
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Thank you! Your order has been placed into our vault for verification and courier dispatch.
                </p>

                <div className="p-4 bg-zinc-50 border border-zinc-200 text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Order ID:</span>
                    <span className="font-bold text-zinc-950">{orderSuccess.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Consignment:</span>
                    <span className="text-zinc-900">{orderSuccess.consignmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Delivery Zone:</span>
                    <span className="text-zinc-900">{orderSuccess.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Estimated Delivery:</span>
                    <span className="text-zinc-900 font-sans">{orderSuccess.eta}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-950">
                    <span>Payable (COD):</span>
                    <span>৳{orderSuccess.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href={`/track-order?orderNumber=${encodeURIComponent(orderSuccess.orderId)}`}
                    onClick={() => {
                      setIsCartOpen(false);
                      setOrderSuccess(null);
                    }}
                    style={{ backgroundColor: accentColor }}
                    className="w-full py-3 text-white text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Track Live Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setOrderSuccess(null);
                    }}
                    className="w-full py-2.5 bg-zinc-100 text-zinc-800 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-zinc-200 transition"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              /* Empty Bag */
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs text-zinc-400">Your shopping bag is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ backgroundColor: accentColor }}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white mt-2 cursor-pointer hover:opacity-90 transition active:scale-[0.98] duration-75"
                >
                  Discover Collection
                </button>
              </div>
            ) : (
              <>
                {/* Free Shipping Progress Meter (Image 1 Style) */}
                {freeShippingThreshold > 0 && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200/90 rounded text-xs">
                    {subtotal >= freeShippingThreshold ? (
                      <div style={{ color: accentColor }} className="flex items-center gap-2 font-semibold">
                        <Truck style={{ color: accentColor }} className="w-4 h-4 shrink-0" />
                        <span>You unlocked FREE Express Delivery!</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Truck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>
                              Add <strong className="text-zinc-950 font-bold">৳{(freeShippingThreshold - subtotal).toLocaleString()}</strong> for Free Delivery
                            </span>
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {Math.round((subtotal / freeShippingThreshold) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            style={{
                              backgroundColor: accentColor,
                              width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                            }}
                            className="h-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Line Items List */}
                <div className="divide-y divide-zinc-200">
                  {cart.map((item) => {
                    const itemKey = getCartItemKey(item);
                    return (
                      <div
                        key={itemKey}
                        className="py-3.5 flex items-center gap-3.5"
                      >
                        <img
                          src={getSafeImageUrl(item.image)}
                          alt={item.title}
                          className="w-16 h-20 object-cover bg-zinc-100 shrink-0 border border-zinc-100 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {item.title}
                          </h4>
                          {(item.variantLabel || item.size) && (
                            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                              {item.variantLabel || `Size: ${item.size}`}
                            </p>
                          )}
                          <p className="text-xs font-mono font-bold text-zinc-950 mt-1">
                            {item.price.toLocaleString()}৳
                          </p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.variantId || item.size || '')}
                            className="text-[10px] text-zinc-400 hover:text-red-600 underline cursor-pointer mt-1 block transition active:scale-[0.98]"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center border border-zinc-200 rounded shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.variantId || item.size || '', -1)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 active:bg-zinc-200 active:scale-90 transition duration-75 cursor-pointer touch-manipulation select-none"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.variantId || item.size || '', 1)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 active:bg-zinc-200 active:scale-90 transition duration-75 cursor-pointer touch-manipulation select-none"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* In-Drawer Quick Checkout Form (ONLY rendered when smartCheckoutEnabled === true) */}
                {smartCheckoutEnabled && (
                  <div className="space-y-4 pt-2 border-t border-zinc-200">
                    {/* 3-Zone Delivery Area Selector */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Select Delivery Zone
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryZone('INSIDE_DHAKA')}
                          className={`p-2.5 border text-left text-xs cursor-pointer transition active:scale-[0.98] active:bg-zinc-100 touch-manipulation select-none ${
                            deliveryZone === 'INSIDE_DHAKA'
                              ? 'border-zinc-950 bg-zinc-50 font-bold'
                              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                          }`}
                        >
                          <span className="block font-semibold">Inside Dhaka</span>
                          <span className="block text-[11px] font-bold text-zinc-900 mt-0.5">৳{insideDhakaFee}</span>
                          <span className="block text-[9px] text-zinc-400 font-normal">24-48 Hours</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryZone('DHAKA_SUBURBS')}
                          className={`p-2.5 border text-left text-xs cursor-pointer transition active:scale-[0.98] active:bg-zinc-100 touch-manipulation select-none ${
                            deliveryZone === 'DHAKA_SUBURBS'
                              ? 'border-zinc-950 bg-zinc-50 font-bold'
                              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                          }`}
                        >
                          <span className="block font-semibold">Suburbs</span>
                          <span className="block text-[11px] font-bold text-zinc-900 mt-0.5">৳{dhakaSuburbsFee}</span>
                          <span className="block text-[9px] text-zinc-400 font-normal">2-3 Days</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryZone('OUTSIDE_DHAKA')}
                          className={`p-2.5 border text-left text-xs cursor-pointer transition active:scale-[0.98] active:bg-zinc-100 touch-manipulation select-none ${
                            deliveryZone === 'OUTSIDE_DHAKA'
                              ? 'border-zinc-950 bg-zinc-50 font-bold'
                              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                          }`}
                        >
                          <span className="block font-semibold">Outside Dhaka</span>
                          <span className="block text-[11px] font-bold text-zinc-900 mt-0.5">৳{outsideDhakaFee}</span>
                          <span className="block text-[9px] text-zinc-400 font-normal">3-5 Days</span>
                        </button>
                      </div>
                    </div>

                    {/* Coupon / Promo Code Box */}
                    <div className="space-y-2 pt-1 border-t border-zinc-100">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Promo / Coupon Code
                      </label>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="font-mono font-bold">{appliedCoupon.code}</span>
                            <span>(-৳{appliedCoupon.discountAmount.toLocaleString()})</span>
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
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 border border-zinc-300 font-mono text-xs uppercase focus:outline-none focus:border-zinc-950"
                          />
                          <button
                            type="button"
                            disabled={isApplyingCoupon || !couponCodeInput.trim()}
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
                          >
                            {isApplyingCoupon ? 'Verifying...' : 'Apply'}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{couponError}</span>
                        </p>
                      )}
                    </div>

                    {/* 3-Field Guest Recipient Details */}
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-2.5 pt-1 border-t border-zinc-100">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        Recipient Details (3-Field Guest Checkout)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={customerForm.name}
                        onChange={(e) =>
                          setCustomerForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900 bg-white"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="11-Digit Mobile (017XXXXXXXX)"
                        value={customerForm.phone}
                        onBlur={handlePhoneBlur}
                        onChange={(e) =>
                          setCustomerForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900 bg-white"
                      />
                      <textarea
                        rows={2}
                        required
                        placeholder="Delivery Address (House, Road, Area, City)"
                        value={customerForm.address}
                        onChange={(e) =>
                          setCustomerForm((p) => ({ ...p, address: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900 bg-white"
                      />

                      {/* Payment Method Selector */}
                      <div className="space-y-2 pt-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('COD')}
                            className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer transition active:scale-[0.98] active:brightness-95 touch-manipulation select-none ${
                              paymentMethod === 'COD'
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 active:bg-zinc-100'
                            }`}
                          >
                            Cash on Delivery
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('MANUAL_BKASH')}
                            className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer transition active:scale-[0.98] active:brightness-95 touch-manipulation select-none ${
                              paymentMethod === 'MANUAL_BKASH'
                                ? 'border-pink-600 bg-pink-600 text-white'
                                : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 active:bg-zinc-100'
                            }`}
                          >
                            bKash Send Money
                          </button>
                        </div>

                        {paymentMethod === 'MANUAL_BKASH' && (
                          <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500">bKash Personal/Merchant:</span>
                              <button
                                type="button"
                                onClick={copyBkashNumber}
                                className="inline-flex items-center gap-1 font-mono font-bold text-zinc-900 cursor-pointer active:scale-95 active:bg-zinc-200 px-2 py-1 rounded transition duration-75 touch-manipulation select-none"
                              >
                                <span>{manualBkashNumber}</span>
                                {copiedPhone ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                )}
                              </button>
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Enter 10-character TrxID (e.g. BL9A7X92Q)"
                              value={customerForm.trxId}
                              onChange={(e) =>
                                setCustomerForm((p) => ({
                                  ...p,
                                  trxId: e.target.value.toUpperCase(),
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-zinc-300 font-mono text-xs uppercase focus:outline-none focus:border-zinc-900"
                            />
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          {!orderSuccess && cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 space-y-3 pb-6 sm:pb-5">
              {smartCheckoutEnabled ? (
                /* Mode 1: Fast In-Drawer Checkout Footer */
                <>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span>{subtotal.toLocaleString()}৳</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-500">
                      <span>Delivery ({deliveryZone === 'INSIDE_DHAKA' ? 'Inside' : deliveryZone === 'DHAKA_SUBURBS' ? 'Suburbs' : 'Outside'})</span>
                      <span>{isFreeShipping ? 'FREE' : `${deliveryFee}৳`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                      <span>Total Payable</span>
                      <span>{grandTotal.toLocaleString()}৳</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    style={{ backgroundColor: accentColor }}
                    className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white cursor-pointer hover:opacity-95 active:scale-[0.97] active:brightness-90 transition duration-75 disabled:opacity-50 touch-manipulation select-none shadow-md"
                  >
                    {isSubmitting
                      ? 'PLACING ORDER...'
                      : `CONFIRM ORDER • ${grandTotal.toLocaleString()}৳`}
                  </button>
                </>
              ) : (
                /* Mode 2: Dedicated /checkout Page Gateway (Image 1 & 2 Style) */
                <>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-700 font-medium">
                      <span>Subtotal</span>
                      <span className="font-bold text-zinc-950 font-mono text-sm">
                        ৳{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Delivery fees and promo discounts calculated at checkout
                    </p>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    style={{ backgroundColor: accentColor }}
                    className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white cursor-pointer hover:opacity-95 active:scale-[0.97] active:brightness-90 transition duration-75 flex items-center justify-center gap-2 shadow-xs text-center touch-manipulation select-none"
                  >
                    <span>CONTINUE TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 active:text-zinc-950 active:bg-zinc-100 transition duration-75 py-2 rounded cursor-pointer uppercase tracking-wider touch-manipulation select-none"
                  >
                    Continue Shopping
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
