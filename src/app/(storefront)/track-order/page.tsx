import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import TrackOrderView from '@/components/storefront/TrackOrderView';
import { Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Track Order | Live Parcel Dispatch Status',
  description:
    'Track your luxury garment consignment dispatch status, Steadfast courier tracking code, and real-time delivery progression across Bangladesh.',
  alternates: {
    canonical: '/track-order',
  },
  openGraph: {
    title: 'Track Order | Live Parcel Dispatch Status',
    description:
      'Track your luxury garment consignment dispatch status, Steadfast courier tracking code, and real-time delivery progression across Bangladesh.',
  },
};

function TrackOrderFallback() {
  return (
    <div className="min-h-[70vh] bg-[#fbfbfa] py-14 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#076E46]/10 text-[#076E46] flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-lg font-serif font-bold text-[#060d11]">
          Loading Parcel Tracking...
        </h2>
        <p className="text-xs text-slate-500">
          Connecting to Steadfast express courier network
        </p>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="w-full">
      <Suspense fallback={<TrackOrderFallback />}>
        <TrackOrderView />
      </Suspense>
    </main>
  );
}
