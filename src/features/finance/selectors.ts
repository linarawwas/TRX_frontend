// src/features/finance/selectors.ts
import { FinanceEntry, MonthlyRow } from "./types";
import { getEntrySums } from "./utils/financeUtils";

export function computeMonthlyTotals(monthly: MonthlyRow[]): {
  ship: { usd: number; lbp: number; norm: number };
  inc: { usd: number; lbp: number; norm: number };
  exp: { usd: number; lbp: number; norm: number };
  netNorm: number;
} {
  return monthly.reduce(
    (acc, r) => {
      acc.ship.usd += r.shipments.usd || 0;
      acc.ship.lbp += r.shipments.lbp || 0;
      acc.ship.norm += r.shipments.normUSD || 0;

      acc.inc.usd += r.income.USD || 0;
      acc.inc.lbp += r.income.LBP || 0;
      acc.inc.norm += r.income.normUSD || 0;

      acc.exp.usd += r.expense.USD || 0;
      acc.exp.lbp += r.expense.LBP || 0;
      acc.exp.norm += r.expense.normUSD || 0;

      acc.netNorm += r.net.normalizedUSD || 0;
      return acc;
    },
    {
      ship: { usd: 0, lbp: 0, norm: 0 },
      inc: { usd: 0, lbp: 0, norm: 0 },
      exp: { usd: 0, lbp: 0, norm: 0 },
      netNorm: 0,
    }
  );
}

export function groupEntriesByDate(
  entries: FinanceEntry[]
): [string, FinanceEntry[]][] {
  const map = new Map<string, FinanceEntry[]>();
  for (const e of entries) {
    const d = String(e.date || e.createdAt || "").slice(0, 10);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }
  // newest first
  return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export function computeEntriesTotals(entries: FinanceEntry[]): {
  inc: { usd: number; lbp: number; norm: number };
  exp: { usd: number; lbp: number; norm: number };
  net: { usd: number; lbp: number; norm: number };
} {
  let incUSD = 0,
    incLBP = 0,
    incNorm = 0;
  let expUSD = 0,
    expLBP = 0,
    expNorm = 0;

  for (const e of entries) {
    const sums = getEntrySums(e);
    const isInc = e.kind === "income";
    if (isInc) {
      incUSD += sums.usd;
      incLBP += sums.lbp;
      incNorm += sums.norm;
    } else {
      expUSD += sums.usd;
      expLBP += sums.lbp;
      expNorm += sums.norm;
    }
  }

  return {
    inc: { usd: incUSD, lbp: incLBP, norm: incNorm },
    exp: { usd: expUSD, lbp: expLBP, norm: expNorm },
    net: {
      usd: incUSD - expUSD,
      lbp: incLBP - expLBP,
      norm: incNorm - expNorm,
    },
  };
}

