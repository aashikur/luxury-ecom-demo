/**
 * 11 Universal Collection Domain Interfaces (POJO Standard)
 * Master Specification: docs/pipeline/02-schema-interface-and-response-envelope.md
 */

// ============================================================================
// 1. Shared Primitive Enums & Values
// ============================================================================
export type DeliveryZone = 'INSIDE_DHAKA' | 'DHAKA_SUBURBS' | 'OUTSIDE_DHAKA';

export type ProductType = 'REGULAR' | 'CLOTHING' | 'GADGET' | 'FOOD' | 'SERVICE';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type StockStatus = 'AUTO' | 'FORCE_OUT_OF_STOCK' | 'PRE_ORDER';

export type OrderStatus =
  | 'INCOMPLETE'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod =
  | 'COD'
  | 'SSLCOMMERZ'
  | 'MANUAL_BKASH'
  | 'MANUAL_NAGAD'
  | 'MANUAL_ROCKET'
  | 'BKASH_PGW';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING_VERIFICATION'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type InventoryState = 'NONE' | 'RESERVED' | 'DEDUCTED' | 'RESTORED';

export type UserRole =
  | 'USER'
  | 'MERCHANT'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type FraudRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'BLACKLIST';
export type CouponDiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AuditAction =
  | 'PRICE_CHANGE'
  | 'STOCK_ADJUSTMENT'
  | 'ORDER_STATUS_OVERRIDE'
  | 'PAYMENT_VERIFICATION'
  | 'COURIER_DISPATCH'
  | 'STORE_CONFIG_UPDATE'
  | 'USER_ROLE_CHANGE'
  | 'ENTITY_DELETE';

// ============================================================================
// Collection 1: StoreConfig
// ============================================================================
export interface IStoreConfigBranding {
  storeName: string;
  tagline?: string;
  logoUrl?: string;
  logoKey?: string;
  faviconUrl?: string;
  faviconKey?: string;
  primaryColor?: string;
  accentColor?: string;
  currency: string;
  currencySymbol: string;
}

