import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductType = 'REGULAR' | 'CLOTHING' | 'GADGET' | 'FOOD' | 'SERVICE';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type StockStatus = 'AUTO' | 'FORCE_OUT_OF_STOCK' | 'PRE_ORDER';

export interface IProductImage {
  url: string;
  key: string;
}

// 1. Dynamic Variant Axis (Renders selector buttons on PDP: e.g. Size, Color, RAM, Storage, Region)
export interface IVariantOptionGroup {
  name: string;        // e.g. "Size", "Color", "RAM", "Storage", "Warranty"
  values: {
    label: string;     // e.g. "XL", "Titanium Black", "12GB", "256GB"
    meta?: string;     // Optional Color Hex e.g. "#18181B"
  }[];
}

// 2. Universal Variant Item (Supports Clothing Sizes + Gadget RAM/ROM Pricing & Stock)
export interface IVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  label?: string;      // Auto-computed or custom: e.g. "XL / Black" or "12GB / 256GB / Official"

  // Backward-compatible Clothing fields (no strict enum so Regular/Gadgets/Shoes don't break)
  size?: string;       // e.g. "S", "M", "L", "XL", "XXL", "42", "Free Size", or ""
  colorName?: string;
  colorHex?: string;

  // Dynamic Key-Value Attributes for Gadgets & Multi-Axis Products
  attributes?: {
    key: string;       // e.g. "RAM", "Storage", "Region"
    value: string;     // e.g. "12GB", "256GB", "Official"
  }[];

  // Variant-Level Pricing (If undefined on Clothing, falls back to root Product basePrice/discountPrice)
  price?: number;
  discountPrice?: number;
  costPrice?: number;

  // Variant Inventory Control
  stock: number;
  stockStatus?: StockStatus; // Allows forcing a single variant OOS without losing `stock` count
  image?: IProductImage;     // Optional variant-specific image swap
  isDefault?: boolean;
  isActive?: boolean;
}

// 3. Add-on / Modifier Groups (For Food Toppings, Gadget Accessories/Care+, Gift Packaging)
export interface IModifierGroup {
  name: string;        // e.g. "Extra Toppings", "Add Accessories", "Packaging"
  isRequired: boolean;
  minSelect?: number;
  maxSelect: number;   // 1 = Radio, >1 = Checkboxes
  options: {
    label: string;     // e.g. "Original 20W Adapter", "Extra Cheese"
    priceDelta: number;// Added to unit price: e.g. +1800 or +60
    isAvailable: boolean;
  }[];
}

// 4. Garment Size Chart (Used when productType === 'CLOTHING')
export interface ISizeChartItem {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
}

// 5. Technical Specifications (Used when productType === 'GADGET' or Fabric Care)
export interface ISpecificationGroup {
  groupName: string;   // e.g. "Display", "Performance", "Battery"
  items: {
    label: string;     // e.g. "Chipset"
    value: string;     // e.g. "Snapdragon 8 Gen 3"
  }[];
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  productType: ProductType;
  hasVariants: boolean; // false = Regular Single Product, true = Variant Matrix Product

  // Taxonomy & Merchandising
  categoryId?: mongoose.Types.ObjectId | null;
  categorySlug?: string;
  categoryPath?: string[];
  primaryCategory: string;
  brandName?: string;
  collections: string[];
  tags?: string[];

  // Root Pricing & Inventory (Direct for Regular products; Auto-synced for Variant products)
  basePrice: number;
  discountPrice?: number;
  maxPrice?: number;    // Highest variant effective price (powers "৳1,18,000 - ৳1,45,000" display)
  costPrice?: number;
  sku?: string;         // Root SKU for Regular products
  totalStock: number;   // Root stock for Regular products, or sum of active variants[] stock
  stockStatus: StockStatus;
  inStock: boolean;     // Auto-computed boolean for instant UI badge & filter queries

  // Media
  images: IProductImage[];
  video?: {
    provider: 'YOUTUBE' | 'R2' | 'BUNNY_STREAM';
    url: string;
    videoId?: string;
  };

  // Flexible Engines
  variantOptions: IVariantOptionGroup[];
  variants: IVariant[];
  modifierGroups: IModifierGroup[];
  sizeChart: ISizeChartItem[];
  specifications: ISpecificationGroup[];

  // Publishing & Ordering Control
  status: ProductStatus;
  isActive: boolean;    // Auto-synced: true when status === 'PUBLISHED'
  isPinned: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    productType: {
      type: String,
      enum: ['REGULAR', 'CLOTHING', 'GADGET', 'FOOD', 'SERVICE'],
      default: 'CLOTHING',
      index: true,
    },
    hasVariants: { type: Boolean, default: true },

    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    categorySlug: { type: String, default: '', index: true },
    categoryPath: [{ type: String, index: true }],
    primaryCategory: { type: String, required: true, index: true },
    brandName: { type: String, default: '', index: true },
    collections: [{ type: String, index: true }],
    tags: [{ type: String, index: true }],

    basePrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    maxPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    sku: { type: String, default: '', trim: true },
    totalStock: { type: Number, default: 0, min: 0, index: true },
    stockStatus: {
      type: String,
      enum: ['AUTO', 'FORCE_OUT_OF_STOCK', 'PRE_ORDER'],
      default: 'AUTO',
    },
    inStock: { type: Boolean, default: true, index: true },

