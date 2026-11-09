import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId | null;
  sku?: string;
  title: string;
  image: string;

  // Backward-compatible: `size` is optional now; `variantLabel` covers Clothing, Gadgets, and Regular items
  size?: string;
  variantLabel?: string; // e.g. "XL / Charcoal" or "12GB / 256GB / Official"
  attributes?: {
    key: string;
    value: string;
  }[];
  modifiers?: {
    label: string;
    priceDelta: number;
  }[];

  quantity: number;
  unitPrice: number; // Final unit price (Variant Price + Modifiers)
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
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
    method: 'COD' | 'MANUAL_BKASH' | 'MANUAL_NAGAD' | 'BKASH_PGW' | 'SSLCOMMERZ';
    senderPhone?: string;
    trxId?: string;
    status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID';
  };
  status:
    | 'INCOMPLETE'
    | 'PENDING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURNED';
  courier?: {
    provider: 'STEADFAST' | 'PATHAO' | 'REDX' | null;
    consignmentId?: string;
    trackingCode?: string;
    status?: string;
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, index: true, trim: true },
      email: { type: String, default: '', trim: true },
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
        variantId: { type: Schema.Types.ObjectId, default: null },
        sku: { type: String, default: '' },
        title: { type: String, required: true },
        image: { type: String, required: true },
        size: { type: String, default: '' }, // Optional so Regular & Gadget products don't fail validation
        variantLabel: { type: String, default: '' },
        attributes: [
          {
            key: { type: String },
            value: { type: String },
          },
        ],
        modifiers: [
          {
            label: { type: String },
            priceDelta: { type: Number, default: 0 },
          },
        ],
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
        enum: ['COD', 'MANUAL_BKASH', 'MANUAL_NAGAD', 'BKASH_PGW', 'SSLCOMMERZ'],
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
    createdBy: { type: String, default: 'CUSTOMER' },
    updatedBy: { type: String, default: 'SYSTEM' },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
