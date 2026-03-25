import { rtkJson } from "../api/rtkTransport";

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
  return rtkJson<DistributorRecord[]>("/api/distributors", {
    token,
    fallbackMessage: "Failed to list distributors",
  });
}

export async function distributorsSummary(token: string, range: DateRange) {
  return rtkJson(withRange("/api/distributors/summary", range), {
    token,
    fallbackMessage: "Failed to load distributors summary",
  });
}

export async function createDistributor(
  token: string,
  payload: { name: string; commissionPct?: number }
) {
  return rtkJson("/api/distributors", {
    token,
    method: "POST",
    jsonBody: payload,
    fallbackMessage: "Failed to create distributor",
  });
}

export async function updateDistributor(
  token: string,
  id: string,
  payload: Partial<{ name: string; commissionPct: number }>
) {
  return rtkJson(`/api/distributors/${id}`, {
    token,
    method: "PATCH",
    jsonBody: payload,
    fallbackMessage: "Failed to update distributor",
  });
}

export async function deleteDistributor(token: string, id: string) {
  return rtkJson(`/api/distributors/${id}`, {
    token,
    method: "DELETE",
    fallbackMessage: "Failed to delete distributor",
  });
}

export async function distributorCustomers(token: string, id: string) {
  return rtkJson(`/api/distributors/${id}/customers`, {
    token,
    fallbackMessage: "Failed to load distributor customers",
  });
}

export async function distributorSummary(
  token: string,
  id: string,
  range: DateRange
) {
  return rtkJson(withRange(`/api/distributors/${id}/detail`, range), {
    token,
    fallbackMessage: "Failed to load summary",
  });
}

export async function assignCustomerToDistributor(
  token: string,
  customerId: string,
  distributorId: string
) {
  return rtkJson(`/api/distributors/customers/${customerId}/assign`, {
    token,
    method: "PATCH",
    jsonBody: { distributorId },
    fallbackMessage: "Failed to assign",
  });
}

export async function unassignCustomerFromDistributor(
  token: string,
  customerId: string
) {
  return rtkJson(`/api/distributors/customers/${customerId}/unassign`, {
    token,
    method: "PATCH",
    fallbackMessage: "Failed to unassign",
  });
}
