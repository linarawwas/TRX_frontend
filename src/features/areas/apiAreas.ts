import { rtkJson, rtkVoid } from "../api/rtkTransport";

export interface Area {
  _id: string;
  name: string;
  sequence?: number | null;
}

export async function fetchAreasByCompany(token: string): Promise<Area[]> {
  const data = await rtkJson<unknown>("/api/areas/company", { token });
  return Array.isArray(data) ? data : [];
}

export async function fetchAreasByDay(token: string, dayId: string, companyId: string): Promise<Area[]> {
  const data = await rtkJson<unknown>(
    `/api/areas/days/${dayId}`,
    { token, method: "POST", jsonBody: { companyId } }
  );
  if (Array.isArray(data)) return data as Area[];
  if (data && typeof data === "object" && Array.isArray((data as { areas?: unknown }).areas)) {
    return (data as { areas: Area[] }).areas;
  }
  return [];
}

export async function fetchCustomersByArea(token: string, areaId: string): Promise<Array<{
  _id: string;
  name: string;
  address: string;
  phone: string;
  sequence?: number | null;
  isActive?: boolean;
}>> {
  const data = await rtkJson<unknown>(`/api/customers/area/${areaId}`, { token });
  return Array.isArray(data) ? data : [];
}

export async function reorderCustomersInArea(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[],
  options?: { force?: boolean; startAt?: number }
): Promise<void> {
  await rtkVoid(
    `/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      token,
      method: "POST",
      jsonBody: {
        orderedCustomerIds,
        force: options?.force ?? true,
        startAt: options?.startAt ?? 1,
      },
    }
  );
}

