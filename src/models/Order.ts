import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryZone,
  InventoryState,
} from '@/types/domain';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId | null;
  sku?: string;
  title: string;
  image: string;
  size?: string;
  variantLabel?: string;
  attributes?: {
    key: string;
    value: string;
  }[];
  modifiers?: {
    groupName?: string;
    optionLabel?: string;
    label?: string;
    priceDelta: number;
  }[];
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address: string;
  deliveryZone: DeliveryZone;
  district?: string;
  thana?: string;
  note?: string;
}

export interface IOrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amountDue?: number;
  amountPaid?: number;
  advanceFeePaid?: number;
  senderPhone?: string;
  trxId?: string;
  gatewayRef?: string;
  verifiedBy?: 'IPN' | 'SMS_WEBHOOK' | 'ADMIN' | 'COD_SETTLEMENT';
  verifiedAt?: Date;
}

export interface IOrderCourier {
  provider: 'STEADFAST' | 'PATHAO' | 'REDX' | null;
  consignmentId?: string;
  trackingCode?: string;
  status?: string;
  bookingError?: string;
  bookedAt?: Date;
  deliveredAt?: Date;
  returnedAt?: Date;
}

export interface IOrderFinancials {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  isAdvancePaid: boolean;
  advanceAmount: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  idempotencyKey?: string;
  customer: IOrderCustomer;
  items: IOrderItem[];

  // Top-level financials (Step 2 Standard)
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;

  // Backward-compatible nested financials
  financials: IOrderFinancials;

  // Decoupled state machines
  orderStatus: OrderStatus;
  status: OrderStatus; // Backward-compatible alias
  payment: IOrderPayment;
  inventoryState: InventoryState;

  courier?: IOrderCourier;
  isFraudAlert?: boolean;
  customerDeliveryRate?: number;
  notes?: string;
  adminNotes?: string;
  stockReservationExpiresAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, sparse: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, index: true, trim: true },
      altPhone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
      address: { type: String, required: true, trim: true },
      deliveryZone: {
        type: String,
        enum: ['INSIDE_DHAKA', 'DHAKA_SUBURBS', 'OUTSIDE_DHAKA'],
        required: true,
      },
      district: { type: String, default: '' },
      thana: { type: String, default: '' },
      note: { type: String, default: '' },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Schema.Types.ObjectId, default: null },
        sku: { type: String, default: '' },
        title: { type: String, required: true },
        image: { type: String, required: true },
        size: { type: String, default: '' },
        variantLabel: { type: String, default: '' },
        attributes: [
          {
            key: { type: String },
            value: { type: String },
          },
        ],
        modifiers: [
          {
            groupName: { type: String },
            optionLabel: { type: String },
            label: { type: String },
            priceDelta: { type: Number, default: 0 },
          },
        ],
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, default: 0 },
      },
    ],

    // Top-Level Financials
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    totalAmount: { type: Number, required: true },

    // Backward-compatible nested financials
    financials: {
      subtotal: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      isAdvancePaid: { type: Boolean, default: false },
      advanceAmount: { type: Number, default: 0 },
    },

    // Decoupled Statuses
    orderStatus: {
      type: String,
      enum: [
        'INCOMPLETE',
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'PENDING',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'INCOMPLETE',
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'PENDING',
      index: true,
    },

    inventoryState: {
      type: String,
      enum: ['NONE', 'RESERVED', 'DEDUCTED', 'RESTORED'],
      default: 'DEDUCTED',
      index: true,
    },

    payment: {
      method: {
        type: String,
        enum: [
          'COD',
          'SSLCOMMERZ',
          'MANUAL_BKASH',
          'MANUAL_NAGAD',
          'MANUAL_ROCKET',
          'BKASH_PGW',
        ],
        default: 'COD',
      },
      status: {
        type: String,
        enum: [
          'UNPAID',
          'PENDING_VERIFICATION',
          'PAID',
          'FAILED',
          'CANCELLED',
          'REFUNDED',
        ],
        default: 'UNPAID',
      },
      amountDue: { type: Number, default: 0 },
      amountPaid: { type: Number, default: 0 },
      advanceFeePaid: { type: Number, default: 0 },
      senderPhone: { type: String, default: '' },
      trxId: { type: String, default: '', trim: true, uppercase: true },
      gatewayRef: { type: String, default: '' },
      verifiedBy: {
        type: String,
        enum: ['IPN', 'SMS_WEBHOOK', 'ADMIN', 'COD_SETTLEMENT'],
      },
      verifiedAt: { type: Date },
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
      bookingError: { type: String, default: '' },
      bookedAt: { type: Date },
      deliveredAt: { type: Date },
      returnedAt: { type: Date },
    },

    isFraudAlert: { type: Boolean, default: false },
    customerDeliveryRate: { type: Number },
    notes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    stockReservationExpiresAt: { type: Date },
    createdBy: { type: String, default: 'CUSTOMER' },
    updatedBy: { type: String, default: 'SYSTEM' },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for fast, bounded queries
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ 'customer.phone': 1, createdAt: -1 });

// Pre-save synchronization hook to ensure dual compatibility
OrderSchema.pre('validate', function () {
  // Sync status and orderStatus
  if (this.orderStatus && !this.status) {
    this.status = this.orderStatus;
  } else if (this.status && !this.orderStatus) {
    this.orderStatus = this.status;
  } else if (this.isModified('orderStatus')) {
    this.status = this.orderStatus;
  } else if (this.isModified('status')) {
    this.orderStatus = this.status;
  }

  // Sync nested financials and top-level financials
  if (this.subtotal !== undefined) {
    if (!this.financials) {
      this.financials = {
        subtotal: this.subtotal,
        deliveryFee: this.deliveryFee || 0,
        discount: this.discountAmount || 0,
        totalAmount: this.totalAmount || this.subtotal + (this.deliveryFee || 0),
        isAdvancePaid: false,
        advanceAmount: 0,
      };
    } else {
      this.financials.subtotal = this.subtotal;
      this.financials.deliveryFee = this.deliveryFee;
      this.financials.discount = this.discountAmount;
      this.financials.totalAmount = this.totalAmount;
    }
  } else if (this.financials) {
    this.subtotal = this.financials.subtotal;
    this.deliveryFee = this.financials.deliveryFee;
    this.discountAmount = this.financials.discount || 0;
    this.totalAmount = this.financials.totalAmount;
  }
});

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
