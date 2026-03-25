import { runUnifiedRequest, UnifiedRequestError } from "../api/rtkRequest";

export async function fetchDays(
  token: string
): Promise<Array<{ _id: string; name: string }>> {
  const response = await runUnifiedRequest<unknown>(
    { url: "/api/days", token },
    "Failed to fetch days"
  );
  return Array.isArray(response) ? response : [];
}

export async function createArea(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const data = await runUnifiedRequest<Record<string, unknown>>(
      { url: "/api/areas", method: "POST", token, body: payload },
      "Failed to create area"
    );
    return { ok: true, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return { ok: false, data: (error.body as Record<string, unknown>) ?? {} };
    }
    return { ok: false, data: {} };
  }
}

export async function fetchCustomersByArea(
  token: string,
  areaId: string
): Promise<Array<{ _id: string; name?: string; sequence?: number }>> {
  const response = await runUnifiedRequest<unknown>(
    { url: `/api/customers/area/${areaId}`, token },
    "Failed to fetch area customers"
  );
  return Array.isArray(response) ? response : [];
}

export async function reorderAreaCustomers(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[]
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const data = await runUnifiedRequest<Record<string, unknown>>(
      {
        url: `/api/areas/${areaId}/reorder`,
        method: "POST",
        token,
        params: { companyId },
        body: {
          orderedCustomerIds,
          force: true,
          startAt: 1,
        },
      },
      "Failed to reorder area customers"
    );
    return { ok: true, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return { ok: false, data: (error.body as Record<string, unknown>) ?? {} };
    }
    return { ok: false, data: {} };
  }
}
