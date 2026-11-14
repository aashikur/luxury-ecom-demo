import { connectDB } from '@/lib/db';
import Coupon, { ICouponDocument } from '@/models/Coupon';
import Order from '@/models/Order';
import { ICoupon } from '@/types/domain';
import { ApiPaginationMeta } from '@/types/api';
import { normalizeBDPhone } from './order.service';

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountAmount: number;
  reason?: string;
  coupon?: ICoupon;
}

export interface GetCouponsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface CouponsListResult {
  coupons: ICoupon[];
  pagination: ApiPaginationMeta;
}

/**
 * Validates a coupon code against subtotal, date expiry, usage limits, and phone limits.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  customerPhone?: string
): Promise<CouponValidationResult> {
  await connectDB();

  if (!rawCode || !rawCode.trim()) {
    return { isValid: false, code: '', discountAmount: 0, reason: 'Coupon code is required' };
  }

  const code = rawCode.trim().toUpperCase();
  const now = new Date();

  const coupon = await Coupon.findOne({
    code,
    isActive: true,
  });

  if (!coupon) {
    return { isValid: false, code, discountAmount: 0, reason: 'Invalid or inactive coupon code' };
  }

  // 1. Date window check
  if (coupon.startsAt && coupon.startsAt > now) {
    return { isValid: false, code, discountAmount: 0, reason: 'Coupon promotion has not started yet' };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { isValid: false, code, discountAmount: 0, reason: 'Coupon code has expired' };
  }

  // 2. Minimum Spend check
  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      isValid: false,
      code,
      discountAmount: 0,
      reason: `Minimum order amount of ৳${coupon.minSpend} required for this coupon`,
    };
  }

  // 3. Global usage limit check
  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return { isValid: false, code, discountAmount: 0, reason: 'Coupon usage limit has been reached' };
  }

  // 4. Per-Phone usage limit check
  if (customerPhone && coupon.perPhoneLimit) {
    const normalizedPhone = normalizeBDPhone(customerPhone);
    const usedByPhone = await Order.countDocuments({
      'customer.phone': normalizedPhone,
      couponCode: code,
      orderStatus: { $nin: ['CANCELLED', 'INCOMPLETE'] },
    });

    if (usedByPhone >= coupon.perPhoneLimit) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        reason: `You have already used this coupon maximum (${coupon.perPhoneLimit}) times`,
      };
    }
  }

  // 5. Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    // FLAT_AMOUNT
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    isValid: true,
    code,
    discountAmount,
    coupon: JSON.parse(JSON.stringify(coupon)) as ICoupon,
  };
}

/**
 * Atomically increments coupon usage counter upon completed checkout.
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  await connectDB();
  const normalized = code.trim().toUpperCase();
  await Coupon.updateOne(
    { code: normalized },
    { $inc: { usedCount: 1 } }
  ).catch(() => {});
}

/**
 * Creates a new promotional coupon code (Admin).
 */
export async function createCoupon(
  dto: Partial<ICoupon>,
  actor: string = 'ADMIN'
): Promise<ICouponDocument> {
  await connectDB();

  const coupon = new Coupon({
    ...dto,
    code: dto.code?.trim().toUpperCase(),
    createdBy: actor,
    updatedBy: actor,
  });

  await coupon.save();
  return coupon;
}

/**
 * Lists available coupons for admin management.
 */
export async function getCouponsList(
  params: GetCouponsParams = {}
): Promise<CouponsListResult> {
  await connectDB();

  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
  const page = Math.max(Number(params.page) || 1, 1);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (params.isActive !== undefined) {
    query.isActive = params.isActive;
  }

  const [rawCoupons, total] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;
  const coupons = JSON.parse(JSON.stringify(rawCoupons)) as ICoupon[];

  return {
    coupons,
    pagination: {
      total,
      page,
      pages,
      limit,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
}
