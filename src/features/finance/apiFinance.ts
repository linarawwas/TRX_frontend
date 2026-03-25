// src/features/finance/apiFinance.ts
import { runUnifiedRequest } from "../api/rtkRequest";
import type {
  Category,
  DailySummary,
  FinanceEntry,
  MonthlyRow,
} from "./types";

export interface Expense {
  _id: string;
  name: string;
  value: number | string;
  paymentCurrency: string;
  exchangeRate: string;
  valueInUSD: number;
  companyId: string;
  shipmentId: string;
  timestamp: string;
  recordedBy: string;
  __v: number;
}

export interface ExtraProfit {
  _id: string;
  name: string;
  value: number | string;
  paymentCurrency: string;
  exchangeRate: string;
  valueInUSD: number;
  companyId: string;
  shipmentId: string;
  timestamp: string;
  recordedBy: string;
  __v: number;
}

export async function fetchExpenses(token: string): Promise<Expense[]> {
  const data = await runUnifiedRequest<unknown>(
    { url: "/api/expenses", token },
    "Failed to fetch expenses"
  );
  return Array.isArray(data) ? data : [];
}

export async function deleteExpense(token: string, expenseId: string): Promise<void> {
  await runUnifiedRequest(
    { url: `/api/expenses/${expenseId}`, method: "DELETE", token },
    "Failed to delete expense"
  );
}

export async function fetchExtraProfits(token: string, companyId: string): Promise<ExtraProfit[]> {
  void companyId;
  const data = await runUnifiedRequest<unknown>(
    { url: "/api/extraProfits", token },
    "Failed to fetch extra profits"
  );
  return Array.isArray(data) ? data : [];
}

export async function deleteExtraProfit(token: string, profitId: string): Promise<void> {
  await runUnifiedRequest(
    { url: `/api/extraProfits/${profitId}`, method: "DELETE", token },
    "Failed to delete extra profit"
  );
}

export interface CreateExpensePayload {
  name: string;
  value: number;
  paymentCurrency: "USD" | "LBP";
  shipmentId: string;
}

export async function createExpense(
  token: string,
  payload: CreateExpensePayload
): Promise<Expense> {
  const data = await runUnifiedRequest<Expense>(
    { url: "/api/expenses", method: "POST", token, body: payload },
    "Failed to create expense"
  );
  return data;
}

export interface CreateExtraProfitPayload {
  name: string;
  value: number;
  paymentCurrency: "USD" | "LBP";
  shipmentId: string;
}

export async function createExtraProfit(
  token: string,
  payload: CreateExtraProfitPayload
): Promise<ExtraProfit> {
  const data = await runUnifiedRequest<ExtraProfit>(
    { url: "/api/extraProfits", method: "POST", token, body: payload },
    "Failed to create extra profit"
  );
  return data;
}

export interface UpdateExpensePayload {
  name?: string;
  value?: number;
  paymentCurrency?: "USD" | "LBP";
  shipmentId?: string;
}

export async function updateExpense(
  token: string,
  expenseId: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  const data = await runUnifiedRequest<Expense>(
    {
      url: `/api/expenses/${expenseId}`,
      method: "PUT",
      token,
      body: payload,
    },
    "Failed to update expense"
  );
  return data;
}

export interface UpdateExtraProfitPayload {
  name?: string;
  value?: number;
  paymentCurrency?: "USD" | "LBP";
  shipmentId?: string;
}

export async function updateExtraProfit(
  token: string,
  profitId: string,
  payload: UpdateExtraProfitPayload
): Promise<ExtraProfit> {
  const data = await runUnifiedRequest<ExtraProfit>(
    {
      url: `/api/extraProfits/${profitId}`,
      method: "PUT",
      token,
      body: payload,
    },
    "Failed to update extra profit"
  );
  return data;
}

type FinancePayload = {
  kind: "income" | "expense";
  categoryId: string;
  date: string;
  note?: string;
  payments: Array<{
    amount: number;
    currency: "USD" | "LBP";
    paymentMethod?: string;
    note?: string;
    date: string;
  }>;
};

type FinanceListParams = {
  year: number;
  month: number;
  kind?: "income" | "expense" | "";
  categoryId?: string;
};

export async function createFinance(
  token: string,
  body: FinancePayload
): Promise<FinanceEntry> {
  return runUnifiedRequest<FinanceEntry>(
    { url: "/api/finances", token, method: "POST", body },
    "Failed"
  );
}

export async function updateFinance(
  token: string,
  id: string,
  body: Partial<FinancePayload>
): Promise<FinanceEntry> {
  return runUnifiedRequest<FinanceEntry>(
    { url: `/api/finances/${id}`, token, method: "PATCH", body },
    "Failed"
  );
}

export async function deleteFinance(
  token: string,
  id: string
): Promise<{ success?: boolean }> {
  return runUnifiedRequest<{ success?: boolean }>(
    { url: `/api/finances/${id}`, token, method: "DELETE" },
    "Failed"
  );
}

export async function dailySummary(
  token: string,
  dateISO: string
): Promise<DailySummary> {
  const url = new URL("/api/finances/summary/daily", window.location.origin);
  url.searchParams.set("date", dateISO);
  return runUnifiedRequest<DailySummary>(
    { url: `${url.pathname}${url.search}`, token },
    "Failed"
  );
}

export async function monthlySummary(
  token: string,
  y: number,
  m: number
): Promise<MonthlyRow[]> {
  const url = new URL("/api/finances/summary/monthly", window.location.origin);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m));
  return runUnifiedRequest<MonthlyRow[]>(
    { url: `${url.pathname}${url.search}`, token },
    "Failed"
  );
}

export async function listCategories(token: string): Promise<Category[]> {
  const data = await runUnifiedRequest<unknown>(
    { url: "/api/finance-categories", token },
    "Failed to load categories"
  );
  return Array.isArray(data) ? data : [];
}

export async function listFinances(
  token: string,
  params: FinanceListParams
): Promise<FinanceEntry[]> {
  const firstDay = new Date(Date.UTC(params.year, params.month - 1, 1));
  const lastDay = new Date(
    Date.UTC(params.year, params.month, 0, 23, 59, 59, 999)
  );
  const from = firstDay.toISOString().split("T")[0];
  const to = lastDay.toISOString().split("T")[0];
  const queryParams = new URLSearchParams({ from, to });

  try {
    const raw = await runUnifiedRequest<FinanceEntry[] | { items?: FinanceEntry[] }>(
      {
        url: `/api/finances?${queryParams.toString()}`,
        token,
      },
      "Failed to list finances"
    );
    let data = Array.isArray(raw) ? raw : raw.items || [];

    if (params.kind) {
      data = data.filter((entry: FinanceEntry) => entry.kind === params.kind);
    }
    if (params.categoryId) {
      data = data.filter(
        (entry: FinanceEntry) => entry.categoryId === params.categoryId
      );
    }

    return data;
  } catch {
    throw new Error("Failed to list finances");
  }
}

