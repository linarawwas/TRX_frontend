export function fmtUSD(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} $`;
}

export function fmtLBP(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n).toLocaleString("ar-LB")} ل.ل`;
}

export function fmtRateLBP(rate?: number | null) {
  if (!rate || rate <= 0) return "—";
  return `${rate.toLocaleString("ar-LB")} ل.ل / 1$`;
}

export function usdToLbp(usd: number, rate: number) {
  if (!Number.isFinite(usd) || !Number.isFinite(rate) || rate <= 0) return null;
  return usd * rate;
}

export function lbpToUsd(lbp: number, rate: number) {
  if (!Number.isFinite(lbp) || !Number.isFinite(rate) || rate <= 0) return null;
  return lbp / rate;
}
