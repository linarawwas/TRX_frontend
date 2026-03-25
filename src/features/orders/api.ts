import { rtkResult, type ApiResult } from "../api/rtkTransport";

export type CustomerOrder = any;

export async function fetchCustomerOrders(
  token: string,
  customerId: string
): Promise<ApiResult<CustomerOrder[]>> {
  const response = await rtkResult<unknown>(`/api/orders/customer/${customerId}`, {
    token,
    fallbackMessage: "Failed to fetch customer orders",
  });
  if (response.error) return { data: null, error: response.error };
  return {
    data: Array.isArray(response.data) ? (response.data as CustomerOrder[]) : [],
    error: null,
  };
}
