import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import StoreConfig, { IStoreConfigDocument } from '@/models/StoreConfig';

/**
 * Triggers Dual Next.js Cache Invalidation for Store Configuration
 */
export function invalidateConfigCaches() {
  try {
    revalidateTag('store-config');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/admin/settings');
  } catch {
    // Non-request context safeguard
  }
}

/**
 * Internal un-cached fetcher for StoreConfig singleton
 */
async function fetchStoreConfigDocument(): Promise<IStoreConfigDocument | null> {
  await connectDB();
  const config = await StoreConfig.findOne({ isActive: true }).lean();
  if (!config) return null;
  return JSON.parse(JSON.stringify(config));
}

/**
 * High-Performance Public StoreConfig Fetcher
 * Cached via Next.js unstable_cache with tag ['store-config'] for sub-5ms SSR storefront rendering.
 * Sanitizes server secrets (strips API keys and gateway passwords).
 */
export const getPublicStoreConfig = unstable_cache(
  async () => {
    const raw = await fetchStoreConfigDocument();
    if (!raw) return null;

    // Sanitize sensitive secrets before delivering to public storefront
    const sanitized = {
      ...raw,
      courier: {
        provider: raw.courier?.provider || 'STEADFAST',
      },
      payment: {
        cashOnDelivery: raw.payment?.cashOnDelivery || { enabled: true },
        manualBkash: {
          enabled: raw.payment?.manualBkash?.enabled ?? true,
          walletNumber: raw.payment?.manualBkash?.walletNumber || '01700000000',
          walletType: raw.payment?.manualBkash?.walletType || 'MERCHANT',
        },
        sslCommerz: {
          enabled: raw.payment?.sslCommerz?.enabled ?? false,
          isSandbox: raw.payment?.sslCommerz?.isSandbox ?? true,
        },
      },
    };

    return sanitized;
  },
  ['public-store-config'],
  { tags: ['store-config'], revalidate: 3600 }
);

/**
 * Admin StoreConfig fetcher: force-dynamic, full credentials for dashboard settings editor.
 */
export async function getAdminStoreConfig(): Promise<IStoreConfigDocument | null> {
  return fetchStoreConfigDocument();
}

/**
 * Updates StoreConfig singleton with validation and dual cache invalidation.
 */
export async function updateStoreConfig(
  dto: Partial<IStoreConfigDocument>,
  actor: string = 'ADMIN'
): Promise<IStoreConfigDocument> {
  await connectDB();

  const updated = await StoreConfig.findOneAndUpdate(
    { isActive: true },
    { $set: { ...dto, updatedBy: actor } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  invalidateConfigCaches();
  return JSON.parse(JSON.stringify(updated));
}
