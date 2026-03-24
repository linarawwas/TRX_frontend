import { apiClient } from "../../api/client";
import { authAxiosConfig, jsonAxiosConfig } from "../api/http";

export interface Area {
  _id: string;
  name: string;
  sequence?: number | null;
}

export async function fetchAreasByCompany(token: string): Promise<Area[]> {
  const { data } = await apiClient.get("/api/areas/company", authAxiosConfig(token));
  return Array.isArray(data) ? data : [];
}

export async function fetchAreasByDay(token: string, dayId: string, companyId: string): Promise<Area[]> {
  const { data } = await apiClient.post(
    `/api/areas/days/${dayId}`,
    { companyId },
    jsonAxiosConfig(token)
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
  const { data } = await apiClient.get(
    `/api/customers/area/${areaId}`,
    authAxiosConfig(token)
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
  await apiClient.post(
    `/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      orderedCustomerIds,
      force: options?.force ?? true,
      startAt: options?.startAt ?? 1,
    },
    jsonAxiosConfig(token)
  );
}

