import { rtkEnvelope, rtkJson } from "../api/rtkTransport";

export type AreaOption = { _id: string; name: string };
export type CustomerOption = { _id: string; name: string; sequence?: number | null };

export async function uploadCustomersMany(
  token: string,
  customers: Array<Record<string, unknown>>
): Promise<void> {
  await rtkEnvelope("/api/customers/many", {
    token,
    method: "POST",
    jsonBody: customers,
  });
}

export async function fetchCompanyAreas(token: string): Promise<AreaOption[]> {
  const response = await rtkEnvelope("/api/areas/company", {
    token,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function fetchActiveCustomersForArea(
  token: string,
  areaId: string
): Promise<CustomerOption[]> {
  const response = await rtkEnvelope(`/api/customers/area/${areaId}/active`, {
    token,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCustomerWithSequence(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await rtkEnvelope("/api/customers/create-with-sequence", {
    token,
    method: "POST",
    jsonBody: payload,
  });
  return {
    ok: response.ok,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}

export async function uploadCustomersWithOrders(
  token: string,
  formData: FormData
): Promise<{ ok: boolean; data: Record<string, any> }> {
  const response = await rtkEnvelope("/api/customers/uploadCustomersWithOrders", {
    token,
    method: "POST",
    body: formData,
  });
  return {
    ok: response.ok,
    data: response.data ?? {},
  };
}

export async function updateCustomerDiscount(
  token: string,
  customerId: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await rtkEnvelope(`/api/customers/${customerId}`, {
    token,
    method: "PUT",
    jsonBody: payload,
  });
  return {
    ok: response.ok,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}
