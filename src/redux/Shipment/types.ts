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

  // Region: previous shipment snapshot for restore flows.
  prev_id: string;
  prev_dayId: string;
  prev_year: number | null;
  prev_month: number | null;
  prev_day: number | null;
  prev_target: number;

  // Region: live shipment totals.
  delivered: number;
  prev_delivered: number;
  returned: number;
  prev_returned: number;
  dollarPayments: number;
  prev_dollarPayments: number;
  liraPayments: number;
  prev_liraPayments: number;
  expensesInLiras: number;
  profitsInLiras: number;
  expensesInUSD: number;
  profitsInUSD: number;
  prev_expensesInLiras: number;
  prev_profitsInLiras: number;
  prev_profitsInUSD: number;
  prev_expensesInUSD: number;

  // Region: customer progress buckets.
  CustomersWithFilledOrders: string[];
  CustomersWithEmptyOrders: string[];
  CustomersWithPendingOrders: string[];
  prev_CustomersWithFilledOrder: string[];
  prev_CustomersWithEmptyOrders: string[];
  prev_CustomersWithPendingOrders: string[];

  // Region: legacy compatibility total. Keep explicit while older code/tests
  // still refer to it, but prefer currency-specific totals for new logic.
  payments: number;

  // Region: round baseline state.
  round: ShipmentRoundState;
}