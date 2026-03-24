import { apiClient } from "../../api/client";

export type CustomerOrder = any;

export async function fetchCustomerOrders(
  token: string,
  customerId: string
): Promise<CustomerOrder[]> {
  const response = await apiClient.get<CustomerOrder[]>(
    `/api/orders/customer/${customerId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return Array.isArray(response.data) ? response.data : [];
}