export interface IStoreConfigLogistics {
  insideDhakaFee: number;
  dhakaSuburbsFee: number;
  outsideDhakaFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryInside: string;
  estimatedDeliveryOutside: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

export interface IStoreConfigPayment {
  cashOnDeliveryEnabled: boolean;
  manualBkashEnabled: boolean;
  manualBkashNumber?: string;
  manualNagadEnabled: boolean;
  manualNagadNumber?: string;
  sslCommerzEnabled: boolean;
  sslStoreId?: string;
  sslStorePassword?: string;
  sslIsSandbox?: boolean;
  advancePaymentRequired: boolean;
  advancePaymentAmount: number;
}

export interface IStoreConfigCourier {
  steadfastEnabled: boolean;
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  steadfastBaseUrl?: string;
  pathaoEnabled: boolean;
  pathaoClientId?: string;
  pathaoClientSecret?: string;
}

export interface IStoreConfigTracking {
  facebookPixelId?: string;
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
  tiktokPixelId?: string;
}

export interface IHomeSection {
  id: string;
  type: 'HERO' | 'BANNER' | 'PRODUCT_GRID' | 'COLLECTION_CAROUSEL' | 'MARQUEE';
  title?: string;
  subtitle?: string;
  collectionSlug?: string;
  limit?: number;
  order: number;
  isActive: boolean;
}

export interface IStoreConfigSections {
  homeSections: IHomeSection[];
}

export interface IStoreConfigFeatures {
  guestCheckoutOnly: boolean;
  enableReviews: boolean;
  enableCoupons: boolean;
  enableStockBadges: boolean;
  maintenanceMode: boolean;
}

export interface IStoreConfig {
  _id?: string;
  key: string;
  branding: IStoreConfigBranding;
  logistics: IStoreConfigLogistics;
  payment: IStoreConfigPayment;
  courier: IStoreConfigCourier;
  tracking: IStoreConfigTracking;
  sections: IStoreConfigSections;
  features: IStoreConfigFeatures;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 2: Category
// ============================================================================
export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  ancestors: string[];
  image?: {
    url: string;
    key: string;
  };
  level: number;
  displayOrder: number;
  isFeaturedHome: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 3: Collection (Marketing Drops)
// ============================================================================
export interface ICollection {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  bannerImage?: {
    url: string;
    key: string;
  };
  featured: boolean;
  order: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 4: Brand
// ============================================================================
export interface IBrand {
  _id?: string;
  name: string;
  slug: string;
  logo?: {
    url: string;
    key: string;
  };
  description?: string;
  website?: string;
  featured: boolean;
  order: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 5: Product
// ============================================================================
export interface IProductMedia {
  url: string;
  key?: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'VIDEO';
  videoProvider?: 'YOUTUBE' | 'VIMEO' | 'R2' | 'BUNNY_STREAM';
  altText?: string;
}

export interface IVariantOptionGroup {
  name: string;
  values: {
    label: string;
    meta?: string;
  }[];
}

export interface IVariantSelectedOption {
  name: string;
  value: string;
}

export interface IVariant {
  _id?: string;
  sku: string;
  title?: string;
  label?: string;
  selectedOptions: IVariantSelectedOption[];
  price?: number;
  discountPrice?: number;
  costPrice?: number;
  wholesalePrice?: number;
  stock: number;
  stockStatus?: StockStatus;
  image?: IProductMedia;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface IModifierGroup {
  name: string;
  isRequired: boolean;
  minSelect?: number;
  maxSelect: number;
  options: {
    label: string;
    priceDelta: number;
    isAvailable: boolean;
  }[];
}

export interface ISizeChartItem {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
  waist?: string;
  hip?: string;
}

export interface IProductSpecification {
  group?: string;
  key: string;
  value: string;
}

export interface IProduct {
  _id?: string;
  title: string;
  slug: string;
  productType: ProductType;
  brandSlug?: string;
  brandName?: string;
  categorySlug: string;
  categoryName?: string;
  categoryPath?: string;
  collections?: string[];
  description?: string;
  highlights?: string[];
  media: IProductMedia[];
  basePrice: number;
  discountPrice?: number;
  maxPrice?: number;
  costPrice?: number;
  wholesalePrice?: number;
  hasVariants: boolean;
  variantOptions?: IVariantOptionGroup[];
  variants?: IVariant[];
  sizeChart?: ISizeChartItem[];
  specifications?: IProductSpecification[];
  modifierGroups?: IModifierGroup[];
  totalStock: number;
  stockStatus: StockStatus;
  inStock: boolean;
  priority: number;
  isPinned: boolean;
  status: ProductStatus;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 6: Order
// ============================================================================
export interface IOrderItemModifierSnapshot {
  groupName: string;
  optionLabel: string;
  priceDelta: number;
}

export interface IOrderItem {
  productId: string;
  variantId?: string | null;
  sku?: string;
  title: string;
  image: string;
  variantLabel?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  modifiers?: IOrderItemModifierSnapshot[];
  totalPrice?: number;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  altPhone?: string;
  address: string;
  deliveryZone: DeliveryZone;
  district?: string;
  thana?: string;
  note?: string;
}

export interface IOrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amountDue?: number;
  amountPaid?: number;
  advanceFeePaid?: number;
  trxId?: string;
  senderPhone?: string;
  gatewayRef?: string;
  verifiedBy?: 'IPN' | 'SMS_WEBHOOK' | 'ADMIN' | 'COD_SETTLEMENT';
  verifiedAt?: Date;
}

export interface IOrderCourier {
  provider?: 'STEADFAST' | 'PATHAO' | 'REDX' | null;
  consignmentId?: string;
  trackingCode?: string;
  status?: string;
  bookingError?: string;
  bookedAt?: Date;
  deliveredAt?: Date;
  returnedAt?: Date;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  idempotencyKey?: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  payment: IOrderPayment;
  courier?: IOrderCourier;
  inventoryState: InventoryState;
  isFraudAlert?: boolean;
  customerDeliveryRate?: number;
  notes?: string;
  adminNotes?: string;
  stockReservationExpiresAt?: Date;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 7: User
// ============================================================================
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  sessionVersion: number;
  merchantApproved?: boolean;
  companyName?: string;
  tradeLicenseNo?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 8: Customer
// ============================================================================
export interface ICustomer {
  _id?: string;
  phone: string;
  name: string;
  defaultAddress?: string;
  defaultDeliveryZone?: DeliveryZone;
  district?: string;
  totalOrders: number;
  completedDeliveries: number;
  returnedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  deliverySuccessRate: number;
  fraudRisk: FraudRiskLevel;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 9: Coupon
// ============================================================================
export interface ICoupon {
  _id?: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minSpend: number;
  startsAt: Date;
  expiresAt: Date;
  usageLimit?: number;
  usedCount: number;
  perPhoneLimit: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 10: Review
// ============================================================================
export interface IReview {
  _id?: string;
  productId: string;
  orderId?: string;
  customerPhone: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  media?: IProductMedia[];
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Collection 11: AuditLog
// ============================================================================
export interface IAuditLog {
  _id?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: AuditAction;
  targetModel: 'Product' | 'Order' | 'StoreConfig' | 'User' | 'Category' | 'Coupon' | 'Brand';
  targetId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}
