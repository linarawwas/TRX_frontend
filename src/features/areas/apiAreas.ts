import { runUnifiedRequest } from "../api/rtkRequest";

export interface Area {
  _id: string;
  name: string;
  sequence?: number | null;
}

export async function fetchAreasByCompany(token: string): Promise<Area[]> {
  const data = await runUnifiedRequest<unknown>(
    { url: "/api/areas/company", token },
    "Failed to fetch areas"
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchAreasByDay(token: string, dayId: string, companyId: string): Promise<Area[]> {
  const data = await runUnifiedRequest<any>(
    {
      url: `/api/areas/days/${dayId}`,
      method: "POST",
      token,
      body: { companyId },
    },
    "Failed to fetch day areas"
  );
  return Array.isArray(data) ? data : Array.isArray(data?.areas) ? data.areas : [];
}

export async function fetchCustomersByArea(token: string, areaId: string): Promise<Array<{
  _id: string;
  name: string;
  address: string;
  phone: string;
  sequence?: number | null;
  isActive?: boolean;
}>> {
  const data = await runUnifiedRequest<unknown>(
    {
      url: `/api/customers/area/${areaId}`,
      token,
    },
    "Failed to fetch customers"
  );
  return Array.isArray(data) ? data : [];
}

export async function reorderCustomersInArea(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[],
  options?: { force?: boolean; startAt?: number }
): Promise<void> {
  await runUnifiedRequest(
    {
      url: `/api/areas/${areaId}/reorder`,
      method: "POST",
      token,
      params: { companyId },
      body: {
        orderedCustomerIds,
        force: options?.force ?? true,
        startAt: options?.startAt ?? 1,
      },
    },
    "Failed to reorder customers"
  );
}

