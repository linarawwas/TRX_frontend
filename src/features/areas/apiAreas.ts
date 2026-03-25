import { rtkResult, type ApiResult } from "../api/rtkTransport";

export interface Area {
  _id: string;
  name: string;
  sequence?: number | null;
}

export async function fetchAreasByCompany(token: string): Promise<ApiResult<Area[]>> {
  const result = await rtkResult<unknown>("/api/areas/company", {
    token,
    fallbackMessage: "Failed to fetch areas",
  });
  if (result.error) return { data: null, error: result.error };
  return { data: Array.isArray(result.data) ? (result.data as Area[]) : [], error: null };
}

export async function fetchAreasByDay(
  token: string,
  dayId: string,
  companyId: string
): Promise<ApiResult<Area[]>> {
  const result = await rtkResult<unknown>(
    `/api/areas/days/${dayId}`,
    { token, method: "POST", jsonBody: { companyId }, fallbackMessage: "Failed to fetch areas by day" }
  );
  if (result.error) return { data: null, error: result.error };
  if (Array.isArray(result.data)) return { data: result.data as Area[], error: null };
  if (
    result.data &&
    typeof result.data === "object" &&
    Array.isArray((result.data as { areas?: unknown }).areas)
  ) {
    return { data: (result.data as { areas: Area[] }).areas, error: null };
  }
  return { data: [], error: null };
}

export async function fetchCustomersByArea(
  token: string,
  areaId: string
): Promise<
  ApiResult<
    Array<{
      _id: string;
      name: string;
      address: string;
      phone: string;
      sequence?: number | null;
      isActive?: boolean;
    }>
  >
> {
  const result = await rtkResult<unknown>(`/api/customers/area/${areaId}`, {
    token,
    fallbackMessage: "Failed to fetch customers by area",
  });
  if (result.error) return { data: null, error: result.error };
  return { data: Array.isArray(result.data) ? (result.data as any[]) : [], error: null };
}

export async function reorderCustomersInArea(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[],
  options?: { force?: boolean; startAt?: number }
): Promise<ApiResult<null>> {
  return rtkResult<null>(
    `/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      token,
      method: "POST",
      jsonBody: {
        orderedCustomerIds,
        force: options?.force ?? true,
        startAt: options?.startAt ?? 1,
      },
      fallbackMessage: "Failed to reorder customers",
    }
  );
}

