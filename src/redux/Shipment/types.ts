// Types for Shipment Redux state
export interface ShipmentState {
  _id: string;
  dayId: string;
  year: number | null;
  month: number | null;
  day: number | null;
  exchangeRateLBP: number | null;
  target: number;
  prev_id: string;
  prev_dayId: string;
  prev_year: number | null;
  prev_month: number | null;
  prev_day: number | null;
  prev_target: number;
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
  CustomersWithFilledOrders: string[];
  CustomersWithEmptyOrders: string[];
  CustomersWithPendingOrders: string[];
  prev_CustomersWithFilledOrder: string[];
  prev_CustomersWithEmptyOrders: string[];
  prev_CustomersWithPendingOrders: string[];
  payments?: number;
  round: {
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
  };
}

