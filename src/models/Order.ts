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
    | 'INCOMPLETE' // Abandoned cart lead (customer entered phone number but dropped off)
    | 'PENDING'    // New order submitted by buyer; awaiting merchant call/confirmation
    | 'CONFIRMED'  // Order approved by merchant; packed and ready for handover
    | 'SHIPPED'    // Parcel handed over to courier (e.g. Steadfast) with tracking code
    | 'DELIVERED'  // Successfully received by customer and COD cash collected
    | 'CANCELLED'  // Cancelled by customer or rejected by merchant (e.g. fake lead/fraud)
    | 'RETURNED';  // Customer rejected parcel at doorstep; courier returning goods
  courier?: {
    provider: 'STEADFAST' | 'PATHAO' | 'REDX' | null;
    consignmentId?: string;
    trackingCode?: string;
    status?: string;
  };
  createdBy?: string; // 'CUSTOMER' or admin operator identifier e.g. 'ADMIN: Ashikur Rahaman'
  updatedBy?: string; // Audit trail of last admin operator who touched or approved order
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
        // ১. INCOMPLETE: কাস্টমার চেকআউটে শুধু ফোন নাম্বার টাইপ করেছে কিন্তু "অর্ডার করুন" বাটনে ক্লিক করেনি।
        // এতে কাস্টমারের লিড ডাটাবেজে ড্রাফট হয়ে যায় যাতে কল সেন্টারের এজেন্ট ফোন দিয়ে সেল কনভার্ট করতে পারে (Abandoned Cart Recovery)।
        'INCOMPLETE',

        // ২. PENDING: কাস্টমার সফলভাবে অর্ডার প্লেস করেছে। এখন মার্চেন্ট বা কল সেন্টার টিম কাস্টমারকে ফোন দিয়ে অর্ডার ভেরিফাই করবে।
        'PENDING',

        // ৩. CONFIRMED: মার্চেন্ট কাস্টমারের সাথে কথা বলে অর্ডার কনফার্ম করেছে। পার্সেল প্যাকিং হয়ে কুরিয়ারের জন্য রেডি।
        'CONFIRMED',

        // ৪. SHIPPED: পার্সেলটি কুরিয়ার কোম্পানির (e.g. Steadfast/Pathao) কাছে হ্যান্ডওভার করা হয়েছে এবং ট্র্যাকিং কোড জেনারেট হয়েছে।
        'SHIPPED',

        // ৫. DELIVERED: কাস্টমার প্রোডাক্ট হাতে পেয়েছে এবং ক্যাশ টাকা কুরিয়ার ডেলিভারি বয়কে বুঝিয়ে দিয়েছে (সাকসেসফুল সেল)।
        'DELIVERED',

        // ৬. CANCELLED: কাস্টমার ফোনে বলেছে অর্ডার লাগবে না, অথবা ভুয়া/ফেইক অর্ডার ধরা পড়ায় মার্চেন্ট ক্যান্সেল করে দিয়েছে।
        'CANCELLED',

        // ৭. RETURNED: কুরিয়ার ডেলিভারি করতে গিয়ে কাস্টমারকে পায়নি বা কাস্টমার পার্সেল রিসিভ করতে অস্বীকৃতি জানিয়েছে, ফলে পার্সেলটি মার্চেন্টের কাছে ফেরত আসছে।
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
