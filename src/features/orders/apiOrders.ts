import { rtkResult, type ApiResult } from "../api/rtkTransport";

export interface Payment {
  date: string;
  amount: number;
  currency: "USD" | "LBP";
  exchangeRate: string;
  _id: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  areaId: string;
  address: string;
  __v: number;
  companyId: string;
}

export interface Product {
  _id: string;
  id: number;
  type: string;
  priceInDollars: number;
  isReturnable: boolean;
  companyId: string;
  __v: number;
}

export interface Order {
  _id: string;
  recordedBy: string;
  type?: number; // 1: Initial, 2: Normal, 3: External
  delivered: number;
  returned: number;
  customerId: string;
  payments: Payment[];
  productId: number;
  checkout: number;
  SumOfPaymentsInLiras: number;
  SumOfPaymentsInDollars: number;
  paid: number;
  paymentCurrency: string;
  exchangeRate: string;
  total: number;
  timestamp: string;
  companyId: string;
  shipmentId: string;
  __v: number;
  customer: Customer;
  product: Product;
}

export async function fetchOrdersByCompany(
  token: string,
  companyId: string
): Promise<ApiResult<Order[]>> {
  const result = await rtkResult<unknown>(
    `/api/orders/company/${companyId}`,
    { token, fallbackMessage: "Failed to fetch company orders" }
  );
  if (result.error) return { data: null, error: result.error };
  return { data: Array.isArray(result.data) ? (result.data as Order[]) : [], error: null };
}

export interface UpdateOrderPayload {
  delivered?: number;
  returned?: number;
  usdTotal?: number;
  lbpTotal?: number;
}

export interface AddPaymentPayload {
  paymentAmount: number;
  paymentCurrency: "USD" | "LBP";
}

export interface OrdersWithInitialResponse {
  orders?: Order[];
  initial?: {
    bottlesLeft: number;
    balanceUSD: number;
    at: string | null;
    orderId: string | null;
  };
}

export async function fetchOrderById(
  token: string,
  orderId: string
): Promise<ApiResult<Order>> {
  return rtkResult<Order>(`/api/orders/${orderId}`, {
    token,
    fallbackMessage: "Failed to fetch order",
  });
}

export async function updateOrderById(
  token: string,
  orderId: string,
  payload: UpdateOrderPayload
): Promise<ApiResult<Order>> {
  return rtkResult<Order>(`/api/orders/${orderId}`, {
    token,
    method: "PATCH",
    jsonBody: payload,
    fallbackMessage: "Failed to update order",
  });
}

export async function deleteOrderById(
  token: string,
  orderId: string
): Promise<ApiResult<null>> {
  return rtkResult<null>(`/api/orders/${orderId}`, {
    token,
    method: "DELETE",
    fallbackMessage: "Failed to delete order",
  });
}

export async function addPaymentToOrder(
  token: string,
  orderId: string,
  payload: AddPaymentPayload
): Promise<ApiResult<unknown>> {
  return rtkResult(`/api/orders/addPayment/${orderId}`, {
    token,
    method: "PUT",
    jsonBody: payload,
    fallbackMessage: "Failed to add payment",
  });
}

export async function fetchOrdersByCustomer(
  token: string,
  customerId: string
): Promise<ApiResult<Order[]>> {
  const result = await rtkResult<unknown>(`/api/orders/customer/${customerId}`, {
    token,
    fallbackMessage: "Failed to fetch customer orders",
  });
  if (result.error) return { data: null, error: result.error };
  return { data: Array.isArray(result.data) ? (result.data as Order[]) : [], error: null };
}

export async function fetchOrdersByCustomerWithInitial(
  token: string,
  customerId: string
): Promise<ApiResult<OrdersWithInitialResponse>> {
  const result = await rtkResult<OrdersWithInitialResponse>(
    `/api/orders/customer/${customerId}/with-initial`,
    {
      token,
      fallbackMessage: "Failed to fetch customer statement orders",
    }
  );
  if (result.error) return { data: null, error: result.error };
  const payload = result.data ?? {};
  return {
    data: {
      orders: Array.isArray(payload.orders) ? payload.orders : [],
      initial: payload.initial,
    },
    error: null,
  };
}

