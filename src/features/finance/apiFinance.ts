// src/features/finance/apiFinance.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

const BASE = process.env.REACT_APP_API_BASE_URL || API_BASE;

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
  const { data } = await axios.get(`${BASE}/api/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function deleteExpense(token: string, expenseId: string): Promise<void> {
  await axios.delete(`${BASE}/api/expenses/${expenseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchExtraProfits(token: string, companyId: string): Promise<ExtraProfit[]> {
  const { data } = await axios.get(`${BASE}/api/extraProfits/company/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function deleteExtraProfit(token: string, profitId: string): Promise<void> {
  await axios.delete(`${BASE}/api/extraProfits/${profitId}`, {
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
  const { data } = await axios.post(`${BASE}/api/expenses`, payload, {
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
  const { data } = await axios.post(`${BASE}/api/extraProfits`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

