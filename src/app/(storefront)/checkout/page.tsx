import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import CheckoutClientView from '@/components/storefront/checkout/CheckoutClientView';
import { getPublicStoreConfig } from '@/services/config.service';
import { ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Secure Checkout | Luxury Garments & Streetwear',
  description:
    'Complete your order with 11-digit Bangladeshi mobile number, nationwide 3-zone delivery, and Cash on Delivery or bKash.',
  robots: {
    index: false,
    follow: false,
  },
};

function CheckoutFallback() {
  return (
    <div className="min-h-screen bg-white py-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-base font-bold uppercase tracking-wider text-zinc-900">
          Initializing Secure Checkout...
        </h2>
        <p className="text-xs text-zinc-400">
          Loading 3-zone logistics and courier delivery tariffs
        </p>
      </div>
    </div>
  );
}

export default async function CheckoutPage() {
  const config = await getPublicStoreConfig();
  const branding = config?.branding;
  const accentColor = branding?.colors?.accent || '#B8860B';
  const storeName = branding?.storeName || 'Aurem Luxury';

  const logistics = {
    freeShippingThreshold: config?.logistics?.freeShippingThreshold ?? 2500,
    supportPhone: config?.logistics?.supportPhone || '+880 1823-392110',
    insideDhakaFee: config?.logistics?.insideDhakaFee ?? 70,
    dhakaSuburbsFee: config?.logistics?.suburbsDhakaFee ?? 100,
    outsideDhakaFee: config?.logistics?.outsideDhakaFee ?? 130,
  };

  const manualBkashNumber =
    config?.payment?.manualBkash?.walletNumber || logistics.supportPhone;

  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutClientView
        storeName={storeName}
        accentColor={accentColor}
        insideDhakaFee={logistics.insideDhakaFee}
        dhakaSuburbsFee={logistics.dhakaSuburbsFee}
        outsideDhakaFee={logistics.outsideDhakaFee}
        freeShippingThreshold={logistics.freeShippingThreshold}
        manualBkashNumber={manualBkashNumber}
        supportPhone={logistics.supportPhone}
      />
    </Suspense>
  );
}
