// src/features/shipments/utils/progress.ts
export function computeProgress(delivered: number, target: number) {
  const pctRaw = target > 0 ? (delivered / target) * 100 : 0;
  const pctForBar = Math.min(100, Math.max(0, Math.round(pctRaw)));
  const pctDisplay = Math.max(0, Math.round(pctRaw));
  const overBy = target > 0 ? Math.max(0, delivered - target) : 0;
  const reached = target > 0 && delivered >= target;
  return { pctForBar, pctDisplay, overBy, reached };
}

export function formatMoneyPair(usd: number, lbp: number) {
  return {
    usd: `$${Number(usd || 0).toLocaleString("en-US")}`,
    lbp: `${Number(lbp || 0).toLocaleString("en-US")} ل.ل`,
  };
}

