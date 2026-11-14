import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategoryImage {
  url: string;
  key: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId | null;
  ancestors: string[]; // Slugs of all parent ancestors in order: e.g. ['men', 'men-tops']
  image?: ICategoryImage;
  level: number;       // 0: Root/Department, 1: Parent Group, 2: Sub-item
  displayOrder: number;
  isFeaturedHome: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    ancestors: [{ type: String, index: true }],
    image: {
      url: { type: String, default: '' },
      key: { type: String, default: '' },
    },
    level: { type: Number, default: 0, index: true },
    displayOrder: { type: Number, default: 0 },
    isFeaturedHome: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String, default: 'ADMIN' },
    updatedBy: { type: String, default: 'ADMIN' },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ level: 1, displayOrder: 1 });
CategorySchema.index({ isFeaturedHome: 1, displayOrder: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
