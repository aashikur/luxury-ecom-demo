import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICoupon } from '@/types/domain';

export interface ICouponDocument extends Omit<ICoupon, '_id'>, Document {}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT_AMOUNT'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number },
    minSpend: { type: Number, default: 0 },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    perPhoneLimit: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String, default: 'ADMIN' },
    updatedBy: { type: String, default: 'ADMIN' },
  },
  {
    timestamps: true,
  }
);

CouponSchema.index({ code: 1, isActive: 1 });

export const Coupon: Model<ICouponDocument> =
  mongoose.models.Coupon || mongoose.model<ICouponDocument>('Coupon', CouponSchema);

export default Coupon;
