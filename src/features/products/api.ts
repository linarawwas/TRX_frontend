import { runUnifiedRequest } from "../api/rtkRequest";

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
  const response = await runUnifiedRequest<DefaultProductRecord[] | unknown>(
    {
      url: `/api/adminDeterminedDefaults/company/${companyId}`,
      token,
    },
    "Failed to fetch default products"
  );
  return Array.isArray(response) ? response : [];
}

export async function updateDefaultProduct(
  token: string,
  payload: { value: string; companyId: string }
): Promise<void> {
  await runUnifiedRequest(
    {
      url: "/api/adminDeterminedDefaults/defaultProduct",
      method: "PUT",
      token,
      body: payload,
    },
    "Failed to update default product"
  );
}
