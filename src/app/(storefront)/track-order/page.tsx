import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import TrackOrderView from '@/components/storefront/TrackOrderView';
import { getPublicStoreConfig } from '@/services/config.service';
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

function TrackOrderFallback({ accentColor = '#076E46' }: { accentColor?: string }) {
  return (
    <div className="min-h-[75vh] bg-white py-14 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-4">
        <div
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
        >
          <Truck className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tight text-zinc-950">
          Loading Parcel Tracking...
        </h2>
        <p className="text-xs text-zinc-500">
          Connecting to Steadfast express courier network
        </p>
      </div>
    </div>
  );
}

export default async function TrackOrderPage() {
  const config = await getPublicStoreConfig();
  const branding = config?.branding;
  const accentColor = branding?.colors?.accent || '#076E46';
  const storeName = branding?.storeName || 'Aurem Luxury';
  const supportPhone = config?.logistics?.supportPhone || '+880 1823-392110';

  return (
    <main className="w-full bg-white">
      <Suspense fallback={<TrackOrderFallback accentColor={accentColor} />}>
        <TrackOrderView
          accentColor={accentColor}
          storeName={storeName}
          supportPhone={supportPhone}
        />
      </Suspense>
    </main>
  );
}
