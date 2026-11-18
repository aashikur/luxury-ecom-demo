import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import TrackOrderView from '@/components/storefront/TrackOrderView';
import { getPublicStoreConfig } from '@/services/config.service';
import { Loader, Truck } from 'lucide-react';

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
    <div className="flex items-center justify-center h-screen">
      <Loader className="animate-spin h-8 w-8 text-gray-500" />
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
