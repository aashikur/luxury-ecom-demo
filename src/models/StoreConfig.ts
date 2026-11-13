import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomeSection {
  id: string;
  type: 'HERO_BANNER' | 'COLLECTION_SECTION' | 'PROMO_CTA_CARD';
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  linkUrl?: string;
  collectionSlug?: string;
  bannerImage?: {
    url: string;
    key: string;
  };
  themeStyle?: 'LIGHT' | 'DARK_BAND';
  order: number;
  isActive: boolean;
}

export interface IStoreConfig extends Document {
  branding: {
    storeName: string;
    tagline: string;
    storeNiche: 'CLOTHING' | 'GADGETS' | 'FOOD' | 'GENERAL';
    storeMode: 'MULTI_PRODUCT' | 'SINGLE_PRODUCT_FUNNEL';
    featuredProductSlug?: string;
    logo: {
      url: string;
      key: string;
    };
    favicon: {
      url: string;
      key: string;
    };
    currencySymbol?: string;
    currencyCode?: string;
    announcementBarEnabled?: boolean;
    announcementBarText?: string;
    themeMode: 'DARK' | 'LIGHT';
    colors: {
      primary: string;
      accent: string;
      bg: string;
      surface: string;
      fg: string;
      muted: string;
    };
    heroVariant: 'SPLIT' | 'CENTER' | 'FULL_SLIDER';
  };
  homeSections: IHomeSection[];
  logistics: {
    supportPhone: string;
    whatsappNumber: string;
    supportEmail?: string;
    showroomAddress: string;
    helplineHours?: string;
    deliveryPolicyNote?: string;
    insideDhakaFee: number;
    suburbsDhakaFee?: number;
    outsideDhakaFee: number;
    isFreeShippingEnabled?: boolean;
    freeShippingThreshold: number;
    estimatedDeliveryDays: {
      insideDhaka: string;
      outsideDhaka: string;
    };
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      tiktok?: string;
    };
  };
  tracking: {
    metaPixelId?: string;
    metaCapiToken?: string;
    metaTestEventCode?: string;
    gtmId?: string;
    ga4MeasurementId?: string;
    clarityProjectId?: string;
    tiktokPixelId?: string;
    tiktokEventsApiToken?: string;
  };
  courier: {
    provider: 'STEADFAST' | 'PATHAO' | 'REDX';
    steadfast: {
      apiKey?: string;
      secretKey?: string;
      baseUrl?: string;
    };
    pathao?: {
      clientId?: string;
      clientSecret?: string;
      username?: string;
      password?: string;
      storeId?: string;
      baseUrl?: string;
    };
    fraudCheck: {
      apiKey?: string;
      riskThresholdRatio: number;
      alertThresholdPercent: number;
      autoHoldHighRisk?: boolean;
    };
    advancePayment: {
      enabled: boolean;
      applyOnlyOutsideDhaka: boolean;
      amount: number;
      walletType?: 'BKASH' | 'NAGAD' | 'ROCKET';
      walletNumber?: string;
      instructions?: string;
      requiredForOutsideDhaka?: boolean;
      advanceAmount?: number;
      bkashMerchantNumber?: string;
    };
  };
  payment: {
    cod: {
      enabled: boolean;
      note?: string;
    };
    manualBkash: {
      enabled: boolean;
      number: string;
      accountType: 'PERSONAL' | 'AGENT' | 'MERCHANT';
      instructions?: string;
    };
    manualNagad: {
      enabled: boolean;
      number: string;
      accountType: 'PERSONAL' | 'AGENT' | 'MERCHANT';
      instructions?: string;
    };
    manualRocket?: {
      enabled: boolean;
      number: string;
      accountType: 'PERSONAL' | 'AGENT' | 'MERCHANT';
      instructions?: string;
    };
    bkashPGW: {
      enabled: boolean;
      appKey?: string;
      appSecret?: string;
      username?: string;
      password?: string;
      isSandbox: boolean;
    };
    sslCommerz: {
      enabled: boolean;
      storeId?: string;
      storePass?: string;
      isSandbox: boolean;
    };
  };
  media: {
    defaultVideoProvider: 'YOUTUBE' | 'R2' | 'BUNNY_STREAM';
    bunnyNet?: {
      libraryId?: string;
      cdnHostname?: string;
    };
  };
  features: {
    capiEnabled: boolean;
    tiktokPixelEnabled: boolean;
    gtmEnabled: boolean;
    clarityEnabled?: boolean;
    smartCheckoutEnabled?: boolean;
    courierAutoBooking: boolean;
    fraudCheckEnabled: boolean;
    abandonedCartCapture: boolean;
    advanceDeliveryFeeEnabled: boolean;
    couponEnabled: boolean;
    codEnabled?: boolean;
    manualBkashEnabled?: boolean;
    manualNagadEnabled?: boolean;
    manualRocketEnabled?: boolean;
    bkashPgwEnabled?: boolean;
    sslCommerzEnabled?: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreConfigSchema = new Schema<IStoreConfig>(
  {
    branding: {
      storeName: { type: String, default: 'Aurem Luxury' },
      tagline: { type: String, default: 'Engineered Streetwear & Minimal Garments' },
      storeNiche: {
        type: String,
        enum: ['CLOTHING', 'GADGETS', 'FOOD', 'GENERAL'],
        default: 'CLOTHING',
      },
      storeMode: {
        type: String,
        enum: ['MULTI_PRODUCT', 'SINGLE_PRODUCT_FUNNEL'],
        default: 'MULTI_PRODUCT',
      },
      featuredProductSlug: { type: String, default: '' },
      logo: {
        url: { type: String, default: '' },
        key: { type: String, default: '' },
      },
      favicon: {
        url: { type: String, default: '' },
        key: { type: String, default: '' },
      },
      themeMode: { type: String, enum: ['DARK', 'LIGHT'], default: 'LIGHT' },
      colors: {
        primary: { type: String, default: '#111111' },
        accent: { type: String, default: '#B8860B' },
        bg: { type: String, default: '#FFFFFF' },
        surface: { type: String, default: '#F9FAFB' },
        fg: { type: String, default: '#09090B' },
        muted: { type: String, default: '#71717A' },
      },
      heroVariant: {
        type: String,
        enum: ['SPLIT', 'CENTER', 'FULL_SLIDER'],
        default: 'CENTER',
      },
      currencySymbol: { type: String, default: '৳' },
      currencyCode: { type: String, default: 'BDT' },
      announcementBarEnabled: { type: Boolean, default: true },
      announcementBarText: {
        type: String,
        default: 'Free express shipping across Bangladesh on orders above ৳2,500',
      },
    },
    homeSections: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ['HERO_BANNER', 'COLLECTION_SECTION', 'PROMO_CTA_CARD'],
          default: 'COLLECTION_SECTION',
        },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        description: { type: String, default: '' },
        buttonText: { type: String, default: '' },
        buttonLink: { type: String, default: '' },
        collectionSlug: { type: String, default: '' },
        bannerImage: {
          url: { type: String, default: '' },
          key: { type: String, default: '' },
        },
        themeStyle: {
          type: String,
          enum: ['LIGHT', 'DARK_BAND'],
          default: 'LIGHT',
        },
        order: { type: Number, default: 1 },
        isActive: { type: Boolean, default: true },
      },
    ],
    logistics: {
      supportPhone: { type: String, default: '01700000000' },
      whatsappNumber: { type: String, default: '8801700000000' },
      supportEmail: { type: String, default: '' },
      showroomAddress: { type: String, default: 'Dhaka, Bangladesh' },
      helplineHours: { type: String, default: '10:00 AM - 10:00 PM' },
      deliveryPolicyNote: { type: String, default: 'পণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন' },
      insideDhakaFee: { type: Number, default: 70 },
      suburbsDhakaFee: { type: Number, default: 100 },
      outsideDhakaFee: { type: Number, default: 130 },
      isFreeShippingEnabled: { type: Boolean, default: true },
      freeShippingThreshold: { type: Number, default: 2500 },
      estimatedDeliveryDays: {
        insideDhaka: { type: String, default: '24-48 Hours' },
        outsideDhaka: { type: String, default: '3-5 Days' },
      },
      socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        tiktok: { type: String, default: '' },
      },
    },
    tracking: {
      metaPixelId: { type: String, default: '' },
      metaCapiToken: { type: String, default: '' },
      metaTestEventCode: { type: String, default: '' },
      gtmId: { type: String, default: '' },
      ga4MeasurementId: { type: String, default: '' },
      clarityProjectId: { type: String, default: '' },
      tiktokPixelId: { type: String, default: '' },
      tiktokEventsApiToken: { type: String, default: '' },
    },
    courier: {
      provider: {
        type: String,
        enum: ['STEADFAST', 'PATHAO', 'REDX'],
        default: 'STEADFAST',
      },
      steadfast: {
        apiKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        baseUrl: { type: String, default: 'https://portal.packzy.com/api/v1' },
      },
      pathao: {
        clientId: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        username: { type: String, default: '' },
        password: { type: String, default: '' },
        storeId: { type: String, default: '' },
        baseUrl: { type: String, default: 'https://api-hermes.pathao.com' },
      },
      fraudCheck: {
        apiKey: { type: String, default: '' },
        riskThresholdRatio: { type: Number, default: 0.3 },
        alertThresholdPercent: { type: Number, default: 60 },
        autoHoldHighRisk: { type: Boolean, default: false },
      },
      advancePayment: {
        enabled: { type: Boolean, default: false },
        applyOnlyOutsideDhaka: { type: Boolean, default: true },
        amount: { type: Number, default: 130 },
        walletType: { type: String, enum: ['BKASH', 'NAGAD', 'ROCKET'], default: 'BKASH' },
        walletNumber: { type: String, default: '01700000000' },
        instructions: {
          type: String,
          default: 'ঢাকার বাইরের অর্ডারের জন্য অগ্রিম ১৩০ টাকা ডেলিভারি চার্জ বিকাশ করে ট্রানজেকশন আইডি দিন।',
        },
        requiredForOutsideDhaka: { type: Boolean, default: false },
        advanceAmount: { type: Number, default: 130 },
        bkashMerchantNumber: { type: String, default: '' },
      },
    },
    payment: {
      cod: {
        enabled: { type: Boolean, default: true },
        note: { type: String, default: 'Cash on delivery across 64 districts in Bangladesh' },
      },
      manualBkash: {
        enabled: { type: Boolean, default: true },
        number: { type: String, default: '01700000000' },
        accountType: {
          type: String,
          enum: ['PERSONAL', 'AGENT', 'MERCHANT'],
          default: 'PERSONAL',
        },
        instructions: {
          type: String,
          default: 'Send Money to our personal bKash number and provide your TrxID below.',
        },
      },
      manualNagad: {
        enabled: { type: Boolean, default: true },
        number: { type: String, default: '01700000000' },
        accountType: {
          type: String,
          enum: ['PERSONAL', 'AGENT', 'MERCHANT'],
          default: 'PERSONAL',
        },
        instructions: {
          type: String,
          default: 'Send Money to our personal Nagad number and provide your TrxID below.',
        },
      },
      manualRocket: {
        enabled: { type: Boolean, default: false },
        number: { type: String, default: '01700000000' },
        accountType: {
          type: String,
          enum: ['PERSONAL', 'AGENT', 'MERCHANT'],
          default: 'PERSONAL',
        },
        instructions: {
          type: String,
          default: 'Send Money to our Rocket number and provide your TrxID below.',
        },
      },
      bkashPGW: {
        enabled: { type: Boolean, default: false },
        appKey: { type: String, default: '' },
        appSecret: { type: String, default: '' },
        username: { type: String, default: '' },
        password: { type: String, default: '' },
        isSandbox: { type: Boolean, default: true },
      },
      sslCommerz: {
        enabled: { type: Boolean, default: false },
        storeId: { type: String, default: '' },
        storePass: { type: String, default: '' },
        isSandbox: { type: Boolean, default: true },
      },
    },
    media: {
      defaultVideoProvider: {
        type: String,
        enum: ['YOUTUBE', 'R2', 'BUNNY_STREAM'],
        default: 'YOUTUBE',
      },
      bunnyNet: {
        libraryId: { type: String, default: '' },
        cdnHostname: { type: String, default: '' },
      },
    },
    features: {
      capiEnabled: { type: Boolean, default: false },
      tiktokPixelEnabled: { type: Boolean, default: false },
      gtmEnabled: { type: Boolean, default: false },
      clarityEnabled: { type: Boolean, default: false },
      smartCheckoutEnabled: { type: Boolean, default: true },
      courierAutoBooking: { type: Boolean, default: false },
      fraudCheckEnabled: { type: Boolean, default: false },
      abandonedCartCapture: { type: Boolean, default: true },
      advanceDeliveryFeeEnabled: { type: Boolean, default: false },
      couponEnabled: { type: Boolean, default: true },
      codEnabled: { type: Boolean, default: true },
      manualBkashEnabled: { type: Boolean, default: true },
      manualNagadEnabled: { type: Boolean, default: true },
      manualRocketEnabled: { type: Boolean, default: false },
      bkashPgwEnabled: { type: Boolean, default: false },
      sslCommerzEnabled: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const StoreConfig: Model<IStoreConfig> =
  mongoose.models.StoreConfig || mongoose.model<IStoreConfig>('StoreConfig', StoreConfigSchema);

export default StoreConfig;
