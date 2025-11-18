// utils/distributorApi.ts
export type DateRange = { from?: string; to?: string };

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** GET /api/distributors (lightweight list) */
export async function listDistributors(token: string) {
  const res = await fetch("https://trx-api.linarawas.com//api/distributors", {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to list distributors");
  return res.json();
}

/** GET /api/distributors/summary?from&to (one call for all cards) */
export async function distributorsSummary(token: string, range: DateRange) {
  const qs = new URLSearchParams();
  console.log(qs);
  if (range.from) qs.set("from", range.from);
  if (range.to) qs.set("to", range.to);
  const res = await fetch(
    `https://trx-api.linarawas.com//api/distributors/summary?${qs.toString()}`,
    {
      headers: authHeaders(token),
    }
  );
  if (!res.ok) throw new Error("Failed to load distributors summary");
  return res.json(); // [{ _id, name, customersCount, deliveredSum, revenueUSD, commissionUSD }, ...]
}

/** POST /api/distributors */
export async function createDistributor(
  token: string,
  payload: { name: string; commissionPct?: number }
) {
  const res = await fetch("https://trx-api.linarawas.com//api/distributors", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to create distributor");
  return data;
}

/** PATCH /api/distributors/:id */
export async function updateDistributor(
  token: string,
  id: string,
  payload: Partial<{ name: string; commissionPct: number }>
) {
  const res = await fetch(`https://trx-api.linarawas.com//api/distributors/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to update distributor");
  return data;
}

/** DELETE /api/distributors/:id */
export async function deleteDistributor(token: string, id: string) {
  const res = await fetch(`https://trx-api.linarawas.com//api/distributors/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to delete distributor");
  return data;
}

/** GET /api/distributors/:id/customers */
export async function distributorCustomers(token: string, id: string) {
  const res = await fetch(
    `https://trx-api.linarawas.com//api/distributors/${id}/customers`,
    {
      headers: authHeaders(token),
    }
  );
  if (!res.ok) throw new Error("Failed to load distributor customers");
  return res.json(); // [{ _id, name, phone, areaId, deliveredSum, totalUSD }...]
}

/** GET /api/distributors/:id/summary?from&to (stats for one) */
export async function distributorSummary(
  token: string,
  id: string,
  range: DateRange
) {
  const qs = new URLSearchParams();
  if (range.from) qs.set("from", range.from);
  if (range.to) qs.set("to", range.to);
  const res = await fetch(
    `https://trx-api.linarawas.com//api/distributors/${id}/detail?${qs.toString()}`,
    {
      headers: authHeaders(token),
    }
  );
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json(); // { deliveredSum, revenueUSD, commissionUSD, customersCount }
}

/** PATCH /api/distributors/customers/:customerId/assign */
export async function assignCustomerToDistributor(
  token: string,
  customerId: string,
  distributorId: string
) {
  const res = await fetch(
    `https://trx-api.linarawas.com//api/distributors/customers/${customerId}/assign`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ distributorId }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to assign");
  return data;
}

/** PATCH /api/distributors/customers/:customerId/unassign */
export async function unassignCustomerFromDistributor(
  token: string,
  customerId: string
) {
  const res = await fetch(
    `https://trx-api.linarawas.com//api/distributors/customers/${customerId}/unassign`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to unassign");
  return data;
}
