// src/utils/apiFinances.ts
import { API_BASE } from "../config/api";

export async function createFinance(token: string, body: any) {
  const res = await fetch(`${API_BASE}/api/finances`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({})))?.error || "Failed");
  return res.json();
}

export async function updateFinance(token: string, id: string, body: any) {
  const res = await fetch(`${API_BASE}/api/finances/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({})))?.error || "Failed");
  return res.json();
}

export async function deleteFinance(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/finances/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({})))?.error || "Failed");
  return res.json();
}

export async function dailySummary(token: string, dateISO: string) {
  const url = new URL(`${API_BASE}/api/finances/summary/daily`);
  url.searchParams.set("date", dateISO);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
export async function monthlySummary(token: string, y: number, m: number) {
  const url = new URL(`${API_BASE}/api/finances/summary/monthly`);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
export async function listCategories(token: string) {
  const res = await fetch(`${API_BASE}/api/finance-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
export async function listFinances(
  token: string,
  params: {
    year: number;
    month: number;
    kind?: "income" | "expense" | "";
    categoryId?: string;
  }
): Promise<any[]> {
  try {
    // Convert year/month to date range (from/to)
    const firstDay = new Date(Date.UTC(params.year, params.month - 1, 1));
    const lastDay = new Date(Date.UTC(params.year, params.month, 0, 23, 59, 59, 999));
    const from = firstDay.toISOString().split('T')[0];
    const to = lastDay.toISOString().split('T')[0];

    const url = new URL(`${API_BASE}/api/finances`);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    // Note: kind and categoryId filtering would need to be done on backend or client-side
    // For now, we'll filter client-side if needed

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to list finances");

    let data = await res.json();
    if (!Array.isArray(data)) data = data.items || [];

    // Client-side filtering for kind and categoryId if needed
    if (params.kind) {
      data = data.filter((e: any) => e.kind === params.kind);
    }
    if (params.categoryId) {
      data = data.filter((e: any) => e.categoryId === params.categoryId);
    }

    return data;
  } catch (err) {
    throw new Error("Failed to list finances");
  }
}
