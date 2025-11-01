// src/features/finance/utils/financeUtils.ts
import { Category, FinanceEntry } from "../types";

export const CAT_AR_MAP: Record<string, string> = {
  "Misc income": "إيرادات متفرقة",
  Refunds: "مبالغ مستردة",
  Interest: "فوائد",
  Rent: "إيجار",
  Salaries: "رواتب",
  Fuel: "محروقات",
  Utilities: "خدمات (كهرباء/ماء/اتصالات)",
  Marketing: "تسويق",
  Maintenance: "صيانة",
  Office: "مكتب ولوازم",
  "Misc expense": "مصروفات متفرقة",
};

export const catAr = (c: Category | { name: string }) =>
  CAT_AR_MAP[c.name] || c.name;

export const fmtUSD = (n: number) => `$${(n || 0).toFixed(2)}`;
export const fmtLBP = (n: number) =>
  `${Math.round(n || 0).toLocaleString()} ل.ل`;
export const fmtSignedUSD = (n: number) =>
  `${n >= 0 ? "+" : "−"}$${Math.abs(n || 0).toFixed(2)}`;
export const fmtSignedLBP = (n: number) =>
  `${n >= 0 ? "+" : "−"}${Math.round(Math.abs(n || 0)).toLocaleString()} ل.ل`;

export function isNewFinanceShape(e: FinanceEntry): boolean {
  return Array.isArray(e?.payments);
}

// Prefer denormalized sums if present; else compute/derive from legacy fields.
export function getEntrySums(
  e: FinanceEntry
): { usd: number; lbp: number; norm: number } {
  if (isNewFinanceShape(e)) {
    const usd = Number(e.sumUSD ?? 0);
    const lbp = Number(e.sumLBP ?? 0);
    const norm = Number(e.normalizedUSDTotal ?? 0);
    if (usd || lbp || norm) return { usd, lbp, norm };
    // fallback compute if server didn't denorm (shouldn't happen often)
    let cUSD = 0,
      cLBP = 0,
      cNorm = 0;
    for (const p of e.payments || []) {
      const amt = Number(p.amount) || 0;
      if (p.currency === "USD") {
        cUSD += amt;
        cNorm += amt;
      } else if (p.currency === "LBP") {
        const r = Number(p.rateAtPaymentLBP || 0);
        cLBP += amt;
        if (r >= 1) cNorm += amt / r;
      }
    }
    return { usd: cUSD, lbp: cLBP, norm: cNorm };
  }
  // legacy
  const amt = Number(e.amount) || 0;
  const norm = Number(e.normUSD ?? e.normalizedUSD ?? 0) || 0;
  const cur = String(e.currency || "").toUpperCase();
  return {
    usd: cur === "USD" ? amt : 0,
    lbp: cur === "LBP" ? amt : 0,
    norm,
  };
}

