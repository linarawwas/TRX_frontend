import { apiClient } from "../../api/client";

export interface DefaultProductRecord {
  _id: string;
  key: string;
  value: string;
  companyId: string;
  __v: number;
}

export async function fetchDefaultProductsByCompany(
  token: string,
  companyId: string
): Promise<DefaultProductRecord[]> {
  const response = await apiClient.get<DefaultProductRecord[]>(
    `/api/adminDeterminedDefaults/company/${companyId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function updateDefaultProduct(
  token: string,
  payload: { value: string; companyId: string }
): Promise<void> {
  await apiClient.put("/api/adminDeterminedDefaults/defaultProduct", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
