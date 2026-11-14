import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '@/types/domain';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['USER', 'MERCHANT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
      default: 'USER',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    sessionVersion: { type: Number, default: 1 },
    merchantApproved: { type: Boolean, default: false },
    companyName: { type: String, default: '' },
    tradeLicenseNo: { type: String, default: '' },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
