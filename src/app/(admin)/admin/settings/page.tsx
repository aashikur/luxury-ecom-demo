import React from 'react';
import { connectDB } from '@/lib/db';
import StoreConfig from '@/models/StoreConfig';
import Category from '@/models/Category';
import Collection from '@/models/Collection';
import Brand from '@/models/Brand';
import { getDefaultStoreConfig } from '@/services/config.service';
import SettingsFormClient from '@/components/admin/SettingsFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Store Settings | Aurem Admin',
  description: 'Manage store branding, logistics, and payment methods',
};

export default async function SettingsPage() {
  await connectDB();

  const [rawConfig, rawCategories, rawCollections, rawBrands] = await Promise.all([
    StoreConfig.findOne({ isActive: true }).lean(),
    Category.find({}).select('name slug parentId').lean(),
    Collection.find({}).select('title slug').lean(),
    Brand.find({}).select('name slug').lean(),
  ]);

  const fallback = getDefaultStoreConfig();
  const config = rawConfig
    ? { ...fallback, ...JSON.parse(JSON.stringify(rawConfig)) }
    : fallback;

  const categories = JSON.parse(JSON.stringify(rawCategories || []));
  const collections = JSON.parse(JSON.stringify(rawCollections || []));
  const brands = JSON.parse(JSON.stringify(rawBrands || []));

  return (
    <SettingsFormClient
      initialConfig={config}
      categories={categories}
      collections={collections}
      brands={brands}
    />
  );
}
