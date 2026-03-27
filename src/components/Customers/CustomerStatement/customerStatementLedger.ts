/**
 * Pure ledger math for the customer statement page.
 * Keeps payment normalization in one place (initial load + post-payment refresh orders).
 */
import type { CustomerStatementInitialSummary } from "../../../features/customers/apiCustomers";

/** Minimal order shape the ledger needs (statement rows or refreshed `Order` payloads). */
export type LedgerOrderInput = {
  _id: string;
  timestamp: string;
  delivered?: number;
  returned?: number;
  checkout?: number;
  paid?: number;
  payments?: Array<{
    amount: number;
    currency: "USD" | "LBP";
    exchangeRate?: string;
    rateAtPaymentLBP?: number;
  }>;
  companyExchangeRateLBPAtSale?: number;
};

export type StatementLedgerRow = {
  date: string;
  orderId: string;
  delivered: number;
  returned: number;
  bottlesLeft: number;
  totalUSD: number;
  paidUSD: number;
  remainingUSD: number;
};

export type StatementLedger = {
  rows: StatementLedgerRow[];
  totals: { total: number; paid: number; remaining: number };
  cumulative: number;
  meta: {
    openingBottles: number;
    openingBalance: number;
    ordersBottles: number;
    statementBottlesLeft: number;
    statementBalanceUSD: number;
  };
};

export function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function fmtStatementDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("ar-LB", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function computePaidUsdForOrder(o: LedgerOrderInput): number {
  let paidUSD = 0;
  for (const p of o.payments || []) {
    if (p.currency === "USD") paidUSD += p.amount;
    else if (p.currency === "LBP") {
      const rate =
        p.rateAtPaymentLBP ||
        (typeof p.exchangeRate === "string" ? Number(p.exchangeRate) : 0) ||
        o.companyExchangeRateLBPAtSale ||
        0;
      if (rate > 0) paidUSD += p.amount / rate;
    }
  }
  if (!paidUSD && typeof o.paid === "number") paidUSD = o.paid;
  return paidUSD;
}

export function buildStatementLedger(
  orders: LedgerOrderInput[],
  opening: CustomerStatementInitialSummary
): StatementLedger {
  const rows: StatementLedgerRow[] = [];
  let cumulative = 0;
  let sumDelivered = 0;
  let sumReturned = 0;

  /* Newest first: aligns with how users scan recent activity on mobile and desktop. */
  const sorted = [...orders].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  for (const o of sorted) {
    const paidUSD = computePaidUsdForOrder(o);
    const totalUSD = o.checkout || 0;
    const remainingUSD = +(totalUSD - paidUSD).toFixed(2);
    cumulative += remainingUSD;

    const delivered = o.delivered || 0;
    const returned = o.returned || 0;
    sumDelivered += delivered;
    sumReturned += returned;
    const bottlesLeft = delivered - returned;

    rows.push({
      date: fmtStatementDate(o.timestamp),
      orderId: o._id,
      delivered,
      returned,
      bottlesLeft,
      totalUSD,
      paidUSD,
      remainingUSD,
    });
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.total += r.totalUSD;
      acc.paid += r.paidUSD;
      acc.remaining += r.remainingUSD;
      return acc;
    },
    { total: 0, paid: 0, remaining: 0 }
  );

  const openingBottles = opening?.bottlesLeft || 0;
  const openingBalance = opening?.balanceUSD || 0;
  const ordersBottles = sumDelivered - sumReturned;
  const statementBottlesLeft = openingBottles + ordersBottles;
  const statementBalanceUSD = +(openingBalance + totals.remaining).toFixed(2);

  return {
    rows,
    totals,
    cumulative,
    meta: {
      openingBottles,
      openingBalance,
      ordersBottles,
      statementBottlesLeft,
      statementBalanceUSD,
    },
  };
}

export type SelectableOrderOption = {
  id: string;
  label: string;
  remaining: number;
};

export function buildSelectableOrderOptions(
  orders: LedgerOrderInput[]
): SelectableOrderOption[] {
  return orders
    .map((o) => {
      const paidUSD = computePaidUsdForOrder(o);
      const remaining = (o.checkout || 0) - paidUSD;
      return {
        id: o._id,
        label: `${fmtStatementDate(o.timestamp)} — ${fmtUSD(
          o.checkout || 0
        )} (باقي: ${fmtUSD(Math.max(0, remaining))})`,
        remaining,
      };
    })
    .sort((a, b) => b.remaining - a.remaining);
}
