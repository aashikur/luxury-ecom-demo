# [ধাপ ২] Schema, Interface & Response Envelope Locked — Master Specification

> **Phase Status:** 🔒 **LOCKED & AUTHORITATIVE (Step 2 of 7)**  
> **Master Pipeline Stage:** Step 2 — Schema, Interface & Response Envelope  
> **Dependency:** Built strictly upon `docs/pipeline/01-scope-and-business-rules.md` (`CR-000` Baseline).  
> **Rule of Engagement:** All subsequent Mongoose models, TypeScript DTOs, API route handlers, and Frontend clients MUST adhere strictly to these types, interfaces, and envelope contracts. Any deviation that introduces unmapped fields, missing guards, or broken response contracts must be rejected.

---

## 🗺️ The 7-Step Senior Master Pipeline Context

```
[ধাপ ১] Scope & Business Rules Locked ✅ (CR-000 Baseline)
  │      - 7 Core + 4 Growth/Taxonomy Collections Boundaries (11 Total)
  │      - Bangladeshi Guest-First Checkout, 3-Zone Tariffs & Incomplete Lead Rules
  │      - 3-Layer Credential Shield (AES-256), Unified Payment Adapter & 5-Role RBAC
  ▼
[ধাপ ২] Schema, Interface & Response Envelope Locked (THIS DOCUMENT) 🔒
  │      - 11 Complete TypeScript Domain Interfaces & Field Definitions
  │      - Standard API Response Contract: { success, data, pagination, error, code }
  │      - Cross-Collection Relationship Matrix & Indexing Strategy
  │      - Strict Request DTO Validation, Bounded Pagination (limit <= 50) & Projections
  ▼
[ধাপ ৩] Automated Seed Engine & Fixtures (npm run db:seed)
  │      - 1-Command realistic catalog, taxonomies, and admin credentials
  ▼
[ধাপ ৪] Core Backend Services & State Machines
  │      - Atomic Decrement ($inc) & Zero Oversell Guarantee
  │      - Order Lifecycle Transitions & Steadfast Courier Integration
  │      - On-Demand Cache Busters (revalidatePath / revalidateTag)
  ▼
[ধাপ ৫] Admin & Staff Auth (RBAC)
  │      - HttpOnly Cookie sessions for Admin / Call-Center Moderators
  │      - Zero-password barrier for customers
  ▼
[ধাপ ৬] Frontend UI Wireup (Storefront & Admin)
  │      - 1-Page COD Drawer, Size Charts, Color Swatches
  │      - Locked Admin Design Hierarchy (#060d11, Emerald #076E46)
  ▼
[ধাপ ৭] Hardening, Concurrency & Production Checklist Sign-off
         - Race conditions, edge headers, and backup restore drills (docs/PRODUCTION_CHECKLIST.md)
```

---

## 1. Standard API Request & Response Envelope Contract

To ensure 100% predictable client-server communication, zero frontend runtime crashes, and seamless TypeScript type inference, **EVERY API endpoint in the platform must return this universal envelope**.

### A. Universal Success Envelope (`ApiResponse<T>`)

```typescript
export interface ApiPaginationMeta {
  total: number;       // Total matched records in database
  page: number;        // Current active page (1-indexed)
  pages: number;       // Total available pages (Math.ceil(total / limit))
  limit: number;       // Items per page (strictly bounded: 1 <= limit <= 50)
  hasNextPage: boolean;// true if page < pages
  hasPrevPage: boolean;// true if page > 1
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  pagination?: ApiPaginationMeta;
  message?: string;    // Human-readable confirmation (e.g. "Order placed successfully")
}
```

### B. Universal Error Envelope (`ApiErrorResponse`)

```typescript
export type ApiErrorCode =
  | 'UNAUTHORIZED'            // 401: Missing or invalid session cookie
  | 'FORBIDDEN'               // 403: Role insufficient (e.g. MODERATOR accessing StoreConfig)
  | 'NOT_FOUND'               // 404: Resource does not exist
  | 'VALIDATION_ERROR'        // 400: Zod schema validation failed on request input
  | 'OUT_OF_STOCK'            // 409: Insufficient atomic stock for requested variant
  | 'COUPON_INVALID'          // 400: Expired, spend condition unmet, or usage limit exceeded
  | 'PAYMENT_FAILED'          // 402: Gateway rejected charge or invalid TrxID
  | 'DUPLICATE_ORDER'         // 409: IdempotencyKey collision
  | 'RATE_LIMITED'            // 429: Too many requests on IP or phone number
  | 'INTERNAL_ERROR';         // 500: Serverless failure (sanitized; no raw stack traces)

export interface ApiValidationErrorDetail {
  field: string;              // Dot-path to invalid property (e.g. "customer.phone")
  message: string;            // Validation rule violated
}

export interface ApiErrorResponse {
  success: false;
  error: string;              // Primary human-readable error string
  code: ApiErrorCode;         // Machine-readable uppercase error token
  details?: ApiValidationErrorDetail[] | unknown;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
```

