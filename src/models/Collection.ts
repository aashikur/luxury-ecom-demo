import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollectionImage {
  url: string;
  key: string;
}

export interface ICollection extends Document {
  title: string;
  slug: string;
  description?: string;
  bannerImage?: ICollectionImage;
  badgeText?: string; // e.g. "FLAT 20% OFF", "LIMITED DROP"
  displayOrder: number;
  isFeaturedHome: boolean;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    bannerImage: {
      url: { type: String, default: '' },
      key: { type: String, default: '' },
    },
    badgeText: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isFeaturedHome: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ isFeaturedHome: 1, displayOrder: 1 });

export const Collection: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

export default Collection;
