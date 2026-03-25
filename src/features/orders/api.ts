import { runUnifiedRequest } from "../api/rtkRequest";

export type CustomerOrder = any;

export async function fetchCustomerOrders(
  token: string,
  customerId: string
): Promise<CustomerOrder[]> {
  const response = await runUnifiedRequest<CustomerOrder[] | unknown>(
    {
      url: `/api/orders/customer/${customerId}`,
      token,
    },
    "Failed to fetch customer orders"
  );
  return Array.isArray(response) ? response : [];
}
