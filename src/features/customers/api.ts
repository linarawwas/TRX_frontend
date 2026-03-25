import { runUnifiedRequest, UnifiedRequestError } from "../api/rtkRequest";

export type AreaOption = { _id: string; name: string };
export type CustomerOption = { _id: string; name: string; sequence?: number | null };

export async function uploadCustomersMany(
  token: string,
  customers: Array<Record<string, unknown>>
): Promise<void> {
  await runUnifiedRequest(
    {
      url: "/api/customers/many",
      method: "POST",
      token,
      body: customers,
    },
    "Failed to upload customers"
  );
}

export async function fetchCompanyAreas(token: string): Promise<AreaOption[]> {
  const response = await runUnifiedRequest<AreaOption[] | unknown>(
    { url: "/api/areas/company", token },
    "Failed to fetch areas"
  );
  return Array.isArray(response) ? response : [];
}

export async function fetchActiveCustomersForArea(
  token: string,
  areaId: string
): Promise<CustomerOption[]> {
  const response = await runUnifiedRequest<CustomerOption[] | unknown>(
    {
      url: `/api/customers/area/${areaId}/active`,
      token,
    },
    "Failed to fetch customers"
  );
  return Array.isArray(response) ? response : [];
}

export async function createCustomerWithSequence(
  token: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const data = await runUnifiedRequest<Record<string, unknown>>(
      {
        url: "/api/customers/create-with-sequence",
        method: "POST",
        token,
        body: payload,
      },
      "Failed to create customer"
    );
    return { ok: true, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return { ok: false, data: (error.body as Record<string, unknown>) ?? {} };
    }
    return { ok: false, data: {} };
  }
}

export async function uploadCustomersWithOrders(
  token: string,
  formData: FormData
): Promise<{ ok: boolean; data: Record<string, any> }> {
  try {
    const data = await runUnifiedRequest<Record<string, any>>(
      {
        url: "/api/customers/uploadCustomersWithOrders",
        method: "POST",
        token,
        body: formData,
      },
      "Failed to upload customers with orders"
    );
    return { ok: true, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return { ok: false, data: (error.body as Record<string, any>) ?? {} };
    }
    return { ok: false, data: {} };
  }
}

export async function updateCustomerDiscount(
  token: string,
  customerId: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const data = await runUnifiedRequest<Record<string, unknown>>(
      {
        url: `/api/customers/${customerId}`,
        method: "PUT",
        token,
        body: payload,
      },
      "Failed to update customer"
    );
    return { ok: true, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return { ok: false, data: (error.body as Record<string, unknown>) ?? {} };
    }
    return { ok: false, data: {} };
  }
}
