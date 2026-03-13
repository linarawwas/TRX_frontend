// src/features/finance/apiFinance.ts
import axios from "axios";
import { API_BASE } from "../../config/api";
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
  const { data } = await axios.get(`${API_BASE}/api/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function deleteExpense(token: string, expenseId: string): Promise<void> {
  await axios.delete(`${API_BASE}/api/expenses/${expenseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchExtraProfits(token: string, companyId: string): Promise<ExtraProfit[]> {
  const { data } = await axios.get(`${API_BASE}/api/extraProfits`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function deleteExtraProfit(token: string, profitId: string): Promise<void> {
  await axios.delete(`${API_BASE}/api/extraProfits/${profitId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  const { data } = await axios.post(`${API_BASE}/api/expenses`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
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
  const { data } = await axios.post(`${API_BASE}/api/extraProfits`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
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
  const { data } = await axios.put(`${API_BASE}/api/expenses/${expenseId}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
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
  const { data } = await axios.put(`${API_BASE}/api/extraProfits/${profitId}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
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

async function parseJsonOrThrow(res: Response, fallbackMessage: string) {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error || fallbackMessage);
  }
  return res.json();
}

export async function createFinance(
  token: string,
  body: FinancePayload
): Promise<FinanceEntry> {
  const res = await fetch(`${API_BASE}/api/finances`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJsonOrThrow(res, "Failed");
}

export async function updateFinance(
  token: string,
  id: string,
  body: Partial<FinancePayload>
): Promise<FinanceEntry> {
  const res = await fetch(`${API_BASE}/api/finances/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJsonOrThrow(res, "Failed");
}

export async function deleteFinance(
  token: string,
  id: string
): Promise<{ success?: boolean }> {
  const res = await fetch(`${API_BASE}/api/finances/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseJsonOrThrow(res, "Failed");
}

export async function dailySummary(
  token: string,
  dateISO: string
): Promise<DailySummary> {
  const url = new URL(`${API_BASE}/api/finances/summary/daily`);
  url.searchParams.set("date", dateISO);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(res, "Failed");
}

export async function monthlySummary(
  token: string,
  y: number,
  m: number
): Promise<MonthlyRow[]> {
  const url = new URL(`${API_BASE}/api/finances/summary/monthly`);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(res, "Failed");
}

export async function listCategories(token: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/finance-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonOrThrow(res, "Failed to load categories");
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

  const url = new URL(`${API_BASE}/api/finances`);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const raw = await parseJsonOrThrow(res, "Failed to list finances");
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

