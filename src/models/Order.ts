import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * ============================================================================
 * LESSON: Bangladesh E-Commerce Order Schema (COD + Manual MFS + Courier)
 * ============================================================================
 * 
 * SPECIAL CONCEPTS:
 * 1. 'INCOMPLETE' status: Captured as an Abandoned Cart lead as soon as customer
 *    types a valid BD phone number, even if they drop off before clicking "Order".
 * 2. Manual MFS fields: Captures `senderPhone` and `trxId` for manual verification.
 * 3. Courier payload: Holds Steadfast consignment ID and live tracking code.
 */

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string; // e.g. "ORD-10042"
  customer: {
    name: string;
    phone: string;
    address: string;
    deliveryZone: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA';
    note?: string;
  };
  items: IOrderItem[];
  financials: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    totalAmount: number;
    isAdvancePaid: boolean;
    advanceAmount: number;
  };
  payment: {
    method: 'COD' | 'MANUAL_BKASH' | 'MANUAL_NAGAD' | 'BKASH_PGW';
    senderPhone?: string;
    trxId?: string;
    status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID';
  };
  status:
    | 'INCOMPLETE' // Abandoned cart lead
    | 'PENDING'    // New order, waiting merchant call
    | 'CONFIRMED'  // Approved for packing
    | 'SHIPPED'    // In transit with courier
    | 'DELIVERED'  // Successfully completed
    | 'CANCELLED'  // Cancelled by buyer or merchant
    | 'RETURNED';  // Returned by courier
  courier?: {
    provider: 'STEADFAST' | 'PATHAO' | 'REDX' | null;
    consignmentId?: string;
    trackingCode?: string;
    status?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, index: true, trim: true },
      address: { type: String, required: true, trim: true },
      deliveryZone: {
        type: String,
        enum: ['INSIDE_DHAKA', 'OUTSIDE_DHAKA'],
        required: true,
      },
      note: { type: String, default: '' },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
      },
    ],
    financials: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      isAdvancePaid: { type: Boolean, default: false },
      advanceAmount: { type: Number, default: 0 },
    },
    payment: {
      method: {
        type: String,
        enum: ['COD', 'MANUAL_BKASH', 'MANUAL_NAGAD', 'BKASH_PGW'],
        default: 'COD',
      },
      senderPhone: { type: String, default: '' },
      trxId: { type: String, default: '' },
      status: {
        type: String,
        enum: ['UNPAID', 'PENDING_VERIFICATION', 'PAID'],
        default: 'UNPAID',
      },
    },
    status: {
      type: String,
      enum: [
        'INCOMPLETE',
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'PENDING',
      index: true,
    },
    courier: {
      provider: {
        type: String,
        enum: ['STEADFAST', 'PATHAO', 'REDX', null],
        default: null,
      },
      consignmentId: { type: String, default: '' },
      trackingCode: { type: String, default: '' },
      status: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
