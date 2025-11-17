import { MonthRange } from "../hooks/useMonthRange";
import { DistributorRow } from "../hooks/useCompanyDistributorData";
import { CustomersResponse } from "../../../features/customers/apiCustomers";
import { Order } from "../../../features/orders/apiOrders";

type CustomerRecord = CustomersResponse["active"][number];

export interface DistributorMetrics {
  distributorId: string;
  customersCount: number;
  deliveredSum: number;
  revenueUSD: number;
  commissionPct: number;
  commissionUSD: number;
}

export interface CustomerMetrics {
  customerId: string;
  name: string;
  phone?: string;
  areaName?: string;
  deliveredSum: number;
  revenueUSD: number;
}

export interface DistributorAnalytics {
  distributors: Map<string, DistributorMetrics>;
  customersByDistributor: Map<string, CustomerMetrics[]>;
}

export interface BuildAnalyticsInput {
  distributors: DistributorRow[];
  customers: CustomerRecord[];
  orders: Order[];
  range: MonthRange;
  pricePerBottle: number;
}

export function buildDistributorAnalytics({
  distributors,
  customers,
  orders,
  range,
  pricePerBottle,
}: BuildAnalyticsInput): DistributorAnalytics {
  const distributorMap = new Map<string, DistributorMetrics>();
  const customersMap = new Map<string, CustomerMetrics[]>();

  const customerIdsByDistributor = new Map<string, Set<string>>();
  const customerMetadata = new Map<string, CustomerRecord>();

  for (const customer of customers) {
    const distributorId =
      customer && (customer as any).distributorId
        ? String((customer as any).distributorId)
        : "";
    if (!distributorId) continue;
    const customerId = String(customer._id);
    customerMetadata.set(customerId, customer);
    if (!customerIdsByDistributor.has(distributorId)) {
      customerIdsByDistributor.set(distributorId, new Set<string>());
    }
    customerIdsByDistributor.get(distributorId)!.add(customerId);
  }

  const deliveredByCustomer = new Map<string, number>();
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();

  for (const order of orders) {
    // Exclude initial orders (type=1)
    if (order.type === 1) continue;
    
    const rawCustomerId =
      (order as any).customerid ?? order.customerId ?? order.customer?._id;
    if (!rawCustomerId) continue;
    const customerId = String(rawCustomerId);
    if (!customerMetadata.has(customerId)) continue;
    const timestamp = order.timestamp ? new Date(order.timestamp).getTime() : NaN;
    if (!Number.isFinite(timestamp)) continue;
    if (timestamp < startTime || timestamp > endTime) continue;
    const deliveredValue = Number(order.delivered ?? 0);
    const current = deliveredByCustomer.get(customerId) ?? 0;
    deliveredByCustomer.set(
      customerId,
      current + (Number.isFinite(deliveredValue) ? deliveredValue : 0)
    );
  }

  for (const distributor of distributors) {
    const distributorId = String(distributor._id);
    const customerIds = customerIdsByDistributor.get(distributorId) ?? new Set();
    const customersCount = customerIds.size;
    let deliveredSum = 0;

    const customerMetrics: CustomerMetrics[] = [];
    for (const customerId of customerIds) {
      const delivered = deliveredByCustomer.get(customerId) ?? 0;
      deliveredSum += delivered;
      const metadata = customerMetadata.get(customerId);
      if (!metadata) continue;
      const revenueUSD =
        pricePerBottle > 0 ? Number((delivered * pricePerBottle).toFixed(2)) : 0;
      customerMetrics.push({
        customerId,
        name: metadata.name,
        phone: metadata.phone,
        areaName: (metadata as any).areaId?.name,
        deliveredSum: delivered,
        revenueUSD,
      });
    }
    const revenueUSD =
      pricePerBottle > 0 ? Number((deliveredSum * pricePerBottle).toFixed(2)) : 0;
    const commissionPct = Number(distributor.commissionPct ?? 0);
    const commissionUSD = Number(
      ((revenueUSD * commissionPct) / 100 || 0).toFixed(2)
    );

    distributorMap.set(distributorId, {
      distributorId,
      customersCount,
      deliveredSum,
      revenueUSD,
      commissionPct,
      commissionUSD,
    });
    customersMap.set(distributorId, customerMetrics);
  }

  return {
    distributors: distributorMap,
    customersByDistributor: customersMap,
  };
}

