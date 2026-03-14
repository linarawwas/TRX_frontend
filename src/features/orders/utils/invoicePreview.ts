import {
  getCustomerInvoicesFromDB,
  getExchangeRateFromDB,
  getPendingRequests,
} from "../../../utils/indexedDB";

type CachedInvoice = {
  deliveredSum?: number;
  returnedSum?: number;
  totalSum?: number;
  totalSumUSD?: number;
  lastRateLBP?: number;
};

type PendingOrderRequest = {
  url?: string;
  options?: {
    method?: string;
    body?: string;
  };
};

type PendingOrderPayload = {
  customerid?: string;
  delivered?: number;
  returned?: number;
};

/** Load cached invoice + pending local “create order” adjustments (offline-safe). */
export async function getAdjustedInvoiceSums(customerId: string, companyId?: string) {
  const cached = (await getCustomerInvoicesFromDB(customerId)) as
    | CachedInvoice
    | undefined;
  const pending = ((await getPendingRequests()) as PendingOrderRequest[]) || [];

  const pendingOrders = pending
    .filter(
      (request) =>
        typeof request?.options?.body === "string" &&
        request?.url?.includes("/api/orders") &&
        request?.options?.method === "POST" &&
        (JSON.parse(request.options.body) as PendingOrderPayload)?.customerid ===
          customerId
    )
    .map((request) => JSON.parse(request.options?.body || "{}") as PendingOrderPayload);

  let delivered = cached?.deliveredSum || 0;
  let returned  = cached?.returnedSum  || 0;
  for (const o of pendingOrders) {
    delivered += o?.delivered || 0;
    returned  += o?.returned  || 0;
  }
  const bottlesLeft = delivered - returned;

  const totalSumUSD =
    typeof cached?.totalSum === "number" ? cached.totalSum
    : typeof cached?.totalSumUSD === "number" ? cached.totalSumUSD
    : 0;

  // Prefer snapshot rate saved with the invoice; otherwise fallback to company rate from IDB
  let lastRateLBP: number | undefined =
    typeof cached?.lastRateLBP === "number" ? cached.lastRateLBP : undefined;

  if (lastRateLBP == null) {
    const rateRow = await getExchangeRateFromDB(companyId);
    if (rateRow && typeof rateRow.exchangeRateInLBP === "number") {
      lastRateLBP = rateRow.exchangeRateInLBP;
    }
  }

  return { bottlesLeft, totalSumUSD, lastRateLBP };
}

/** Project balances AFTER *this* order is applied. */
export function projectAfterOrder(
  before: { bottlesLeft: number; totalSumUSD: number; lastRateLBP?: number },
  order: {
    delivered: number;
    returned: number;
    payments: Array<{ amount: number; currency: "USD" | "LBP" }>;
  },
  checkoutUSD: number,
  effectiveRateLBP?: number // ⬅️ allow explicit rate override
) {
  const deltaBottles = (order.delivered || 0) - (order.returned || 0);
  const bottlesLeftAfter = (before?.bottlesLeft || 0) + deltaBottles;

  const usdPaid = (order.payments || [])
    .filter(p => p.currency === "USD")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const lbpPaid = (order.payments || [])
    .filter(p => p.currency === "LBP")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const rate = effectiveRateLBP ?? before?.lastRateLBP;
  const usdFromLBP = rate && rate > 0 ? (lbpPaid / rate) : 0;

  const totalUsdAfter =
    (before?.totalSumUSD || 0) + (checkoutUSD || 0) - usdPaid - usdFromLBP;

  return { bottlesLeftAfter, totalUsdAfter, usdFromLBP };
}
