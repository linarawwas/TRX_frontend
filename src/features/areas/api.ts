import { rtkResult, type ApiResult } from "../api/rtkTransport";

export async function fetchDays(
  token: string
): Promise<ApiResult<Array<{ _id: string; name: string }>>> {
  const response = await rtkResult<unknown>("/api/days", {
    token,
    fallbackMessage: "فشل في تحميل الأيام",
  });
  if (response.error) return { data: null, error: response.error };
  return {
    data: Array.isArray(response.data)
      ? (response.data as Array<{ _id: string; name: string }>)
      : [],
    error: null,
  };
}

export async function createArea(
  token: string,
  payload: Record<string, unknown>
): Promise<ApiResult<Record<string, unknown>>> {
  return rtkResult<Record<string, unknown>>("/api/areas", {
    token,
    method: "POST",
    jsonBody: payload,
    fallbackMessage: "فشل في إنشاء المنطقة",
  });
}

export async function fetchCustomersByArea(
  token: string,
  areaId: string
): Promise<ApiResult<Array<{ _id: string; name?: string; sequence?: number }>>> {
  const response = await rtkResult<unknown>(`/api/customers/area/${areaId}`, {
    token,
    fallbackMessage: "تعذر تحميل زبائن هذه المنطقة",
  });
  if (response.error) return { data: null, error: response.error };
  return {
    data: Array.isArray(response.data)
      ? (response.data as Array<{ _id: string; name?: string; sequence?: number }>)
      : [],
    error: null,
  };
}

export async function reorderAreaCustomers(
  token: string,
  areaId: string,
  companyId: string,
  orderedCustomerIds: string[]
): Promise<ApiResult<Record<string, unknown>>> {
  return rtkResult<Record<string, unknown>>(
    `/api/areas/${areaId}/reorder?companyId=${companyId}`,
    {
      token,
      method: "POST",
      jsonBody: {
        orderedCustomerIds,
        force: true,
        startAt: 1,
      },
      fallbackMessage: "تعذر حفظ الترتيب",
    }
  );
}
