import React from 'react';
import { connectDB } from '@/lib/db';
import StoreConfig from '@/models/StoreConfig';
import SettingsFormClient from '@/components/admin/SettingsFormClient';

export const metadata = {
  title: 'Store Settings | Aurem Admin',
  description: 'Manage store branding, logistics, and payment methods',
};

export default async function SettingsPage() {
  await connectDB();

  const rawConfig = await StoreConfig.findOne({ isActive: true }).lean();

  if (!rawConfig) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No active configuration found in database.
      </div>
    );
  }

  const config = JSON.parse(JSON.stringify(rawConfig));

  return <SettingsFormClient initialConfig={config} />;
}
