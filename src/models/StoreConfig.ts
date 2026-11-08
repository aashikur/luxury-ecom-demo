import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * ============================================================================
 * LESSON: Production-Grade StoreConfig Schema (Mongoose + TypeScript)
 * ============================================================================
 * 
 * WHY A SINGLETON STORE CONFIG?
 * In multi-tenant or white-label e-commerce, this single document dictates:
 * - Store identity (name, logo, theme colors)
 * - Logistics & Courier automation (Steadfast, Fraud detection, Delivery fees)
 * - Marketing & tracking (Meta Pixel + CAPI token, TikTok, GTM)
 * - Payment Gateways (COD, Manual MFS with TrxID, Automated bKash PGW)
 * - Feature switches (toggling features ON/OFF without code changes)
 */

export interface IStoreConfig extends Document {
  branding: {
    storeName: string;
    tagline: string;
    logo: {
      url: string;
      key: string;
    };
    favicon: {
      url: string;
      key: string;
    };
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
  logistics: {
    supportPhone: string;
    whatsappNumber: string;
    showroomAddress: string;
    insideDhakaFee: number;
    outsideDhakaFee: number;
    freeShippingThreshold: number;
    estimatedDeliveryDays: {
      insideDhaka: string;
      outsideDhaka: string;
    };
  };
  tracking: {
    metaPixelId?: string;
    metaCapiToken?: string;
    metaTestEventCode?: string;
    gtmId?: string;
    ga4MeasurementId?: string;
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
    fraudCheck: {
      apiKey?: string;
      riskThresholdRatio: number;
    };
    advancePayment: {
      requiredForOutsideDhaka: boolean;
      advanceAmount: number;
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
      accountType: 'PERSONAL' | 'AGENT';
      instructions?: string;
    };
    manualNagad: {
      enabled: boolean;
      number: string;
      accountType: 'PERSONAL' | 'AGENT';
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
    courierAutoBooking: boolean;
    fraudCheckEnabled: boolean;
    abandonedCartCapture: boolean;
    advanceDeliveryFeeEnabled: boolean;
    couponEnabled: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreConfigSchema = new Schema<IStoreConfig>(
  {
    branding: {
      storeName: { type: String, default: 'VectroFit Luxury' },
      tagline: { type: String, default: 'Premium Bangladeshi Streetwear' },
      logo: {
        url: { type: String, default: '' },
        key: { type: String, default: '' },
      },
      favicon: {
        url: { type: String, default: '' },
        key: { type: String, default: '' },
      },
      themeMode: { type: String, enum: ['DARK', 'LIGHT'], default: 'DARK' },
      colors: {
        primary: { type: String, default: '#0F172A' },
        accent: { type: String, default: '#E11D48' },
        bg: { type: String, default: '#09090B' },
        surface: { type: String, default: '#18181B' },
        fg: { type: String, default: '#FAFAFA' },
        muted: { type: String, default: '#71717A' },
      },
      heroVariant: {
        type: String,
        enum: ['SPLIT', 'CENTER', 'FULL_SLIDER'],
        default: 'CENTER',
      },
    },

    logistics: {
      supportPhone: { type: String, default: '01700000000' },
      whatsappNumber: { type: String, default: '8801700000000' },
      showroomAddress: { type: String, default: 'Dhaka, Bangladesh' },
      insideDhakaFee: { type: Number, default: 70 },
      outsideDhakaFee: { type: Number, default: 130 },
      freeShippingThreshold: { type: Number, default: 2500 },
      estimatedDeliveryDays: {
        insideDhaka: { type: String, default: '24-48 Hours' },
        outsideDhaka: { type: String, default: '3-5 Days' },
      },
    },

    tracking: {
      metaPixelId: { type: String, default: '' },
      metaCapiToken: { type: String, default: '' },
      metaTestEventCode: { type: String, default: '' },
      gtmId: { type: String, default: '' },
      ga4MeasurementId: { type: String, default: '' },
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
      fraudCheck: {
        apiKey: { type: String, default: '' },
        riskThresholdRatio: { type: Number, default: 0.3 }, // Alert if return ratio > 30%
      },
      advancePayment: {
        requiredForOutsideDhaka: { type: Boolean, default: false },
        advanceAmount: { type: Number, default: 150 },
        bkashMerchantNumber: { type: String, default: '' },
      },
    },

    payment: {
      cod: {
        enabled: { type: Boolean, default: true },
        note: { type: String, default: 'Cash on delivery across Bangladesh' },
      },
      manualBkash: {
        enabled: { type: Boolean, default: true },
        number: { type: String, default: '01700000000' },
        accountType: { type: String, enum: ['PERSONAL', 'AGENT'], default: 'PERSONAL' },
        instructions: {
          type: String,
          default: 'Send Money to our personal bKash number and provide your TrxID below.',
        },
      },
      manualNagad: {
        enabled: { type: Boolean, default: true },
        number: { type: String, default: '01700000000' },
        accountType: { type: String, enum: ['PERSONAL', 'AGENT'], default: 'PERSONAL' },
        instructions: {
          type: String,
          default: 'Send Money to our personal Nagad number and provide your TrxID below.',
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
      courierAutoBooking: { type: Boolean, default: false },
      fraudCheckEnabled: { type: Boolean, default: false },
      abandonedCartCapture: { type: Boolean, default: true },
      advanceDeliveryFeeEnabled: { type: Boolean, default: false },
      couponEnabled: { type: Boolean, default: true },
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Automatically manages createdAt & updatedAt
  }
);

// Prevent recompilation in Next.js development Hot-Module-Reloading
export const StoreConfig: Model<IStoreConfig> =
  mongoose.models.StoreConfig || mongoose.model<IStoreConfig>('StoreConfig', StoreConfigSchema);

export default StoreConfig;
