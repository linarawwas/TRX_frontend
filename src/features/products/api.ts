import { rtkEnvelope, rtkVoid } from "../api/rtkTransport";

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
  const response = await rtkEnvelope(
    `/api/adminDeterminedDefaults/company/${companyId}`,
    { token }
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function updateDefaultProduct(
  token: string,
  payload: { value: string; companyId: string }
): Promise<void> {
  await rtkVoid("/api/adminDeterminedDefaults/defaultProduct", {
    token,
    method: "PUT",
    jsonBody: payload,
  });
}
