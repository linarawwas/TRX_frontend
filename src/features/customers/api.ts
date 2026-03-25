import { rtkResult, type ApiResult } from "../api/rtkTransport";

export type AreaOption = { _id: string; name: string };
export type CustomerOption = { _id: string; name: string; sequence?: number | null };

export async function uploadCustomersMany(
  token: string,
  customers: Array<Record<string, unknown>>
): Promise<ApiResult<null>> {
  return rtkResult<null>("/api/customers/many", {
    token,
    method: "POST",
    jsonBody: customers,
    fallbackMessage: "Error uploading customers",
  });
}

export async function fetchCompanyAreas(token: string): Promise<ApiResult<AreaOption[]>> {
  const response = await rtkResult<unknown>("/api/areas/company", {
    token,
    fallbackMessage: "Error fetching areas",
  });
  if (response.error) return { data: null, error: response.error };
  return {
    data: Array.isArray(response.data) ? (response.data as AreaOption[]) : [],
    error: null,
  };
}

export async function fetchActiveCustomersForArea(
  token: string,
  areaId: string
): Promise<ApiResult<CustomerOption[]>> {
  const response = await rtkResult<unknown>(`/api/customers/area/${areaId}/active`, {
    token,
    fallbackMessage: "Error fetching customers",
  });
  if (response.error) return { data: null, error: response.error };
  return {
    data: Array.isArray(response.data) ? (response.data as CustomerOption[]) : [],
    error: null,
  };
}

export async function createCustomerWithSequence(
  token: string,
  payload: Record<string, unknown>
): Promise<ApiResult<Record<string, unknown>>> {
  const response = await rtkResult<Record<string, unknown>>(
    "/api/customers/create-with-sequence",
    {
      token,
      method: "POST",
      jsonBody: payload,
      fallbackMessage: "فشل إنشاء الزبون",
    }
  );
  return {
    data: (response.data ?? null) as Record<string, unknown> | null,
    error: response.error,
  };
}

export async function uploadCustomersWithOrders(
  token: string,
  formData: FormData
): Promise<ApiResult<Record<string, any>>> {
  const response = await rtkResult<Record<string, any>>(
    "/api/customers/uploadCustomersWithOrders",
    {
      token,
      method: "POST",
      body: formData,
      fallbackMessage: "Upload failed",
    }
  );
  return {
    data: (response.data ?? null) as Record<string, any> | null,
    error: response.error,
  };
}

export async function updateCustomerDiscount(
  token: string,
  customerId: string,
  payload: Record<string, unknown>
): Promise<ApiResult<Record<string, unknown>>> {
  const response = await rtkResult<Record<string, unknown>>(
    `/api/customers/${customerId}`,
    {
      token,
      method: "PUT",
      jsonBody: payload,
      fallbackMessage: "فشل حفظ الخصم",
    }
  );
  return {
    data: (response.data ?? null) as Record<string, unknown> | null,
    error: response.error,
  };
}
