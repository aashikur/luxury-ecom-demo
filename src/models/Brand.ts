import mongoose, { Schema, Document, Model } from 'mongoose';
import { IBrand } from '@/types/domain';

export interface IBrandDocument extends Omit<IBrand, '_id'>, Document {}

const BrandSchema = new Schema<IBrandDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    logo: {
      url: { type: String },
      key: { type: String },
    },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String, default: 'ADMIN' },
    updatedBy: { type: String, default: 'ADMIN' },
  },
  {
    timestamps: true,
  }
);

BrandSchema.index({ featured: 1, order: 1 });

export const Brand: Model<IBrandDocument> =
  mongoose.models.Brand || mongoose.model<IBrandDocument>('Brand', BrandSchema);

export default Brand;
