import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import StoreConfig from '@/models/StoreConfig';

export const dynamic = 'force-dynamic';

/**
 * ============================================================================
 * LESSON: StoreConfig API Route (Auto-Seeding & Singleton Management)
 * ============================================================================
 * 
 * 1. AUTO-SEEDING PATTERN:
 *    When a client boots a fresh deployment, MongoDB is empty. If no StoreConfig 
 *    exists, GET automatically seeds sensible production defaults (Brand, Theme, 
 *    Logistics, Sections) so the store runs immediately without setup errors.
 * 
 * 2. SINGLETON UPDATE (PUT):
 *    We update the single active document using findOneAndUpdate with upsert: true.
 */

const DEFAULT_CONFIG_SEED = {
  branding: {
    storeName: 'Aurem Luxury',
    tagline: 'Engineered Streetwear & Minimal Garments',
    logo: {
      url: 'https://cdn-demo.vectorfitlab.com/branding/logo.png',
      key: 'branding/logo.png',
    },
    favicon: {
      url: '',
      key: '',
    },
    currencySymbol: '৳',
    currencyCode: 'BDT',
    announcementBarEnabled: true,
    announcementBarText: 'Free express shipping across Bangladesh on orders above ৳2,500',
    themeMode: 'LIGHT' as const,
    colors: {
      primary: '#111111',
      accent: '#B8860B',
      bg: '#FFFFFF',
      surface: '#F9FAFB',
      fg: '#09090B',
      muted: '#71717A',
    },
    heroVariant: 'CENTER' as const,
  },
  homeSections: [
    {
      id: 'sec_hero_1',
      type: 'HERO_BANNER' as const,
      title: 'Winter Luxury Drop 2026',
      subtitle: 'Premium Acid-Wash & Heavyweight Fleece',
      buttonLink: '/shop',
      order: 1,
      isActive: true,
    },
    {
      id: 'sec_cat_hoodies',
      type: 'COLLECTION_SECTION' as const,
      title: 'Heavyweight Hoodies',
      subtitle: '450 GSM French Terry Fleece',
      collectionSlug: 'hoodies',
      themeStyle: 'LIGHT' as const,
      order: 2,
      isActive: true,
    },
    {
      id: 'sec_banner_promo',
      type: 'PROMO_CTA_CARD' as const,
      title: 'Free Express Shipping Across Bangladesh',
      subtitle: 'On all orders above 2,500 BDT',
      buttonLink: '/shop',
      order: 3,
      isActive: true,
    },
    {
      id: 'sec_cat_tees',
      type: 'COLLECTION_SECTION' as const,
      title: 'Oversized Tees',
      subtitle: '240 GSM Combed Cotton',
      collectionSlug: 't-shirts',
      themeStyle: 'DARK_BAND' as const,
      order: 4,
      isActive: true,
    },
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
      baseUrl: 'https://portal.packzy.com/api/v1',
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
      requiredForOutsideDhaka: false,
      advanceAmount: 130,
      bkashMerchantNumber: '',
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
      instructions: 'Send Money to our personal bKash number and paste your TrxID below.',
    },
    manualNagad: {
      enabled: true,
      number: '01700000000',
      accountType: 'PERSONAL',
      instructions: 'Send Money to our personal Nagad number and paste your TrxID below.',
    },
    manualRocket: {
      enabled: false,
      number: '01700000000',
      accountType: 'PERSONAL',
      instructions: 'Send Money to our Rocket number and paste your TrxID below.',
    },
    bkashPGW: {
      enabled: false,
      isSandbox: true,
    },
    sslCommerz: {
      enabled: false,
      isSandbox: true,
    },
  },
  media: {
    defaultVideoProvider: 'YOUTUBE',
  },
  features: {
    capiEnabled: false,
    tiktokPixelEnabled: false,
    gtmEnabled: false,
    clarityEnabled: false,
    smartCheckoutEnabled: true,
    courierAutoBooking: false,
    fraudCheckEnabled: false,
    abandonedCartCapture: true,
    advanceDeliveryFeeEnabled: false,
    couponEnabled: true,
    codEnabled: true,
    manualBkashEnabled: true,
    manualNagadEnabled: true,
    manualRocketEnabled: false,
    bkashPgwEnabled: false,
    sslCommerzEnabled: false,
  },
  isActive: true,
};

/**
 * GET: Fetch the active store config, auto-seeding if empty
 */
export async function GET() {
  try {
    await connectDB();

    let config = await StoreConfig.findOne({ isActive: true });

    if (!config) {
      console.log('⚡ No StoreConfig found. Seeding default configuration to MongoDB...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config = await StoreConfig.create(DEFAULT_CONFIG_SEED as any);
    }

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error: unknown) {
    console.error('StoreConfig GET Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch config';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT: Update store configuration from admin panel
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const updatedConfig = await StoreConfig.findOneAndUpdate(
      { isActive: true },
      { $set: body },
      { new: true, upsert: true }
    );

    // Revalidate storefront and admin settings caches
    try {
      revalidatePath('/', 'page');
      revalidatePath('/shop', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/admin/settings', 'page');
    } catch (revErr) {
      console.warn('Revalidation notice:', revErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Store configuration updated successfully',
        data: updatedConfig,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('StoreConfig PUT Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update config';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
