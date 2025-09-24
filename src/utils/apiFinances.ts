// src/utils/apiFinances.ts
const API = "http://localhost:5000";
export async function createFinance(token: string, body: any) {
  const res = await fetch(`${API}/api/finances`, {
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
export async function dailySummary(token: string, dateISO: string) {
  const url = new URL(`${API}/api/finances/summary/daily`);
  url.searchParams.set("date", dateISO);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
export async function monthlySummary(token: string, y: number, m: number) {
  const url = new URL(`${API}/api/finances/summary/monthly`);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
export async function listCategories(token: string) {
  const res = await fetch(`${API}/api/finance-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