---

## 2. The 11 Definitive Collection Interfaces

The platform architecture is strictly bounded to **7 Core Collections + 4 Growth & Taxonomy Collections (11 Total)**.

```
                      ┌─────────────────────────────────────────┐
                      │        StoreConfig (Singleton)          │
                      │  - Branding, Colors, ThemeTokens        │
                      │  - Logistics (3-Zone Tariffs)           │
                      │  - HomeSections[], HeaderNavLinks[]     │
                      │  - 3-Layer AES-256 Encrypted Secrets    │
                      └────────────────────┬────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
┌─────────────────┐ ┌─────────────────┐   ┌─────────────────┐ ┌─────────────────┐
│    Category     │ │      Brand      │   │   Collection    │ │     Coupon      │
│ (3-Level Tree)  │ │ (Multi-Niche)   │   │  (Marketing)    │ │   (Discounts)   │
└────────┬────────┘ └────────┬────────┘   └────────┬────────┘ └────────┬────────┘
         │                   │                     │                   │
         └─────────────┐     │     ┌───────────────┘                   │
                       ▼     ▼     ▼                                   │
              ┌─────────────────────────────────┐                      │
              │             Product             │                      │
              │  - Embedded variants[]          │                      │
              │  - Embedded sizeChart[]         │                      │
              │  - Embedded specifications[]    │                      │
              │  - Embedded modifierGroups[]    │                      │
              └────────────────┬────────────────┘                      │
                               │                                       │
                               ▼                                       ▼
                      ┌────────────────────────────────────────────────────────┐
                      │                         Order                          │
                      │  - orderStatus (State Machine)                         │
                      │  - paymentStatus (Decoupled Adapter)                   │
                      │  - idempotencyKey & inventoryState                     │
                      │  - Embedded item snapshots                             │
                      │  - Courier Consignment & 3-Zone Delivery               │
                      └────────────────────────┬───────────────────────────────┘
                                               │
                               ┌───────────────┴───────────────┐
                               ▼                               ▼
                      ┌─────────────────┐             ┌─────────────────┐
                      │    Customer     │             │    AuditLog     │
                      │ (Phone-Indexed) │             │ (Admin History) │
                      └─────────────────┘             └─────────────────┘
```

---

### Collection 1: `StoreConfig` (`storeconfigs`) — Singleton

Controls the store's visual identity, 3-zone shipping fees, homepage blocks, pinned header navigation, and third-party API credentials under the 3-Layer Secret Shield.

