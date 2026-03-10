// src/features/areas/apiAreas.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

export interface Area {
  _id: string;
  name: string;
  sequence?: number | null;
}

export async function fetchAreasByCompany(token: string): Promise<Area[]> {
  const { data } = await axios.get(`${API_BASE}/api/areas/company`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchAreasByDay(token: string, dayId: string, companyId: string): Promise<Area[]> {
  const { data } = await axios.post(
    `${API_BASE}/api/areas/days/${dayId}`,
    { companyId },
    { headers: { Authorization: `Bearer ${token}` } }
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
  const { data } = await axios.get(`${API_BASE}/api/customers/area/${areaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function reorderCustomersInArea(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[],
  options?: { force?: boolean; startAt?: number }
): Promise<void> {
  await axios.post(
    `${API_BASE}/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      orderedCustomerIds,
      force: options?.force ?? true,
      startAt: options?.startAt ?? 1,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}

