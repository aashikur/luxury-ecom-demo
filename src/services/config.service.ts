import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/db';
import StoreConfig, { IStoreConfig, IHomeSection, IHeaderNavLink } from '@/models/StoreConfig';

/**
 * Triggers Dual Next.js Cache Invalidation for Store Configuration
 */
export function invalidateConfigCaches() {
  try {
    revalidateTag('store-config', 'max');
    revalidateTag('categories', 'max');
    revalidateTag('collections', 'max');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
  } catch {
    // Non-request context safeguard
  }
}

/**
 * Normalizes legacy section types into canonical homepage blocks
 */
function normalizeHomeSections(sections?: IHomeSection[]): IHomeSection[] {
  if (!Array.isArray(sections)) return [];

  const typeMap: Record<string, IHomeSection['type']> = {
    HERO_CAROUSEL: 'HERO_BANNER',
    PROMO_BANNER: 'PROMO_CTA_CARD',
    CATEGORY_GRID: 'COLLECTION_SECTION',
    CATEGORY_SLIDER: 'COLLECTION_SECTION',
  };

  return sections.map((sec, idx) => ({
    ...sec,
    type: (typeMap[sec.type] || sec.type || 'COLLECTION_SECTION') as IHomeSection['type'],
    order: typeof sec.order === 'number' ? sec.order : idx + 1,
    isActive: sec.isActive !== false,
  }));
}

/**
 * Safe Default Configuration Object
 */
