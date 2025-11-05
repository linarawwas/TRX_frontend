// src/features/shipments/utils/formatShipment.ts
import { ShipmentData } from "../apiShipments";

export function formatUSD(n: number): string {
  return `$ ${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatLBP(n: number): string {
  return `${Number(n || 0).toLocaleString("en-US")} ل.ل`;
}

export function formatDMY(s: ShipmentData): string {
  return `${s.date.day}/${s.date.month}/${s.date.year}`;
}

export interface ShipmentTotals {
  carryingForDelivery: number;
  calculatedDelivered: number;
  calculatedReturned: number;
  shipmentLiraPayments: number;
  shipmentUSDPayments: number;
  shipmentLiraExtraProfits: number;
  shipmentUSDExtraProfits: number;
  shipmentLiraExpenses: number;
  shipmentUSDExpenses: number;
  USD_overall: number;
  LIRA_overall: number;
}

export function computeShipmentTotals(shipments: ShipmentData[]): ShipmentTotals {
  const t: ShipmentTotals = {
    carryingForDelivery: 0,
    calculatedDelivered: 0,
    calculatedReturned: 0,
    shipmentLiraPayments: 0,
    shipmentUSDPayments: 0,
    shipmentLiraExtraProfits: 0,
    shipmentUSDExtraProfits: 0,
    shipmentLiraExpenses: 0,
    shipmentUSDExpenses: 0,
    USD_overall: 0,
    LIRA_overall: 0,
  };
  shipments.forEach((s) => {
    t.carryingForDelivery += Number(s.carryingForDelivery) || 0;
    t.calculatedDelivered += Number(s.calculatedDelivered) || 0;
    t.calculatedReturned += Number(s.calculatedReturned) || 0;
    t.shipmentLiraPayments += Number(s.shipmentLiraPayments) || 0;
    t.shipmentUSDPayments += Number(s.shipmentUSDPayments) || 0;
    t.shipmentLiraExtraProfits += Number(s.shipmentLiraExtraProfits) || 0;
    t.shipmentUSDExtraProfits += Number(s.shipmentUSDExtraProfits) || 0;
    t.shipmentLiraExpenses += Number(s.shipmentLiraExpenses) || 0;
    t.shipmentUSDExpenses += Number(s.shipmentUSDExpenses) || 0;
  });
  t.USD_overall =
    t.shipmentUSDPayments + t.shipmentUSDExtraProfits - t.shipmentUSDExpenses;
  t.LIRA_overall =
    t.shipmentLiraPayments +
    t.shipmentLiraExtraProfits -
    t.shipmentLiraExpenses;
  return t;
}

