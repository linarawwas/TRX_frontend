// src/features/finance/apiFinance.ts
import { apiClient } from "../../api/client";
import { authAxiosConfig, jsonAxiosConfig, requestJson } from "../api/http";
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
  const { data } = await apiClient.get("/api/expenses", authAxiosConfig(token));
  return Array.isArray(data) ? data : [];
}

export async function deleteExpense(token: string, expenseId: string): Promise<void> {
  await apiClient.delete(`/api/expenses/${expenseId}`, authAxiosConfig(token));
}

export async function fetchExtraProfits(token: string, companyId: string): Promise<ExtraProfit[]> {
  void companyId;
  const { data } = await apiClient.get("/api/extraProfits", authAxiosConfig(token));
  return Array.isArray(data) ? data : [];
}

export async function deleteExtraProfit(token: string, profitId: string): Promise<void> {
  await apiClient.delete(`/api/extraProfits/${profitId}`, authAxiosConfig(token));
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
  const { data } = await apiClient.post("/api/expenses", payload, jsonAxiosConfig(token));
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
  const { data } = await apiClient.post(
    "/api/extraProfits",
    payload,
    jsonAxiosConfig(token)
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
  const { data } = await apiClient.put(
    `/api/expenses/${expenseId}`,
    payload,
    jsonAxiosConfig(token)
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
  const { data } = await apiClient.put(
    `/api/extraProfits/${profitId}`,
    payload,
    jsonAxiosConfig(token)
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
  return requestJson<FinanceEntry>("/api/finances", {
    token,
    method: "POST",
    jsonBody: body,
    fallbackMessage: "Failed",
  });
}

export async function updateFinance(
  token: string,
  id: string,
  body: Partial<FinancePayload>
): Promise<FinanceEntry> {
  return requestJson<FinanceEntry>(`/api/finances/${id}`, {
    token,
    method: "PATCH",
    jsonBody: body,
    fallbackMessage: "Failed",
  });
}

export async function deleteFinance(
  token: string,
  id: string
): Promise<{ success?: boolean }> {
  return requestJson<{ success?: boolean }>(`/api/finances/${id}`, {
    token,
    method: "DELETE",
    fallbackMessage: "Failed",
  });
}

export async function dailySummary(
  token: string,
  dateISO: string
): Promise<DailySummary> {
  const url = new URL("/api/finances/summary/daily", window.location.origin);
  url.searchParams.set("date", dateISO);
  return requestJson<DailySummary>(`${url.pathname}${url.search}`, {
    token,
    fallbackMessage: "Failed",
  });
}

export async function monthlySummary(
  token: string,
  y: number,
  m: number
): Promise<MonthlyRow[]> {
  const url = new URL("/api/finances/summary/monthly", window.location.origin);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m));
  return requestJson<MonthlyRow[]>(`${url.pathname}${url.search}`, {
    token,
    fallbackMessage: "Failed",
  });
}

export async function listCategories(token: string): Promise<Category[]> {
  const data = await requestJson<unknown>("/api/finance-categories", {
    token,
    fallbackMessage: "Failed to load categories",
  });
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
    const raw = await requestJson<FinanceEntry[] | { items?: FinanceEntry[] }>(
      `/api/finances?${queryParams.toString()}`,
      {
      token,
      fallbackMessage: "Failed to list finances",
      }
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