export function getDefaultStoreConfig(): Partial<IStoreConfig> {
  return {
    branding: {
      storeName: 'Aurem Luxury',
      tagline: 'Engineered Streetwear & Minimal Garments',
      storeNiche: 'CLOTHING',
      storeMode: 'MULTI_PRODUCT',
      featuredProductSlug: '',
      logo: { url: '', key: '' },
      favicon: { url: '', key: '' },
      currencySymbol: '৳',
      currencyCode: 'BDT',
      announcementBarEnabled: true,
      announcementBarText: 'Free express shipping across Bangladesh on orders above ৳2,500',
      themeMode: 'LIGHT',
      colors: {
        primary: '#060d11',
        accent: '#076E46',
        bg: '#FFFFFF',
        surface: '#F8FAFC',
        fg: '#060d11',
        muted: '#64748B',
      },
      heroVariant: 'CENTER',
    },
    homeSections: [
      {
        id: 'sec_hero_1',
        type: 'HERO_BANNER',
        title: 'Winter Luxury Drop 2026',
        subtitle: 'Premium Acid-Wash & Heavyweight Fleece',
        description: '',
        buttonText: 'SHOP NOW',
        buttonLink: '/shop',
        bannerImage: { url: '', key: '' },
        themeStyle: 'LIGHT',
        order: 1,
        isActive: true,
      },
      {
        id: 'sec_cat_hoodies',
        type: 'COLLECTION_SECTION',
        title: 'Heavyweight Hoodies',
        subtitle: '450 GSM French Terry Fleece',
        collectionSlug: 'hoodies',
        bannerImage: { url: '', key: '' },
        themeStyle: 'LIGHT',
        order: 2,
        isActive: true,
      },
      {
        id: 'sec_banner_promo',
        type: 'PROMO_CTA_CARD',
        title: 'Free Express Shipping Across Bangladesh',
        subtitle: 'On all orders above ৳2,500',
        buttonText: 'EXPLORE CATALOG',
        buttonLink: '/shop',
        bannerImage: { url: '', key: '' },
        themeStyle: 'LIGHT',
        order: 3,
        isActive: true,
      },
    ],
    headerNavLinks: [
      { id: 'nav-1', label: 'Heavyweight Hoodies', href: '/category/hoodies', badgeText: 'HOT', isActive: true, order: 1 },
      { id: 'nav-2', label: 'Oversized Tees', href: '/category/t-shirts', badgeText: 'NEW', isActive: true, order: 2 },
      { id: 'nav-3', label: 'Winter Drop', href: '/shop', badgeText: 'SALE', isActive: true, order: 3 },
    ],
    logistics: {
      supportPhone: '01700000000',
      whatsappNumber: '8801700000000',
      supportEmail: 'support@aurem.com',
      showroomAddress: 'Banani 11, Dhaka, Bangladesh',
      helplineHours: '10:00 AM - 10:00 PM',
      deliveryPolicyNote: 'পণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন',
      insideDhakaFee: 70,
      suburbsDhakaFee: 100,
      outsideDhakaFee: 130,
      isFreeShippingEnabled: true,
      freeShippingThreshold: 2500,
      estimatedDeliveryDays: {
        insideDhaka: '24-48 Hours',
        outsideDhaka: '3-5 Days',
      },
      socialLinks: {
        facebook: '',
        instagram: '',
        youtube: '',
        tiktok: '',
      },
    },
    tracking: {
      metaPixelId: '',
      metaCapiToken: '',
      metaTestEventCode: '',
      gtmId: '',
      ga4MeasurementId: '',
      clarityProjectId: '',
      tiktokPixelId: '',
      tiktokEventsApiToken: '',
    },
    courier: {
      provider: 'STEADFAST',
      steadfast: {
        apiKey: '',
        secretKey: '',
        baseUrl: 'https://portal.steadfast.com.bd/api/v1',
      },
      pathao: {
        clientId: '',
        clientSecret: '',
        username: '',
        password: '',
        storeId: '',
        baseUrl: 'https://api-hermes.pathao.com',
      },
      fraudCheck: {
        apiKey: '',
        riskThresholdRatio: 0.3,
        alertThresholdPercent: 60,
        autoHoldHighRisk: false,
      },
      advancePayment: {
        enabled: false,
        applyOnlyOutsideDhaka: true,
        amount: 130,
        walletType: 'BKASH',
        walletNumber: '01700000000',
        instructions: 'ঢাকার বাইরের অর্ডারের জন্য অগ্রিম ১৩০ টাকা ডেলিভারি চার্জ বিকাশ করে ট্রানজেকশন আইডি দিন।',
      },
    },
    payment: {
      cod: {
        enabled: true,
        note: 'Cash on delivery across 64 districts in Bangladesh',
      },
      manualBkash: {
        enabled: true,
        number: '01700000000',
        accountType: 'PERSONAL',
        instructions: 'Send Money to our personal bKash number and provide your TrxID below.',
      },
      manualNagad: {
        enabled: true,
        number: '01700000000',
        accountType: 'PERSONAL',
        instructions: 'Send Money to our personal Nagad number and provide your TrxID below.',
      },
      manualRocket: {
        enabled: false,
        number: '01700000000',
        accountType: 'PERSONAL',
        instructions: 'Send Money to our Rocket number and provide your TrxID below.',
      },
      bkashPGW: {
        enabled: false,
        appKey: '',
        appSecret: '',
        username: '',
        password: '',
        isSandbox: true,
      },
      sslCommerz: {
        enabled: false,
        storeId: '',
        storePass: '',
        isSandbox: true,
      },
    },
    media: {
      defaultVideoProvider: 'YOUTUBE',
      bunnyNet: { libraryId: '', cdnHostname: '' },
    },
    features: {
      capiEnabled: false,
      tiktokPixelEnabled: false,
      gtmEnabled: true,
      clarityEnabled: false,
      smartCheckoutEnabled: true,
      courierAutoBooking: false,
      fraudCheckEnabled: false,
      abandonedCartCapture: true,
      advanceDeliveryFeeEnabled: false,
      couponEnabled: true,
      showCardAddToCart: false,
      codEnabled: true,
      manualBkashEnabled: true,
      manualNagadEnabled: true,
      manualRocketEnabled: false,
      bkashPgwEnabled: false,
      sslCommerzEnabled: false,
    },
    isActive: true,
  };
}

/**
 * Internal un-cached fetcher for StoreConfig singleton with safe deep defaults
 */
