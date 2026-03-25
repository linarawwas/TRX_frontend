import { rtkEnvelope } from "../api/rtkTransport";

export type CustomerOrder = any;

export async function fetchCustomerOrders(
  token: string,
  customerId: string
): Promise<CustomerOrder[]> {
  const response = await rtkEnvelope(`/api/orders/customer/${customerId}`, {
    token,
  });
  return Array.isArray(response.data) ? response.data : [];
}
