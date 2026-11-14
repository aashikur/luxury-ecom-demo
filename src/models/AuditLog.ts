import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAuditLog } from '@/types/domain';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id' | 'actorId'>, Document {
  actorId: mongoose.Types.ObjectId;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorName: { type: String, required: true },
    actorRole: {
      type: String,
      enum: ['USER', 'MERCHANT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
      required: true,
    },
    action: {
      type: String,
      enum: [
        'PRICE_CHANGE',
        'STOCK_ADJUSTMENT',
        'ORDER_STATUS_OVERRIDE',
        'PAYMENT_VERIFICATION',
        'COURIER_DISPATCH',
        'STORE_CONFIG_UPDATE',
        'USER_ROLE_CHANGE',
        'ENTITY_DELETE',
      ],
      required: true,
      index: true,
    },
    targetModel: {
      type: String,
      enum: ['Product', 'Order', 'StoreConfig', 'User', 'Category', 'Coupon', 'Brand'],
      required: true,
    },
    targetId: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ targetModel: 1, targetId: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
