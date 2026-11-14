import mongoose, { Schema, Document, Model } from 'mongoose';
import { IReview, IProductMedia } from '@/types/domain';

export interface IReviewDocument extends Omit<IReview, '_id' | 'productId' | 'orderId'>, Document {
  productId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
}

const ProductMediaSchema = new Schema<IProductMedia>(
  {
    url: { type: String, required: true },
    key: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    type: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
    videoProvider: {
      type: String,
      enum: ['YOUTUBE', 'VIMEO', 'R2', 'BUNNY_STREAM'],
      default: undefined,
    },
    altText: { type: String, default: '' },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    customerPhone: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, required: true, trim: true },
    media: [ProductMediaSchema],
    verifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    createdBy: { type: String, default: 'CUSTOMER' },
    updatedBy: { type: String, default: 'ADMIN' },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

export const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);

export default Review;
