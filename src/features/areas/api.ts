import { apiClient } from "../../api/client";

export async function fetchDays(
  token: string
): Promise<Array<{ _id: string; name: string }>> {
  const response = await apiClient.get("/api/days", {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createArea(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await apiClient.post<Record<string, unknown>>(
    "/api/areas",
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

export async function fetchCustomersByArea(
  token: string,
  areaId: string
): Promise<Array<{ _id: string; name?: string; sequence?: number }>> {
  const response = await apiClient.get(`/api/customers/area/${areaId}`, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function reorderAreaCustomers(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[]
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await apiClient.post<Record<string, unknown>>(
    `/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      orderedCustomerIds,
      force: true,
      startAt: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}
