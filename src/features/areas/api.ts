import { rtkEnvelope } from "../api/rtkTransport";

export async function fetchDays(
  token: string
): Promise<Array<{ _id: string; name: string }>> {
  const response = await rtkEnvelope("/api/days", {
    token,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createArea(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await rtkEnvelope("/api/areas", {
    token,
    method: "POST",
    jsonBody: payload,
  });
  return {
    ok: response.ok,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}

export async function fetchCustomersByArea(
  token: string,
  areaId: string
): Promise<Array<{ _id: string; name?: string; sequence?: number }>> {
  const response = await rtkEnvelope(`/api/customers/area/${areaId}`, {
    token,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function reorderAreaCustomers(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[]
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await rtkEnvelope(
    `/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      token,
      method: "POST",
      jsonBody: {
        orderedCustomerIds,
        force: true,
        startAt: 1,
      },
    }
  );
  return {
    ok: response.ok,
    data: (response.data ?? {}) as Record<string, unknown>,
  };
}
