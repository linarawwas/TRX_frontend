// src/utils/apiToday.ts
export async function fetchTodayShipmentsOrders(token: string, includeExternal = false) {
  const url = `http://localhost:5000/api/shipments/orders/today?includeExternal=${includeExternal ? 'true' : 'false'}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
