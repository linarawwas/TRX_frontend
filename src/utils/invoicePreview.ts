// utils/invoicePreview.ts
import { getCustomerInvoicesFromDB, getPendingRequests } from "./indexedDB";

/** Load cached invoice + pending local “create order” adjustments (offline-safe). */
export async function getAdjustedInvoiceSums(customerId: string) {
  const cached: any = await getCustomerInvoicesFromDB(customerId);
  const pending = await getPendingRequests();

  const pendingOrders = (pending || [])
    .filter(
      (r: any) =>
        r?.url?.includes("/api/orders") &&
        r?.options?.method === "POST" &&
        JSON.parse(r?.options?.body || "{}")?.customerid === customerId
    )
    .map((r: any) => JSON.parse(r.options.body));

  let delivered = cached?.deliveredSum || 0;
  let returned = cached?.returnedSum || 0;

  for (const o of pendingOrders) {
    delivered += o?.delivered || 0;
    returned += o?.returned || 0;
  }

  const bottlesLeft = delivered - returned;

  // Your cache uses totalSum (or totalSumUSD) for outstanding USD
  const totalSumUSD =
    typeof cached?.totalSum === "number"
      ? cached.totalSum
      : typeof cached?.totalSumUSD === "number"
      ? cached.totalSumUSD
      : 0;

  const lastRateLBP =
    typeof cached?.lastRateLBP === "number" ? cached.lastRateLBP : undefined;

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
  checkoutUSD: number
) {
  const deltaBottles = (order.delivered || 0) - (order.returned || 0);
  const bottlesLeftAfter = (before?.bottlesLeft || 0) + deltaBottles;

  const usdPaid = (order.payments || [])
    .filter((p) => p.currency === "USD")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const lbpPaid = (order.payments || [])
    .filter((p) => p.currency === "LBP")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const usdFromLBP =
    before?.lastRateLBP && before.lastRateLBP > 0
      ? lbpPaid / before.lastRateLBP
      : null;

  // Full, correct accounting (recommended):
  // Previous balance + (this order’s checkout) - this order’s payments
  const totalUsdAfter =
    (before?.totalSumUSD || 0) +
    (checkoutUSD || 0) -
    usdPaid -
    (usdFromLBP ?? 0);

  return { bottlesLeftAfter, totalUsdAfter, usdFromLBP };
}
