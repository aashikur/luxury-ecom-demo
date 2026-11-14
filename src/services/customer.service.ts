import { connectDB } from '@/lib/db';
import Customer, { ICustomerDocument } from '@/models/Customer';
import { DeliveryZone, FraudRiskLevel, ICustomer } from '@/types/domain';
import { ApiPaginationMeta } from '@/types/api';
import { normalizeBDPhone } from './order.service';

export interface UpsertCustomerInput {
  name: string;
  phone: string;
  address?: string;
  deliveryZone?: DeliveryZone;
  district?: string;
  totalAmount: number;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  q?: string;
  fraudRisk?: FraudRiskLevel;
}

export interface CustomersListResult {
  customers: ICustomer[];
  pagination: ApiPaginationMeta;
}

/**
 * Derives dynamic fraud risk level from customer delivery track record.
 */
export function calculateFraudRisk(
  totalOrders: number,
  completedDeliveries: number,
  returnedOrders: number,
  cancelledOrders: number
): FraudRiskLevel {
  const badOrders = returnedOrders + cancelledOrders;

  // Severe repeated bounce or cancellation
  if (badOrders >= 5 && completedDeliveries === 0) {
    return 'BLACKLIST';
  }

  const finishedOrders = completedDeliveries + returnedOrders;
  if (finishedOrders >= 3) {
    const successRate = (completedDeliveries / finishedOrders) * 100;
    if (successRate < 35) return 'BLACKLIST';
    if (successRate < 60) return 'HIGH';
    if (successRate < 80) return 'MEDIUM';
    return 'LOW';
  }

  // New or low order count
  if (totalOrders > 0 && badOrders > 1) {
    return 'MEDIUM';
  }

  return 'LOW';
}

/**
 * Upserts a customer profile whenever a new checkout or order is placed.
 */
export async function upsertCustomerOnOrder(
  input: UpsertCustomerInput
): Promise<ICustomerDocument | null> {
  await connectDB();
  const phone = normalizeBDPhone(input.phone);
  if (!phone) return null;

  let customer = await Customer.findOne({ phone });

  if (!customer) {
    customer = new Customer({
      phone,
      name: input.name.trim(),
      defaultAddress: input.address || '',
      defaultDeliveryZone: input.deliveryZone || 'INSIDE_DHAKA',
      district: input.district || '',
      totalOrders: 1,
      totalSpent: input.totalAmount || 0,
      completedDeliveries: 0,
      returnedOrders: 0,
      cancelledOrders: 0,
      deliverySuccessRate: 100,
      fraudRisk: 'LOW',
    });
    await customer.save();
  } else {
    customer.name = input.name.trim() || customer.name;
    if (input.address) customer.defaultAddress = input.address;
    if (input.deliveryZone) customer.defaultDeliveryZone = input.deliveryZone;
    if (input.district) customer.district = input.district;

    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + (input.totalAmount || 0);

    customer.fraudRisk = calculateFraudRisk(
      customer.totalOrders,
      customer.completedDeliveries || 0,
      customer.returnedOrders || 0,
      customer.cancelledOrders || 0
    );

    await customer.save();
  }

  return customer;
}

/**
 * Updates customer delivery success counters whenever an order reaches final state.
 */
export async function updateCustomerDeliveryMetrics(
  rawPhone: string,
  event: 'DELIVERED' | 'RETURNED' | 'CANCELLED'
): Promise<void> {
  await connectDB();
  const phone = normalizeBDPhone(rawPhone);
  if (!phone) return;

  const customer = await Customer.findOne({ phone });
  if (!customer) return;

  if (event === 'DELIVERED') {
    customer.completedDeliveries = (customer.completedDeliveries || 0) + 1;
  } else if (event === 'RETURNED') {
    customer.returnedOrders = (customer.returnedOrders || 0) + 1;
  } else if (event === 'CANCELLED') {
    customer.cancelledOrders = (customer.cancelledOrders || 0) + 1;
  }

  const finishedOrders =
    (customer.completedDeliveries || 0) + (customer.returnedOrders || 0);
  if (finishedOrders > 0) {
    customer.deliverySuccessRate = Math.round(
      ((customer.completedDeliveries || 0) / finishedOrders) * 100
    );
  }

  customer.fraudRisk = calculateFraudRisk(
    customer.totalOrders || 0,
    customer.completedDeliveries || 0,
    customer.returnedOrders || 0,
    customer.cancelledOrders || 0
  );

  await customer.save();
}

/**
 * Retrieves a customer profile with order stats and fraud alert status.
 */
export async function getCustomerByPhone(
  rawPhone: string
): Promise<ICustomer | null> {
  await connectDB();
  const phone = normalizeBDPhone(rawPhone);
  const customer = await Customer.findOne({ phone }).lean();
  if (!customer) return null;
  return JSON.parse(JSON.stringify(customer)) as ICustomer;
}

/**
 * Admin list view for customer directory with search and risk filters.
 */
export async function getCustomersList(
  params: GetCustomersParams = {}
): Promise<CustomersListResult> {
  await connectDB();

  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
  const page = Math.max(Number(params.page) || 1, 1);
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (params.fraudRisk) {
    query.fraudRisk = params.fraudRisk;
  }

  if (params.q && params.q.trim()) {
    const regex = new RegExp(params.q.trim(), 'i');
    query.$or = [{ name: regex }, { phone: regex }, { defaultAddress: regex }];
  }

  const [rawCustomers, total] = await Promise.all([
    Customer.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Customer.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;
  const customers = JSON.parse(JSON.stringify(rawCustomers)) as ICustomer[];

  return {
    customers,
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
