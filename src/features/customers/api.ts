import { apiClient } from "../../api/client";

export type AreaOption = { _id: string; name: string };
export type CustomerOption = { _id: string; name: string; sequence?: number | null };

export async function uploadCustomersMany(
  token: string,
  customers: Array<Record<string, unknown>>
): Promise<void> {
  await apiClient.post("/api/customers/many", customers, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // Preserve old behavior where caller did not check response.ok.
    validateStatus: () => true,
  });
}

export async function fetchCompanyAreas(token: string): Promise<AreaOption[]> {
  const response = await apiClient.get<AreaOption[]>("/api/areas/company", {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function fetchActiveCustomersForArea(
  token: string,
  areaId: string
): Promise<CustomerOption[]> {
  const response = await apiClient.get<CustomerOption[]>(
    `/api/customers/area/${areaId}/active`,
    {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    }
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCustomerWithSequence(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await apiClient.post<Record<string, unknown>>(
    "/api/customers/create-with-sequence",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}

export async function uploadCustomersWithOrders(
  token: string,
  formData: FormData
): Promise<{ ok: boolean; data: Record<string, any> }> {
  const response = await apiClient.post<Record<string, any>>(
    "/api/customers/uploadCustomersWithOrders",
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    data: response.data ?? {},
  };
}

export async function updateCustomerDiscount(
  token: string,
  customerId: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await apiClient.put<Record<string, unknown>>(
    `/api/customers/${customerId}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}
