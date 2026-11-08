import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * ============================================================================
 * LESSON: Production Garments Product Schema (Mongoose + TypeScript)
 * ============================================================================
 * 
 * DESIGN HIGHLIGHTS:
 * 1. Collections Architecture: Flexible tagging ('hoodies', 'winter-2026', 'flash-sale')
 *    instead of rigid booleans (Shopify style).
 * 2. SKU / Variant Matrix: S, M, L, XL, XXL with individual inventory tracking.
 * 3. Garment Size Chart: Chest, length, and sleeve measurements in inches.
 * 4. Priority / Pinned: Allows admin to pin star products to the top.
 */

export interface IVariant {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  stock: number;
  sku: string;
  colorName?: string;
  colorHex?: string;
}

export interface ISizeChartItem {
  size: string;
  chest: string;
  length: string;
  sleeve?: string;
}

export interface IProductImage {
  url: string;
  key: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  primaryCategory: string; // e.g. "Hoodie", "T-Shirt", "Panjabi"
  collections: string[];   // e.g. ["hoodies", "winter-drop", "featured", "flash-sale"]
  basePrice: number;
  discountPrice?: number;
  images: IProductImage[];
  video?: {
    provider: 'YOUTUBE' | 'R2' | 'BUNNY_STREAM';
    url: string;
    videoId?: string;
  };
  variants: IVariant[];
  sizeChart: ISizeChartItem[];
  isPinned: boolean;       // Pin to top of catalog
  priority: number;        // Higher priority appears first (default: 0)
  isActive: boolean;       // Published or draft
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    primaryCategory: { type: String, required: true, index: true },
    collections: [{ type: String, index: true }], // Indexed for lightning-fast collection queries
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
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
    variants: [
      {
        size: {
          type: String,
          enum: ['S', 'M', 'L', 'XL', 'XXL'],
          required: true,
        },
        stock: { type: Number, required: true, min: 0, default: 0 },
        sku: { type: String, required: true },
        colorName: { type: String, default: '' },
        colorHex: { type: String, default: '' },
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
    isPinned: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimal storefront catalog ordering:
// Sorts by isPinned (top) -> priority (descending) -> newest first (createdAt descending)
ProductSchema.index({ isPinned: -1, priority: -1, createdAt: -1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