    images: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
    ],
    video: {
      provider: {
        type: String,
        enum: ['YOUTUBE', 'R2', 'BUNNY_STREAM'],
        default: 'YOUTUBE',
      },
      url: { type: String, default: '' },
      videoId: { type: String, default: '' },
    },

    variantOptions: [
      {
        name: { type: String, required: true },
        values: [
          {
            label: { type: String, required: true },
            meta: { type: String, default: '' },
          },
        ],
      },
    ],

    variants: [
      {
        sku: { type: String, required: true, trim: true },
        label: { type: String, default: '' },
        size: { type: String, default: '' },
        colorName: { type: String, default: '' },
        colorHex: { type: String, default: '' },
        attributes: [
          {
            key: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        price: { type: Number, min: 0 },
        discountPrice: { type: Number, min: 0 },
        costPrice: { type: Number, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },
        stockStatus: {
          type: String,
          enum: ['AUTO', 'FORCE_OUT_OF_STOCK', 'PRE_ORDER'],
          default: 'AUTO',
        },
        image: {
          url: { type: String, default: '' },
          key: { type: String, default: '' },
        },
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
      },
    ],

    modifierGroups: [
      {
        name: { type: String, required: true },
        isRequired: { type: Boolean, default: false },
        minSelect: { type: Number, default: 0 },
        maxSelect: { type: Number, default: 1 },
        options: [
          {
            label: { type: String, required: true },
            priceDelta: { type: Number, required: true, default: 0 },
            isAvailable: { type: Boolean, default: true },
          },
        ],
      },
    ],

    sizeChart: [
      {
        size: { type: String, required: true },
        chest: { type: String, required: true },
        length: { type: String, required: true },
        sleeve: { type: String, default: '' },
      },
    ],

    specifications: [
      {
        groupName: { type: String, required: true },
        items: [
          {
            label: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
    ],

    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isPinned: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

/**
 * PRE-SAVE HOOK:
 * 1. Syncs `status` <-> `isActive` for backward compatibility.
 * 2. Auto-computes variant labels, `totalStock`, `inStock`, and `maxPrice`.
 */
ProductSchema.pre('save', function () {
  // 1. Sync status and isActive
  if (this.isModified('status')) {
    this.isActive = this.status === 'PUBLISHED';
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'PUBLISHED' : 'DRAFT';
  }

  // 2. Variant vs Regular Product Calculations
  if (this.hasVariants && this.variants && this.variants.length > 0) {
    const activeVariants = this.variants.filter((v) => v.isActive !== false);

    // Sum physical warehouse stock without destroying counts on FORCE_OUT_OF_STOCK
    this.totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

    // Auto-build readable label for each variant if omitted
    activeVariants.forEach((v) => {
      if (!v.label) {
        if (v.attributes && v.attributes.length > 0) {
          v.label = v.attributes.map((a) => a.value).join(' / ');
        } else {
          v.label = [v.size, v.colorName].filter(Boolean).join(' / ') || v.sku;
        }
      }
    });

    // Compute price range if variants have custom prices (e.g. Gadgets / XXL clothing)
    const effectivePrices = activeVariants.map(
      (v) => v.discountPrice ?? v.price ?? this.discountPrice ?? this.basePrice
    );
    if (effectivePrices.length > 0) {
      this.maxPrice = Math.max(...effectivePrices);
    }

    // Determine if at least one variant is purchasable
    const hasBuyableVariant = activeVariants.some((v) => {
      if (v.stockStatus === 'FORCE_OUT_OF_STOCK') return false;
      if (v.stockStatus === 'PRE_ORDER') return true;
      return (v.stock || 0) > 0;
    });

    if (this.stockStatus === 'FORCE_OUT_OF_STOCK') {
      this.inStock = false;
    } else if (this.stockStatus === 'PRE_ORDER') {
      this.inStock = true;
    } else {
      this.inStock = hasBuyableVariant;
    }
  } else {
    // Regular single product (no variants)
    this.hasVariants = false;
    this.maxPrice = this.discountPrice ?? this.basePrice;

    if (this.stockStatus === 'FORCE_OUT_OF_STOCK') {
      this.inStock = false;
    } else if (this.stockStatus === 'PRE_ORDER') {
      this.inStock = true;
    } else {
      this.inStock = (this.totalStock || 0) > 0;
    }
  }
});



// ESR (Equality -> Sort -> Range) Compound Indexes for zero-in-memory-sort catalog queries
ProductSchema.index({ isActive: 1, isPinned: -1, priority: -1, createdAt: -1 });
ProductSchema.index({ categorySlug: 1, isActive: 1, isPinned: -1, priority: -1, createdAt: -1 });
ProductSchema.index({ categoryPath: 1, isActive: 1, isPinned: -1, priority: -1, createdAt: -1 });
ProductSchema.index({ collections: 1, isActive: 1, isPinned: -1, priority: -1, createdAt: -1 });
ProductSchema.index({ 'variants.attributes.key': 1, 'variants.attributes.value': 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
