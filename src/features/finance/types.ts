// src/features/finance/types.ts
export type Currency = "USD" | "LBP";

export type Payment = {
  amount: number;
  currency: Currency;
  paymentMethod?: string;
  note?: string;
  rateAtPaymentLBP?: number;
  date?: string;
};

export type FinanceEntry = {
  _id: string;
  kind: "income" | "expense";
  date?: string;
  createdAt?: string;
  categoryId?: string;
  categoryName?: string;
  category?: { name?: string };
  payments?: Payment[];
  amount?: number;
  currency?: Currency;
  normalizedUSD?: number;
  normUSD?: number; // legacy field
  sumUSD?: number;
  sumLBP?: number;
  normalizedUSDTotal?: number;
  note?: string;
};

export type Category = {
  _id: string;
  name: string;
  kind: "income" | "expense";
};

export type DailySummary = {
  shipments: { usd: number; lbp: number; normalizedUSD: number };
  finance: {
    income: { USD: number; LBP: number; normUSD: number };
    expense: { USD: number; LBP: number; normUSD: number };
  };
  net: { byCurrency: { USD: number; LBP: number }; normalizedUSD: number };
};

export type MonthlyRow = {
  d: number | string;
  shipments: { usd: number; lbp: number; normUSD: number };
  income: { USD: number; LBP: number; normUSD: number };
  expense: { USD: number; LBP: number; normUSD: number };
  net: { normalizedUSD: number };
};