```typescript
export interface IHomeSectionBannerImage {
  url: string;
  key: string;
}

export interface IHomeSection {
  id: string;                                    // Unique block ID (e.g. "sec_hero_1")
  type: 'HERO_BANNER' | 'COLLECTION_SECTION' | 'PROMO_CTA_CARD';
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  linkUrl?: string;
  collectionSlug?: string;                       // Bound collection slug
  bannerImage?: IHomeSectionBannerImage;
  themeStyle?: 'LIGHT' | 'DARK_BAND';
  layoutWidth?: 'WIDE_FULL' | 'WIDE_BOX';        // 100vw vs 1280px container
  promoCardHeight?: 'S' | 'M' | 'L';             // 120px / 220px / 320px
  displayStyle?: 'GRID' | 'CAROUSEL';            // 4-col grid vs horizontal swiper
  curatedProductIds?: mongoose.Types.ObjectId[]; // Mode B hand-picked products
  order: number;                                 // Up/Down reordering position
  isActive: boolean;                             // Eye toggle visibility
}

export interface IHeaderNavLink {
  id: string;                                    // Unique link ID (e.g. "nav_hoodies")
  label: string;                                 // Display label on navbar
  href: string;                                  // Target URL (e.g. "/category/hoodies")
  categoryId?: mongoose.Types.ObjectId;          // Optional linked category
  badgeText?: string;                            // Promotional pill ("HOT", "NEW", "SALE")
  isActive: boolean;                             // 👁️ Eye toggle: Show/Hide
  order: number;                                 // Horizontal sort position (⬆️ ⬇️)
}

export interface IStoreConfigBranding {
  storeName: string;
  tagline: string;
  storeNiche: 'CLOTHING' | 'GADGETS' | 'FOOD' | 'GENERAL';
  storeMode: 'MULTI_PRODUCT' | 'SINGLE_PRODUCT_FUNNEL';
  featuredProductSlug?: string;
  logo: { url: string; key: string };
  favicon: { url: string; key: string };
  currencySymbol: string;                        // Default: '৳'
  currencyCode: string;                          // Default: 'BDT'
  announcementBarEnabled: boolean;
  announcementBarText?: string;
  themeMode: 'DARK' | 'LIGHT';
  colors: {
    primary: string;                             // Default: '#111111'
    accent: string;                              // Default: '#076E46' or '#B8860B'
    bg: string;
    surface: string;
    fg: string;
    muted: string;
  };
  heroVariant: 'SPLIT' | 'CENTER' | 'FULL_SLIDER';
}

export interface IStoreConfigLogistics {
  supportPhone: string;                          // Hotline on announcement bar & invoice
  whatsappNumber: string;                        // Sanitized for wa.me link
  supportEmail?: string;
  showroomAddress: string;
  helplineHours?: string;
  deliveryPolicyNote?: string;
  insideDhakaFee: number;                        // Default: ৳70
  suburbsDhakaFee: number;                       // Default: ৳100 (Gazipur, Savar, Narayanganj)
  outsideDhakaFee: number;                       // Default: ৳130 (Nationwide 63 districts)
  isFreeShippingEnabled: boolean;                // Progress bar toggle in cart drawer
  freeShippingThreshold: number;                 // Default: ৳2500
  estimatedDeliveryDays: {
    insideDhaka: string;                         // e.g. "24-48 Hours"
    suburbsDhaka?: string;                       // e.g. "2-3 Days"
    outsideDhaka: string;                        // e.g. "3-5 Days"
  };
  socialLinks?: {
    facebook?: string;                           // e.g. "https://facebook.com/aurem.garments"
    instagram?: string;                          // e.g. "https://instagram.com/aurem.luxury"
    youtube?: string;                            // e.g. "https://youtube.com/@aurem"
    tiktok?: string;                             // e.g. "https://tiktok.com/@aurem"
  };
}

export interface IStoreConfigTracking {
  metaPixelId?: string;                          // Public browser ID
  metaCapiToken?: string;                        // AES-256 Ciphertext in DB
  metaTestEventCode?: string;
  gtmId?: string;                                // Public container ID
  ga4MeasurementId?: string;                     // Public measurement ID
  clarityProjectId?: string;                     // Public clarity project ID
  tiktokPixelId?: string;                        // Public pixel ID
  tiktokEventsApiToken?: string;                 // AES-256 Ciphertext in DB
}

export interface IStoreConfigCourier {
  provider: 'STEADFAST' | 'PATHAO' | 'REDX';
  steadfast: {
    apiKey?: string;                             // Public portal API key
    secretKey?: string;                          // AES-256 Ciphertext in DB
    baseUrl?: string;                            // Default: 'https://portal.packzy.com/api/v1'
  };
  pathao?: {
    clientId?: string;
    clientSecret?: string;                       // AES-256 Ciphertext in DB
    username?: string;
    password?: string;                           // AES-256 Ciphertext in DB
    storeId?: string;
    baseUrl?: string;
  };
  fraudCheck: {
    enabled: boolean;
    apiKey?: string;
    riskThresholdRatio: number;                  // e.g. 0.3
    alertThresholdPercent: number;               // Default: 60 (<60% success flags High Risk)
    autoHoldHighRisk: boolean;                   // Holds order for call-center review
  };
  advancePayment: {
    enabled: boolean;                            // Merchant optional toggle
    applyOnlyOutsideDhaka: boolean;              // Outside Dhaka vs All Orders
    amount: number;                              // Customizable amount (Default: ৳130)
    walletType: 'BKASH' | 'NAGAD' | 'ROCKET';
    walletNumber: string;
    instructions: string;
    requiredForOutsideDhaka?: boolean;           // Legacy compatibility
    advanceAmount?: number;                      // Legacy compatibility
    bkashMerchantNumber?: string;                // Legacy compatibility
  };
}

export interface IStoreConfigPayment {
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
    appSecret?: string;                          // AES-256 Ciphertext in DB
    username?: string;
    password?: string;                           // AES-256 Ciphertext in DB
    isSandbox: boolean;
  };
  sslCommerz: {
    enabled: boolean;
    storeId?: string;
    storePass?: string;                          // AES-256 Ciphertext in DB
    isSandbox: boolean;
  };
}

export interface IStoreConfigFeatures {
  smartCheckoutEnabled: boolean;                 // Drawer 1-click checkout vs /checkout redirect
  abandonedCartCapture: boolean;                 // Captures INCOMPLETE leads on phone blur
  fraudCheckEnabled: boolean;                    // Queries courier delivery history
  courierAutoBooking: boolean;                   // Auto-books parcel on CONFIRMED
  advanceDeliveryFeeEnabled: boolean;            // Requires advance shipping fee
  couponEnabled: boolean;                        // Displays promo code input box
  capiEnabled: boolean;                          // Dispatches server-side Meta CAPI
  gtmEnabled: boolean;                           // Pushes events to window.dataLayer
  tiktokPixelEnabled: boolean;                   // Dispatches TikTok pixel events
  clarityEnabled: boolean;                       // Loads Microsoft Clarity session replay
  codEnabled?: boolean;
  manualBkashEnabled?: boolean;
  manualNagadEnabled?: boolean;
  manualRocketEnabled?: boolean;
  bkashPgwEnabled?: boolean;
  sslCommerzEnabled?: boolean;
}

export interface IStoreConfig extends Document {
  branding: IStoreConfigBranding;
  homeSections: IHomeSection[];
  headerNavLinks: IHeaderNavLink[];
  logistics: IStoreConfigLogistics;
  tracking: IStoreConfigTracking;
  courier: IStoreConfigCourier;
  payment: IStoreConfigPayment;
  features: IStoreConfigFeatures;
  isActive: boolean;                             // Always true for singleton
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 2: `Category` (`categories`) — Structural Taxonomy Tree

Houses the 3-level physical classification tree (`Root ➔ Sub-Category ➔ Item Type`) using Materialized Path `ancestors[]`.

```typescript
export interface ICategory extends Document {
  name: string;                                  // e.g. "Hoodies"
  slug: string;                                  // e.g. "hoodies" (Unique, indexed)
  parentId: mongoose.Types.ObjectId | null;      // null for Root (Level 0)
  ancestors: string[];                           // Materialized slug path: ['men', 'topwear']
  level: number;                                 // 0 = Root, 1 = Sub, 2 = Item Type
  displayOrder: number;                          // Sibling sort order (scoped per parentId)
  description?: string;
  image?: {
    url: string;
    key: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 3: `Collection` (`collections`) — Marketing Drops & Campaigns

Promotional marketing tags (`Winter Drop 2026`, `Flash Sale`) decoupled from physical categories.

```typescript
export interface ICollection extends Document {
  title: string;                                 // e.g. "Winter Drop 2026"
  slug: string;                                  // e.g. "winter-drop-2026" (Unique, indexed)
  description?: string;
  bannerImage?: {
    url: string;
    key: string;
  };
  badgeText?: string;                            // e.g. "HOT", "SALE 40%", "LIMITED"
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  order: number;
  productCount?: number;                         // Cached count of assigned products
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 4: `Brand` (`brands`) — Multi-Niche Brand Entities

Manages brand entities (Apple, Samsung, Sony, Aurem) for multi-niche stores.

```typescript
export interface IBrand extends Document {
  name: string;                                  // e.g. "Apple" (Unique)
  slug: string;                                  // e.g. "apple" (Unique, indexed)
  logo?: {
    url: string;
    key: string;
  };
  description?: string;
  website?: string;                              // e.g. "https://apple.com"
  featured: boolean;                             // Display in brand carousel
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 5: `Product` (`products`) — Master Catalog Item

The core product document with embedded `variants[]`, `sizeChart[]`, `specifications[]`, and `modifierGroups[]`.

```typescript
export type ProductType = 'REGULAR' | 'CLOTHING' | 'GADGET' | 'FOOD' | 'SERVICE';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type StockStatus = 'AUTO' | 'FORCE_OUT_OF_STOCK' | 'PRE_ORDER';

export interface IProductImage {
  url: string;
  key: string;
}

export interface IVariantOptionGroup {
  name: string;                                  // e.g. "Size", "Color", "RAM", "Storage"
  values: {
    label: string;                               // e.g. "XL", "Acid Black", "16GB"
    meta?: string;                               // Optional Color Hex e.g. "#18181B"
  }[];
}

export interface IVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;                                   // Unique variant SKU
  label?: string;                                // e.g. "XL / Acid Black" or "16GB / 256GB"
  size?: string;                                 // e.g. "S", "M", "L", "XL"
  colorName?: string;
  colorHex?: string;
  attributes?: {
    key: string;                                 // e.g. "RAM", "Region"
    value: string;                               // e.g. "16GB", "USA"
  }[];
  price?: number;                                // Override price (falls back to basePrice)
  discountPrice?: number;
  costPrice?: number;
  wholesalePrice?: number;                       // Future B2B wholesale price
  stock: number;                                 // Granular variant inventory
  stockStatus?: StockStatus;
  image?: IProductImage;                         // Variant-specific image swap
  isDefault?: boolean;
  isActive?: boolean;
}

export interface IModifierGroupOption {
  label: string;                                 // e.g. "Gift Box Packaging", "20W Adapter"
  priceDelta: number;                            // Price modifier (e.g. +150, +1800)
  isAvailable: boolean;
}

export interface IModifierGroup {
  name: string;                                  // Group heading
  isRequired: boolean;
  minSelect?: number;
  maxSelect: number;                             // 1 = Radio, >1 = Checkbox
  options: IModifierGroupOption[];
}

export interface ISizeChartItem {
  size: string;                                  // e.g. "M", "L", "XL"
  chest: string;                                 // Inches
  length: string;
  sleeve?: string;
  waist?: string;
}

export interface ISpecificationGroup {
  groupName: string;                             // e.g. "Performance", "Fabric Specs"
  items: {
    label: string;                               // e.g. "Chipset", "GSM"
    value: string;                               // e.g. "Snapdragon 8 Gen 3", "450 GSM"
  }[];
}

export interface IProduct extends Document {
  title: string;
  slug: string;                                  // Unique, indexed
  description: string;
  productType: ProductType;
  hasVariants: boolean;                          // false = Regular, true = Variant Matrix

  // Taxonomy & Brand
  categoryId?: mongoose.Types.ObjectId | null;   // Reference to Category
  categorySlug?: string;                         // Indexed for flat routing
  categoryPath?: string[];                       // ["men", "topwear", "hoodies"] for breadcrumbs
  primaryCategory: string;                       // Normalized root category name
  brandId?: mongoose.Types.ObjectId | null;      // Optional reference to Brand
  brandName?: string;                            // Denormalized name for zero-join queries
  brandSlug?: string;                            // Indexed for /brand/[slug] filtering
  collections: string[];                         // Array of collection slugs
  tags?: string[];

  // Pricing & Currency
  basePrice: number;                             // Standard Retail price
  discountPrice?: number;                        // Active discounted price
  maxPrice?: number;                             // Highest variant price (powers range display)
  costPrice?: number;
  wholesalePrice?: number;                       // Approved B2B wholesale price
  wholesaleMinQty?: number;                      // Minimum quantity required for wholesale

  // Inventory & Concurrency
  sku?: string;                                  // Root SKU for Regular products
  totalStock: number;                            // Sum of variant stocks or root stock
  stockStatus: StockStatus;
  inStock: boolean;                              // Auto-computed boolean (totalStock > 0)

  // Media
  images: IProductImage[];
  video?: {
    provider: 'YOUTUBE' | 'R2' | 'BUNNY_STREAM';
    url: string;
    videoId?: string;
  };

  // Modular Subdocuments
  variantOptions: IVariantOptionGroup[];
  variants: IVariant[];
  modifierGroups: IModifierGroup[];
  sizeChart: ISizeChartItem[];
  specifications: ISpecificationGroup[];

  // Merchandising & Admin Flags
  isPinned: boolean;
  priority: number;                              // Admin custom sort weight
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 6: `Order` (`orders`) — Full Lifecycle State Machine

Maintains decoupled `orderStatus` and `paymentStatus`, atomic inventory tracking (`inventoryState`), customer details, item snapshots, and courier tracking.

```typescript
export type OrderStatus =
  | 'INCOMPLETE'                                 // Abandoned lead captured on phone blur
  | 'PENDING'                                    // Customer confirmed order; stock deducted
  | 'CONFIRMED'                                  // Staff verified via phone/rules
  | 'PROCESSING'                                 // Packed in warehouse; consignment created
  | 'SHIPPED'                                    // Handed over to courier
  | 'DELIVERED'                                  // Terminal success; customer deliveredCount +1
  | 'CANCELLED'                                  // Pre-dispatch cancel; stock restored atomically
  | 'RETURNED';                                  // Post-dispatch return; stock restored, fraudCount +1

export type PaymentMethod =
  | 'COD'
  | 'SSLCOMMERZ'
  | 'MANUAL_BKASH'
  | 'MANUAL_NAGAD'
  | 'MANUAL_ROCKET'
  | 'BKASH_PGW';

export type PaymentStatus =
  | 'UNPAID'                                     // Initial COD or pre-payment state
  | 'PENDING_VERIFICATION'                       // Manual MFS TrxID submitted; awaiting check
  | 'PAID'                                       // Verified by IPN, SMS webhook, or Admin
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type DeliveryZone =
  | 'INSIDE_DHAKA'                               // Tariff: ৳70
  | 'DHAKA_SUBURBS'                              // Tariff: ৳100 (Gazipur, Savar, Narayanganj)
  | 'OUTSIDE_DHAKA';                             // Tariff: ৳130 (Nationwide 63 districts)

export type InventoryState =
  | 'NONE'                                       // For INCOMPLETE orders (no stock touched)
  | 'RESERVED'                                   // Gateway checkout timer active
  | 'DEDUCTED'                                   // Atomic stock decremented on order confirmation
  | 'RESTORED';                                  // Stock restored on cancel/return (prevents double-restore)

export interface IOrderItemModifierSnapshot {
  groupName: string;
  optionLabel: string;
  priceDelta: number;
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId | null;
  sku: string;
  title: string;
  image: string;
  variantLabel?: string;                         // e.g. "XL / Acid Black"
  size?: string;
  unitPrice: number;                             // Server-authoritative price at purchase
  quantity: number;
  modifiers?: IOrderItemModifierSnapshot[];
  totalPrice: number;                            // (unitPrice + modifiersDelta) * quantity
}

export interface IOrderCustomer {
  name: string;
  phone: string;                                 // Validated 11-digit BD phone: 01XXXXXXXXX
  altPhone?: string;
  address: string;
  deliveryZone: DeliveryZone;
  district?: string;
  thana?: string;
}

export interface IOrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amountDue: number;                             // Remaining balance
  amountPaid: number;                            // Paid via gateway or advance MFS
  advanceFeePaid?: number;                       // Outside-Dhaka advance delivery charge
  trxId?: string;                                // Normalized uppercase TrxID
  senderPhone?: string;                          // Customer bKash/Nagad wallet number
  gatewayRef?: string;                           // SSLCommerz val_id or bank_tran_id
  verifiedBy?: 'IPN' | 'SMS_WEBHOOK' | 'ADMIN' | 'COD_SETTLEMENT';
  verifiedAt?: Date;
}

export interface IOrderCourier {
  provider: 'STEADFAST' | 'PATHAO' | 'REDX';
  consignmentId?: string;                        // Courier portal consignment ID
  trackingCode?: string;                         // Public courier tracking code
  status?: string;                               // Live courier webhook status
  bookingError?: string;
  bookedAt?: Date;
  deliveredAt?: Date;
  returnedAt?: Date;
}

export interface IOrder extends Document {
  orderNumber: string;                           // Human-friendly unique ID: "AUR-1042"
  idempotencyKey?: string;                       // Client UUID to prevent duplicate checkout submissions
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;                           // subtotal + deliveryFee - discountAmount

  orderStatus: OrderStatus;
  payment: IOrderPayment;
  courier: IOrderCourier;
  inventoryState: InventoryState;

  isFraudAlert: boolean;                         // Flagged if customer delivery success < 60%
  customerDeliveryRate?: number;                 // e.g. 54%
  notes?: string;                                // Customer checkout instructions
  adminNotes?: string;                           // Call-center verification notes

  stockReservationExpiresAt?: Date;              // TTL for gateway sessions
  updatedBy?: string;                            // Admin username who modified order
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 7: `User` (`users`) — Authentication & 5-Role RBAC

Unified administrative and customer account model supporting 5 distinct roles.

```typescript
export type UserRole =
  | 'USER'                                       // Retail customer (sees Retail prices only)
  | 'MERCHANT'                                   // Future B2B wholesale buyer (Wholesale price gate)
  | 'MODERATOR'                                  // Call-center staff (orders & inventory; no settings)
  | 'ADMIN'                                      // Store manager (catalog & orders; no StoreConfig)
  | 'SUPER_ADMIN';                               // Platform owner (exclusive StoreConfig & secrets)

export interface IUser extends Document {
  name: string;
  email: string;                                 // Unique, indexed
  phone?: string;                                // 11-digit BD phone
  passwordHash: string;                          // Argon2id / bcrypt hash (Never returned in API)
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;                        // Incremented on password change to revoke old cookies

  // Merchant Wholesale Verification
  merchantApproved?: boolean;                    // true allows wholesale pricing
  companyName?: string;
  tradeLicenseNo?: string;

  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 8: `Customer` (`customers`) — Phone-Indexed Intelligence & Fraud Prevention

Auto-created from phone numbers across guest checkouts; tracks delivery history and fraud risk.

```typescript
export type FraudRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'BLACKLIST';

export interface ICustomer extends Document {
  phone: string;                                 // Primary key: 11-digit BD phone (Unique, indexed)
  name: string;
  defaultAddress?: string;
  defaultDeliveryZone?: DeliveryZone;
  district?: string;

  // Order Intelligence & Fraud Tracking
  totalOrders: number;
  completedDeliveries: number;
  returnedOrders: number;
  cancelledOrders: number;
  totalSpent: number;

  deliverySuccessRate: number;                   // completedDeliveries / totalFulfilled * 100
  fraudRisk: FraudRiskLevel;                     // HIGH if success rate < 60% or >= 2 returns

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 9: `Coupon` (`coupons`) — Discount Engine

Voucher management with spending thresholds, expiration dates, and usage quotas.

```typescript
export type CouponDiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT';

export interface ICoupon extends Document {
  code: string;                                  // Normalized uppercase (Unique, indexed)
  discountType: CouponDiscountType;
  discountValue: number;                         // e.g. 15 (%) or 200 (৳)
  maxDiscountAmount?: number;                    // Cap for percentage discounts (e.g. max ৳500)
  minSpend: number;                              // Minimum subtotal required
  startsAt: Date;
  expiresAt: Date;
  usageLimit?: number;                           // Global total allowed uses
  usedCount: number;                             // Current redemption count
  perPhoneLimit: number;                         // Default: 1 use per customer phone number
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 10: `Review` (`reviews`) — Customer Feedback

Verified customer ratings, text reviews, and uploaded photos.

```typescript
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;            // Reference to Product (Indexed)
  orderId?: mongoose.Types.ObjectId;             // Reference to Order
  customerPhone: string;                         // 11-digit BD phone
  customerName: string;
  rating: number;                                // 1 to 5 stars
  title?: string;
  comment: string;
  photos: {
    url: string;
    key: string;
  }[];
  verifiedPurchase: boolean;                     // true if matched with DELIVERED order
  status: ReviewStatus;                          // Approved by staff before appearing on PDP
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Collection 11: `AuditLog` (`auditlogs`) — Enterprise Compliance & Security Trail

Immutable record of sensitive administrative actions (price changes, status overrides, credential updates).

```typescript
export type AuditAction =
  | 'PRICE_CHANGE'
  | 'STOCK_ADJUSTMENT'
  | 'ORDER_STATUS_OVERRIDE'
  | 'PAYMENT_VERIFICATION'
  | 'COURIER_DISPATCH'
  | 'STORE_CONFIG_UPDATE'
  | 'USER_ROLE_CHANGE'
  | 'ENTITY_DELETE';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;              // Reference to User._id
  actorName: string;
  actorRole: UserRole;
  action: AuditAction;
  targetModel: 'Product' | 'Order' | 'StoreConfig' | 'User' | 'Category' | 'Coupon';
  targetId: string;                              // Document _id or orderNumber
  beforeState?: Record<string, unknown>;         // Snapshot before mutation
  afterState?: Record<string, unknown>;          // Snapshot after mutation
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```

---

## 3. Cross-Collection Relationships & Indexing Strategy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Compound & Single Indexing Specifications                       │
├─────────────────┬──────────────────────────────────────────┬───────────────────────────┤
│ Collection      │ Index Fields                             │ Purpose                   │
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `products`      │ `{ slug: 1 }` (Unique)                   │ Fast PDP lookup           │
│                 │ `{ isActive: 1, categorySlug: 1 }`       │ Category catalog listing  │
│                 │ `{ isActive: 1, brandSlug: 1 }`          │ Brand catalog listing     │
│                 │ `{ isActive: 1, collections: 1 }`        │ Campaign showcase listing │
│                 │ `{ isActive: 1, inStock: 1, basePrice: 1}`│ Price/Stock filter queries│
│                 │ `{ "variants.sku": 1 }`                  │ Barcode/SKU scan lookup   │
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `categories`    │ `{ slug: 1 }` (Unique)                   │ Category routing          │
│                 │ `{ parentId: 1, displayOrder: 1 }`       │ Local sibling reordering  │
│                 │ `{ ancestors: 1 }`                       │ Breadcrumb tree traversal │
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `orders`        │ `{ orderNumber: 1 }` (Unique)            │ Primary order lookup      │
│                 │ `{ idempotencyKey: 1 }` (Unique, Sparse) │ Anti-duplicate checkout   │
│                 │ `{ "customer.phone": 1, createdAt: -1 }` │ Customer order history    │
│                 │ `{ orderStatus: 1, createdAt: -1 }`      │ Admin table status filter │
│                 │ `{ "payment.status": 1 }`                │ Unpaid order auditing     │
│                 │ `{ "payment.trxId": 1 }` (Sparse)        │ MFS duplicate TrxID guard │
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `customers`     │ `{ phone: 1 }` (Unique)                  │ Guest identity & fraud    │
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `coupons`       │ `{ code: 1 }` (Unique)                   │ Case-insensitive code check│
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `users`         │ `{ email: 1 }` (Unique)                  │ Login authentication      │
│                 │ `{ role: 1 }`                            │ RBAC permission queries   │
├─────────────────┼──────────────────────────────────────────┼───────────────────────────┤
│ `auditlogs`     │ `{ targetId: 1, timestamp: -1 }`         │ Entity change history     │
│                 │ `{ actorId: 1, timestamp: -1 }`          │ Staff action audit        │
└─────────────────┴──────────────────────────────────────────┴───────────────────────────┘
```

---

## 4. Request DTO Invariants & Input Validation (Zod Schemas)

Every API route handler must validate incoming request payloads against strict Zod allowlists before touching Mongoose.

### Invariant 1: Server-Authoritative Checkout Input (`CreateOrderDto`)
Client never submits prices or totals. Submits only IDs, quantities, and delivery details.

```typescript
// Strict Zod Allowlist Schema for POST /api/orders
export const CreateOrderSchema = z.object({
  idempotencyKey: z.string().uuid(),             // Prevents double-taps
  customer: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^01[3-9]\d{8}$/, 'Must be an 11-digit BD mobile number'),
    altPhone: z.string().regex(/^01[3-9]\d{8}$/).optional(),
    address: z.string().min(5).max(300),
    deliveryZone: z.enum(['INSIDE_DHAKA', 'DHAKA_SUBURBS', 'OUTSIDE_DHAKA']),
    district: z.string().optional(),
    thana: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string().min(24).max(24),
      variantId: z.string().min(24).max(24).optional().nullable(),
      quantity: z.number().int().min(1).max(20),
      selectedModifiers: z.array(z.string()).optional(),
    })
  ).min(1, 'Cart cannot be empty'),
  paymentMethod: z.enum(['COD', 'SSLCOMMERZ', 'MANUAL_BKASH', 'MANUAL_NAGAD', 'MANUAL_ROCKET']),
  senderPhone: z.string().regex(/^01[3-9]\d{8}$/).optional(),
  trxId: z.string().min(6).max(25).optional(),
  couponCode: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
});
```

### Invariant 2: Bounded Pagination Parameters (`PaginationQueryDto`)

```typescript
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20), // 🔒 HARD CAP: Max 50
  sort: z.enum(['createdAt_desc', 'price_asc', 'price_desc', 'priority_desc']).default('createdAt_desc'),
  q: z.string().max(100).optional(),
});
```

---

## 5. Response Projection & Data Sanitization Rules

To prevent accidental data leaks or over-fetching:

1. **Public Storefront Projection (`getPublicStoreConfig`):**
   ```typescript
   // Explicit exclusion of all encrypted keys and admin flags
   const PUBLIC_CONFIG_PROJECTION =
     '-courier.steadfast.secretKey ' +
     '-courier.pathao.clientSecret ' +
     '-courier.pathao.password ' +
     '-payment.bkashPGW.appSecret ' +
     '-payment.bkashPGW.password ' +
     '-payment.sslCommerz.storePass ' +
     '-tracking.metaCapiToken ' +
     '-tracking.tiktokEventsApiToken';
   ```
2. **Product Catalog Grid Projection (`/shop`, `/category/[slug]`):**
   ```typescript
   // Exclude heavy descriptions, size charts, specifications, and extra variants
   const PRODUCT_CARD_PROJECTION =
     'title slug basePrice discountPrice maxPrice inStock stockStatus ' +
     'primaryCategory hasVariants images brandName brandSlug';
   // images sliced to 1: { images: { $slice: 1 } }
   ```
3. **Guest Order Tracking IDOR Protection (`/api/orders/track`):**
   - Query strictly requires: `{ orderNumber, 'customer.phone': { $regex: `${last4Digits}$` } }`.
   - Never query by `_id` or `orderNumber` alone.

---

## 6. Concurrency, Atomic State Transitions & Idempotency Rules

1. **Atomic Decrement with Stock Guard:**
   ```typescript
   // Variant Product:
   const result = await Product.updateOne(
     {
       _id: productId,
       'variants._id': variantId,
       'variants.stock': { $gte: quantity },     // 🔒 Concurrency Guard
       totalStock: { $gte: quantity },
     },
     {
       $inc: {
         'variants.$.stock': -quantity,
         totalStock: -quantity,
       },
     }
   );
   if (result.matchedCount === 0) {
     throw new Error('OUT_OF_STOCK');
   }
   ```
2. **Anti-Double-Restore Guard (`inventoryState`):**
   - When an order transitions to `CANCELLED` or `RETURNED`, stock is restored ONLY if `order.inventoryState === 'DEDUCTED'`.
   - After incrementing inventory, atomic update sets `inventoryState: 'RESTORED'`.

---

## 7. Step 2 Sign-Off Checklist

- [x] Universal Success (`ApiResponse<T>`) and Error (`ApiErrorResponse`) envelopes locked.
- [x] Standard `ApiErrorCode` machine-readable tokens locked.
- [x] Exact TypeScript interfaces defined for all 11 collections (7 Core + 4 Growth/Taxonomy).
- [x] Decoupled `orderStatus` vs `paymentStatus` state machines locked in `Order`.
- [x] 3-Layer Credential Shield (AES-256) typed in `StoreConfig`.
- [x] 5-Role RBAC permission types locked in `User`.
- [x] Customer phone-indexed intelligence and fraud threshold typed in `Customer`.
- [x] Cross-collection relationship matrix and compound indexes specified.
- [x] Zod allowlist schemas (server-authoritative pricing, checkout idempotency) locked.
- [x] Hard-capped pagination (`limit <= 50`) and projection sanitization locked.
- [x] Atomic concurrency `$inc` guards and double-restore prevention specified.

👉 **Next Step:** `[ধাপ ৩] Automated Seed Engine & Fixtures (npm run db:seed)`
