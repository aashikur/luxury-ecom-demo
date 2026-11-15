import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrateConfig() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const coll = mongoose.connection.collection('storeconfigs');
  const doc = await coll.findOne({ isActive: true });

  if (!doc) {
    console.log('No active storeconfig found to migrate.');
    await mongoose.disconnect();
    return;
  }

  // Canonical type mapping for homeSections
  const typeMap = {
    HERO_CAROUSEL: 'HERO_BANNER',
    PROMO_BANNER: 'PROMO_CTA_CARD',
    CATEGORY_GRID: 'COLLECTION_SECTION',
    CATEGORY_SLIDER: 'COLLECTION_SECTION',
  };

  const updatedSections = (doc.homeSections || []).map((sec, idx) => {
    const canonicalType = typeMap[sec.type] || sec.type || 'COLLECTION_SECTION';
    return {
      ...sec,
      type: canonicalType,
      order: sec.order ?? idx + 1,
      isActive: sec.isActive ?? true,
    };
  });

  // Canonicalize courier.advancePayment
  const adv = doc.courier?.advancePayment || {};
  const canonicalAdvancePayment = {
    enabled: adv.enabled ?? adv.requiredForOutsideDhaka ?? false,
    applyOnlyOutsideDhaka: adv.applyOnlyOutsideDhaka ?? adv.requiredForOutsideDhaka ?? true,
    amount: adv.amount ?? adv.advanceAmount ?? 130,
    walletType: adv.walletType || 'BKASH',
    walletNumber: adv.walletNumber || adv.bkashMerchantNumber || '01700000000',
    instructions:
      adv.instructions ||
      'ঢাকার বাইরের অর্ডারের জন্য অগ্রিম ১৩০ টাকা ডেলিভারি চার্জ বিকাশ করে ট্রানজেকশন আইডি দিন।',
  };

  // Canonicalize courier.fraudCheck
  const fc = doc.courier?.fraudCheck || {};
  const canonicalFraudCheck = {
    apiKey: fc.apiKey || '',
    riskThresholdRatio: fc.riskThresholdRatio ?? 0.3,
    alertThresholdPercent: fc.alertThresholdPercent ?? 60,
    autoHoldHighRisk: fc.autoHoldHighRisk ?? false,
  };

  // Canonicalize logistics
  const log = doc.logistics || {};
  const canonicalLogistics = {
    ...log,
    suburbsDhakaFee: log.suburbsDhakaFee ?? 100,
    isFreeShippingEnabled: log.isFreeShippingEnabled ?? true,
    supportEmail: log.supportEmail || 'support@aurem.com',
    helplineHours: log.helplineHours || '10:00 AM - 10:00 PM',
    deliveryPolicyNote: log.deliveryPolicyNote || 'পণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন',
    estimatedDeliveryDays: log.estimatedDeliveryDays || {
      insideDhaka: '24-48 Hours',
      outsideDhaka: '3-5 Days',
    },
    socialLinks: log.socialLinks || {
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: '',
    },
  };

  // Canonicalize branding
  const branding = doc.branding || {};
  const canonicalBranding = {
    ...branding,
    storeNiche: branding.storeNiche || 'CLOTHING',
    storeMode: branding.storeMode || 'MULTI_PRODUCT',
    featuredProductSlug: branding.featuredProductSlug || '',
    currencySymbol: branding.currencySymbol || '৳',
    currencyCode: branding.currencyCode || 'BDT',
    announcementBarEnabled: branding.announcementBarEnabled ?? true,
    announcementBarText:
      branding.announcementBarText ||
      'Free express shipping across Bangladesh on orders above ৳2,500',
  };

  // Header Nav Links fallback if empty
  const canonicalHeaderNavLinks =
    Array.isArray(doc.headerNavLinks) && doc.headerNavLinks.length > 0
      ? doc.headerNavLinks
      : [
          { id: 'nav-1', label: 'Heavyweight Hoodies', href: '/category/hoodies', badgeText: 'HOT', isActive: true, order: 1 },
          { id: 'nav-2', label: 'Oversized Tees', href: '/category/t-shirts', badgeText: 'NEW', isActive: true, order: 2 },
          { id: 'nav-3', label: 'Winter Collection', href: '/shop', badgeText: 'SALE', isActive: true, order: 3 },
        ];

  // Canonicalize payment
  const payment = doc.payment || {};
  const canonicalPayment = {
    ...payment,
    cod: payment.cod || {
      enabled: true,
      note: 'Cash on delivery across 64 districts in Bangladesh',
    },
    manualRocket: payment.manualRocket || {
      enabled: false,
      number: '01700000000',
      accountType: 'PERSONAL',
      instructions: 'Send Money to our Rocket number and provide your TrxID below.',
    },
  };

  await coll.updateOne(
    { _id: doc._id },
    {
      $set: {
        branding: canonicalBranding,
        homeSections: updatedSections,
        headerNavLinks: canonicalHeaderNavLinks,
        logistics: canonicalLogistics,
        courier: {
          ...doc.courier,
          fraudCheck: canonicalFraudCheck,
          advancePayment: canonicalAdvancePayment,
          pathao: doc.courier?.pathao || {
            clientId: '',
            clientSecret: '',
            username: '',
            password: '',
            storeId: '',
            baseUrl: 'https://api-hermes.pathao.com',
          },
        },
        payment: canonicalPayment,
      },
    }
  );

  console.log('✅ storeconfig migrated successfully with canonical enum types and fields!');
  await mongoose.disconnect();
}

migrateConfig().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
