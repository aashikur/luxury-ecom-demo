'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, CheckCircle, Truck, Copy } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  insideDhakaFee?: number;
  outsideDhakaFee?: number;
  freeShippingThreshold?: number;
  manualBkashNumber?: string;
  accentColor?: string;
}

export default function CartDrawer({
  insideDhakaFee = 70,
  outsideDhakaFee = 130,
  freeShippingThreshold = 2500,
  manualBkashNumber = '01700000000',
  accentColor = '#B8860B',
}: CartDrawerProps) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal } =
    useCart();

  const [deliveryZone, setDeliveryZone] = useState<'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'>(
    'INSIDE_DHAKA'
  );
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MANUAL_BKASH'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    consignmentId: string;
    totalAmount: number;
  } | null>(null);

  const [copiedPhone, setCopiedPhone] = useState(false);

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    trxId: '',
  });

  const isFreeShipping = subtotal >= freeShippingThreshold && subtotal > 0;
  const deliveryFee = cart.length === 0 || isFreeShipping ? 0 : deliveryZone === 'INSIDE_DHAKA' ? insideDhakaFee : outsideDhakaFee;
  const grandTotal = subtotal + deliveryFee;

  const copyBkashNumber = () => {
    navigator.clipboard.writeText(manualBkashNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      alert('Please fill in your Name, 11-Digit BD Phone, and Address.');
      return;
    }

    if (paymentMethod === 'MANUAL_BKASH' && !customer.trxId.trim()) {
      alert('Please enter the bKash Transaction ID (TrxID) after sending money.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            deliveryZone,
          },
          items: cart.map((item) => ({
            productId: item.productId,
            title: item.title,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          paymentMethod,
          trxId: customer.trxId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderSuccess({
          orderNumber: data.data.orderNumber,
          consignmentId: data.data.courier?.consignmentId || 'SF-PENDING',
          totalAmount: data.data.financials.totalAmount,
        });
        clearCart();
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-900">
                YOUR SHOPPING BAG ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {orderSuccess ? (
              /* Success View */
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-zinc-900">
                  Order Confirmed!
                </h3>
                <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                  Thank you, <strong>{customer.name}</strong>. Your order has been placed. Our team
                  will call you to verify dispatch.
                </p>

                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-sm text-left text-xs space-y-2 mt-6">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Invoice:</span>
                    <strong className="text-zinc-900">{orderSuccess.orderNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Courier Tracking:</span>
                    <span className="text-zinc-700">{orderSuccess.consignmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Due (COD):</span>
                    <strong style={{ color: accentColor }}>
                      {orderSuccess.totalAmount.toLocaleString()}৳
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest mt-6"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* Empty View */
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
                <p className="text-sm text-zinc-500">Your bag is empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ backgroundColor: accentColor }}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white mt-4"
                >
                  DISCOVER PRODUCTS
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="divide-y divide-zinc-200">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="py-4 flex gap-4">
                      <div className="relative w-16 aspect-[3/4] bg-zinc-100 shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-zinc-900 truncate">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.productId, item.size)}
                              className="text-zinc-400 hover:text-red-600 transition text-xs p-1"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500">Size: {item.size}</p>
                          <p className="text-xs font-semibold text-zinc-900 mt-1">
                            {item.price.toLocaleString()}৳
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, -1)}
                            className="w-6 h-6 border border-zinc-300 flex items-center justify-center text-xs hover:border-zinc-950"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, 1)}
                            className="w-6 h-6 border border-zinc-300 flex items-center justify-center text-xs hover:border-zinc-950"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Zone Toggle */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
                    DELIVERY ZONE (BANGLADESH)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('INSIDE_DHAKA')}
                      className={`py-2 px-3 text-xs font-semibold border text-center transition ${
                        deliveryZone === 'INSIDE_DHAKA'
                          ? 'border-zinc-950 bg-white shadow-xs text-zinc-950 font-bold'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      Inside Dhaka (৳{insideDhakaFee})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('OUTSIDE_DHAKA')}
                      className={`py-2 px-3 text-xs font-semibold border text-center transition ${
                        deliveryZone === 'OUTSIDE_DHAKA'
                          ? 'border-zinc-950 bg-white shadow-xs text-zinc-950 font-bold'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      Outside Dhaka (৳{outsideDhakaFee})
                    </button>
                  </div>
                  {isFreeShipping && (
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      Free Delivery Unlocked (Order over ৳{freeShippingThreshold.toLocaleString()})
                    </p>
                  )}
                </div>

                {/* 1-Page COD Checkout Form */}
                <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
                    SHIPPING DETAILS
                  </span>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full text-xs p-3 border border-zinc-300 focus:outline-none focus:border-zinc-900 bg-white"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="11-Digit BD Phone (e.g. 01700000000) *"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full text-xs p-3 border border-zinc-300 focus:outline-none focus:border-zinc-900 bg-white"
                    />
                  </div>

                  <div>
                    <textarea
                      required
                      rows={2}
                      placeholder="Full Delivery Address (House, Road, Area, District) *"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full text-xs p-3 border border-zinc-300 focus:outline-none focus:border-zinc-900 bg-white"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-2">
                      PAYMENT METHOD
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`py-2 px-3 text-xs font-semibold border text-center transition ${
                          paymentMethod === 'COD'
                            ? 'border-zinc-950 bg-white shadow-xs text-zinc-950 font-bold'
                            : 'border-zinc-200 text-zinc-500'
                        }`}
                      >
                        Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MANUAL_BKASH')}
                        className={`py-2 px-3 text-xs font-semibold border text-center transition ${
                          paymentMethod === 'MANUAL_BKASH'
                            ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold'
                            : 'border-zinc-200 text-zinc-500'
                        }`}
                      >
                        bKash Send Money
                      </button>
                    </div>

                    {paymentMethod === 'MANUAL_BKASH' && (
                      <div className="mt-3 p-3 bg-pink-50 border border-pink-200 text-xs text-pink-900 space-y-2">
                        <div className="flex justify-between items-center">
                          <span>
                            Send Money to: <strong>{manualBkashNumber}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={copyBkashNumber}
                            className="p-1 text-pink-700 hover:text-pink-950"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {copiedPhone && <p className="text-[10px] text-pink-700">Copied to clipboard!</p>}
                        <input
                          type="text"
                          required
                          placeholder="Enter bKash TrxID (e.g. BL9A7X92Q) *"
                          value={customer.trxId}
                          onChange={(e) => setCustomer({ ...customer, trxId: e.target.value })}
                          className="w-full text-xs p-2.5 border border-pink-300 bg-white text-zinc-900 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Drawer Footer (Price Breakdown & Confirm Button) */}
          {cart.length > 0 && !orderSuccess && (
            <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString()}৳</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery Fee:</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `${deliveryFee}৳`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Total Amount:</span>
                  <span style={{ color: accentColor }}>{grandTotal.toLocaleString()}৳</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                style={{ backgroundColor: accentColor }}
                className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'PLACING ORDER...' : 'CONFIRM ORDER (CASH ON DELIVERY)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
