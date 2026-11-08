'use client';

import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Check, Copy } from 'lucide-react';
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
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, clearCart, subtotal } =
    useCart();

  const [deliveryZone, setDeliveryZone] = useState<'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'>(
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

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    trxId: '',
  });

  const isFreeShipping = subtotal >= freeShippingThreshold && subtotal > 0;
  const deliveryFee =
    cart.length === 0 || isFreeShipping
      ? 0
      : deliveryZone === 'INSIDE_DHAKA'
      ? insideDhakaFee
      : outsideDhakaFee;
  const grandTotal = Math.max(0, subtotal + deliveryFee);

  const copyBkashNumber = () => {
    navigator.clipboard?.writeText(manualBkashNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerForm.name.trim() || !customerForm.phone.trim() || !customerForm.address.trim()) {
      alert('Please enter your Name, Phone Number, and Delivery Address.');
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
            title: item.title,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          paymentMethod,
          trxId: customerForm.trxId.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderSuccess({
          orderId: data.data.orderNumber,
          consignmentId: data.data.courier?.consignmentId || 'SF-PENDING',
          total: data.data.financials.totalAmount,
          zone: deliveryZone === 'INSIDE_DHAKA' ? 'Inside Dhaka' : 'Outside Dhaka',
          eta: deliveryZone === 'INSIDE_DHAKA' ? '24-48 Hours' : '3-5 Days',
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white text-zinc-900 h-full flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-950">
              Shopping Bag & Checkout
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Free Shipping over ৳{freeShippingThreshold.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderSuccess(null);
            }}
            className="p-2 text-zinc-400 hover:text-zinc-900 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {orderSuccess ? (
            /* Order Confirmed View */
            <div className="p-6 border border-zinc-200 bg-zinc-50 text-center space-y-4">
              <div
                style={{ backgroundColor: accentColor }}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center mx-auto"
              >
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold uppercase text-zinc-950">Order Confirmed</h3>
              <div className="text-xs space-y-2 text-left bg-white p-4 border border-zinc-200">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order ID:</span>
                  <span className="font-bold text-zinc-900">{orderSuccess.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Steadfast ID:</span>
                  <span className="font-mono text-zinc-800">{orderSuccess.consignmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery Zone:</span>
                  <span className="text-zinc-800">
                    {orderSuccess.zone} ({orderSuccess.eta})
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-100">
                  <span className="text-zinc-500">Total Payable:</span>
                  <span className="font-bold text-zinc-950">
                    ৳{orderSuccess.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setIsCartOpen(false);
                }}
                className="w-full py-3 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-zinc-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Bag */
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs text-zinc-400">Your shopping bag is currently empty.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ backgroundColor: accentColor }}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white mt-2 cursor-pointer hover:opacity-90 transition"
              >
                Discover Collection
              </button>
            </div>
          ) : (
            <>
              {/* Line Items */}
              <div className="divide-y divide-zinc-200">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="py-3.5 flex items-center gap-3.5"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 object-cover bg-zinc-100 shrink-0 border border-zinc-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Size: {item.size}</p>
                      <p
                        style={{ color: accentColor }}
                        className="text-xs font-bold mt-1"
                      >
                        {(item.price * item.quantity).toLocaleString()}৳
                      </p>
                    </div>
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-zinc-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, -1)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, 1)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Zone Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Delivery Area
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('INSIDE_DHAKA')}
                    className={`p-3 border text-left text-xs cursor-pointer transition ${
                      deliveryZone === 'INSIDE_DHAKA'
                        ? 'border-zinc-950 bg-zinc-50 font-bold'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>Inside Dhaka</span>
                      <span>৳{insideDhakaFee}</span>
                    </div>
                    <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                      24-48 Hours
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryZone('OUTSIDE_DHAKA')}
                    className={`p-3 border text-left text-xs cursor-pointer transition ${
                      deliveryZone === 'OUTSIDE_DHAKA'
                        ? 'border-zinc-950 bg-zinc-50 font-bold'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>Outside Dhaka</span>
                      <span>৳{outsideDhakaFee}</span>
                    </div>
                    <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                      3-5 Days
                    </span>
                  </button>
                </div>
              </div>

              {/* Recipient Details */}
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-2.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Recipient Details
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
                  placeholder="Phone Number (017XXXXXXXX)"
                  value={customerForm.phone}
                  onChange={(e) =>
                    setCustomerForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900 bg-white"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Full Delivery Address"
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
                      className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer transition ${
                        paymentMethod === 'COD'
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      Cash on Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('MANUAL_BKASH')}
                      className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer transition ${
                        paymentMethod === 'MANUAL_BKASH'
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      bKash Send Money
                    </button>
                  </div>

                  {paymentMethod === 'MANUAL_BKASH' && (
                    <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Send Money Number:</span>
                        <button
                          type="button"
                          onClick={copyBkashNumber}
                          className="inline-flex items-center gap-1 font-mono font-bold text-zinc-900 cursor-pointer"
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
                        placeholder="Enter TrxID (e.g. BL9A7X92Q)"
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
            </>
          )}
        </div>

        {/* Footer Totals & Action */}
        {!orderSuccess && cart.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()}৳</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Delivery</span>
                <span>{isFreeShipping ? 'FREE' : `${deliveryFee}৳`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                <span>Total</span>
                <span>{grandTotal.toLocaleString()}৳</span>
              </div>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              style={{ backgroundColor: accentColor }}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white cursor-pointer hover:opacity-95 transition disabled:opacity-50"
            >
              {isSubmitting
                ? 'PLACING ORDER...'
                : `CONFIRM ORDER • ${grandTotal.toLocaleString()}৳`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