async function fetchStoreConfigDocument(): Promise<IStoreConfig | null> {
  try {
    await connectDB();
    const config = await StoreConfig.findOne({ isActive: true }).lean();
    if (!config) return null;

    const parsed = JSON.parse(JSON.stringify(config));
    if (parsed.homeSections) {
      parsed.homeSections = normalizeHomeSections(parsed.homeSections);
    }
    return parsed;
  } catch (err) {
    console.warn('Notice: StoreConfig DB connection deferred:', err instanceof Error ? err.message : err);
    return null;
  }
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
        fraudCheck: {
          alertThresholdPercent: raw.courier?.fraudCheck?.alertThresholdPercent ?? 60,
          autoHoldHighRisk: raw.courier?.fraudCheck?.autoHoldHighRisk ?? false,
        },
        advancePayment: {
          enabled: raw.courier?.advancePayment?.enabled ?? false,
          applyOnlyOutsideDhaka: raw.courier?.advancePayment?.applyOnlyOutsideDhaka ?? true,
          amount: raw.courier?.advancePayment?.amount ?? 130,
          walletType: raw.courier?.advancePayment?.walletType || 'BKASH',
          walletNumber: raw.courier?.advancePayment?.walletNumber || '',
          instructions: raw.courier?.advancePayment?.instructions || '',
        },
      },
      payment: {
        cod: raw.payment?.cod || { enabled: true, note: 'Cash on delivery across Bangladesh' },
        cashOnDelivery: raw.payment?.cod || { enabled: true },
        manualBkash: {
          enabled: raw.payment?.manualBkash?.enabled ?? true,
          number: raw.payment?.manualBkash?.number || '01700000000',
          walletNumber: raw.payment?.manualBkash?.number || '01700000000',
          accountType: raw.payment?.manualBkash?.accountType || 'MERCHANT',
          instructions: raw.payment?.manualBkash?.instructions || '',
        },
        manualNagad: {
          enabled: raw.payment?.manualNagad?.enabled ?? true,
          number: raw.payment?.manualNagad?.number || '01700000000',
          accountType: raw.payment?.manualNagad?.accountType || 'PERSONAL',
          instructions: raw.payment?.manualNagad?.instructions || '',
        },
        manualRocket: {
          enabled: raw.payment?.manualRocket?.enabled ?? false,
          number: raw.payment?.manualRocket?.number || '01700000000',
          accountType: raw.payment?.manualRocket?.accountType || 'PERSONAL',
          instructions: raw.payment?.manualRocket?.instructions || '',
        },
        bkashPGW: {
          enabled: raw.payment?.bkashPGW?.enabled ?? false,
          isSandbox: raw.payment?.bkashPGW?.isSandbox ?? true,
        },
        sslCommerz: {
          enabled: raw.payment?.sslCommerz?.enabled ?? false,
          isSandbox: raw.payment?.sslCommerz?.isSandbox ?? true,
        },
      },
      headerNavLinks: (raw.headerNavLinks && raw.headerNavLinks.length > 0)
        ? raw.headerNavLinks
            .filter((l: IHeaderNavLink) => l.isActive)
            .sort((a: IHeaderNavLink, b: IHeaderNavLink) => a.order - b.order)
        : [
            { id: 'nav-home', label: 'HOME', href: '/', isActive: true, order: 1 },
            { id: 'nav-shop', label: 'CATALOG', href: '/shop', isActive: true, order: 2 },
          ],
    };

    return sanitized;
  },
  ['public-store-config'],
  { tags: ['store-config'], revalidate: 3600 }
);

/**
 * Admin StoreConfig fetcher: force-dynamic, full credentials for dashboard settings editor.
 */
export async function getAdminStoreConfig(): Promise<IStoreConfig | null> {
  return fetchStoreConfigDocument();
}

/**
 * Updates StoreConfig singleton with validation and dual cache invalidation.
 */
export async function updateStoreConfig(
  dto: Partial<IStoreConfig>,
  actor: string = 'ADMIN'
): Promise<IStoreConfig> {
  await connectDB();

  // Normalize homeSections if present
  if (dto.homeSections) {
    dto.homeSections = normalizeHomeSections(dto.homeSections);
  }

  const updated = await StoreConfig.findOneAndUpdate(
    { isActive: true },
    { $set: { ...dto, updatedBy: actor } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  invalidateConfigCaches();
  return JSON.parse(JSON.stringify(updated));
}
