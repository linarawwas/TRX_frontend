// Region: round-only baseline state used to derive "this round" deltas.
export interface ShipmentRoundState {
  sequence: number | null;
  targetAdded: number;
  baseDelivered: number;
  baseReturned: number;
  baseUsd: number;
  baseLbp: number;
  baseExpUsd: number;
  baseExpLbp: number;
  baseProfUsd: number;
  baseProfLbp: number;
  startedAt: string | null;
}

// Types for Shipment Redux state.
// The external persisted shape stays flat for compatibility, but the fields are
// intentionally grouped by region so future decomposition is safer.
export interface ShipmentState {
  // Region: live shipment identity and date metadata.
  _id: string;
  dayId: string;
  year: number | null;
  month: number | null;
  day: number | null;
  exchangeRateLBP: number | null;
  target: number;

  // Region: live shipment totals.
  delivered: number;
  returned: number;
  dollarPayments: number;
  liraPayments: number;
  expensesInLiras: number;
  profitsInLiras: number;
  expensesInUSD: number;
  profitsInUSD: number;

  // Region: customer progress buckets.
  CustomersWithFilledOrders: string[];
  CustomersWithEmptyOrders: string[];
  CustomersWithPendingOrders: string[];

  // Region: legacy compatibility total. Keep explicit while older code/tests
  // still refer to it, but prefer currency-specific totals for new logic.
  payments: number;

  // Region: round baseline state.
  round: ShipmentRoundState;
}
