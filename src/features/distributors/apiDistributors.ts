import { runUnifiedRequest } from "../api/rtkRequest";

export type DateRange = { from?: string; to?: string };

export interface DistributorRecord {
  _id: string;
  name?: string;
  phone?: string;
  commissionPct?: number;
}

function withRange(path: string, range: DateRange) {
  const query = new URLSearchParams();
  if (range.from) query.set("from", range.from);
  if (range.to) query.set("to", range.to);
  return query.toString() ? `${path}?${query.toString()}` : path;
}

export async function listDistributors(token: string) {
  return runUnifiedRequest<DistributorRecord[]>(
    { url: "/api/distributors", token },
    "Failed to list distributors"
  );
}

export async function distributorsSummary(token: string, range: DateRange) {
  return runUnifiedRequest(
    { url: withRange("/api/distributors/summary", range), token },
    "Failed to load distributors summary"
  );
}

export async function createDistributor(
  token: string,
  payload: { name: string; commissionPct?: number }
) {
  return runUnifiedRequest(
    { url: "/api/distributors", token, method: "POST", body: payload },
    "Failed to create distributor"
  );
}

export async function updateDistributor(
  token: string,
  id: string,
  payload: Partial<{ name: string; commissionPct: number }>
) {
  return runUnifiedRequest(
    { url: `/api/distributors/${id}`, token, method: "PATCH", body: payload },
    "Failed to update distributor"
  );
}

export async function deleteDistributor(token: string, id: string) {
  return runUnifiedRequest(
    { url: `/api/distributors/${id}`, token, method: "DELETE" },
    "Failed to delete distributor"
  );
}

export async function distributorCustomers(token: string, id: string) {
  return runUnifiedRequest(
    { url: `/api/distributors/${id}/customers`, token },
    "Failed to load distributor customers"
  );
}

export async function distributorSummary(
  token: string,
  id: string,
  range: DateRange
) {
  return runUnifiedRequest(
    { url: withRange(`/api/distributors/${id}/detail`, range), token },
    "Failed to load summary"
  );
}

export async function assignCustomerToDistributor(
  token: string,
  customerId: string,
  distributorId: string
) {
  return runUnifiedRequest(
    {
      url: `/api/distributors/customers/${customerId}/assign`,
      token,
      method: "PATCH",
      body: { distributorId },
    },
    "Failed to assign"
  );
}

export async function unassignCustomerFromDistributor(
  token: string,
  customerId: string
) {
  return runUnifiedRequest(
    {
      url: `/api/distributors/customers/${customerId}/unassign`,
      token,
      method: "PATCH",
    },
    "Failed to unassign"
  );
}
