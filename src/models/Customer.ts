import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICustomer } from '@/types/domain';

export interface ICustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    defaultAddress: { type: String, default: '' },
    defaultDeliveryZone: {
      type: String,
      enum: ['INSIDE_DHAKA', 'DHAKA_SUBURBS', 'OUTSIDE_DHAKA'],
      default: 'INSIDE_DHAKA',
    },
    district: { type: String, default: '' },
    totalOrders: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    returnedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    deliverySuccessRate: { type: Number, default: 100 },
    fraudRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'BLACKLIST'],
      default: 'LOW',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ fraudRisk: 1, deliverySuccessRate: 1 });

export const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);

export default Customer;
