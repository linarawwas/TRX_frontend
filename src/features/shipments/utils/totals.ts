// src/features/shipments/utils/totals.ts
import type { ShipmentTotals } from "../hooks/useTodayShipmentTotals";

export function computeNetTotals(t: ShipmentTotals) {
  const usd = (t.shipmentUSDPayments || 0) + (t.shipmentUSDExtraProfits || 0) - (t.shipmentUSDExpenses || 0);
  const lbp = (t.shipmentLiraPayments || 0) + (t.shipmentLiraExtraProfits || 0) - (t.shipmentLiraExpenses || 0);
  return { usd, lbp };
}

export function seedTrend(base: number) {
  const b = Math.max(1, base || 0);
  return [0.4, 0.6, 0.5, 0.8, 0.9, 0.7, 1].map(x => Math.round(b * x));
}

