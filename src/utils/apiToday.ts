// src/utils/apiToday.ts
export async function fetchShipmentsOrders(
  token: string,
  opts?: { date?: string; includeExternal?: boolean }
) {
  const params = new URLSearchParams();
  params.set("includeExternal", opts?.includeExternal ? "true" : "false");
  if (opts?.date) params.set("date", opts.date);

  const url = `https://trx-api.theagilelabs.com/api/shipments/orders/by-date?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
