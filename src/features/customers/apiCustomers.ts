import { rtkResult, type ApiResult } from "../api/rtkTransport";
import { saveCustomerInvoicesToDB } from "../../utils/indexedDB";

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  sequence?: number | null;
  isActive?: boolean;
}

export interface CustomersResponse {
  active: Customer[];
  inactive: Customer[];
}

export async function fetchCustomersByCompany(token: string): Promise<ApiResult<CustomersResponse>> {
  const result = await rtkResult<{
    active?: Customer[];
    inactive?: Customer[];
  }>("/api/customers/company", {
    token,
    fallbackMessage: "Failed to fetch company customers",
  });
  if (!result.data) {
    return { data: null, error: result.error };
  }
  return {
    data: {
      active: Array.isArray(result.data.active) ? result.data.active : [],
      inactive: Array.isArray(result.data.inactive) ? result.data.inactive : [],
    },
    error: null,
  };
}

export interface CustomerDetail extends Customer {
  isActive?: boolean;
  hasDiscount?: boolean;
  valueAfterDiscount?: number;
  discountCurrency?: string;
  noteAboutCustomer?: string;
  placement?: string;
  companyId?: string;
  areaId?: { _id: string; name: string } | string | null;
  sequence?: number | null;
}

export interface ActiveAreaCustomer {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  sequence?: number | null;
  isActive?: boolean;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  address?: string;
  areaId?: string;
  placement?: string;
}

export interface RestoreCustomerPayload {
  areaId?: string;
  sequence?: number;
}

export interface OpeningEditorPayload {
  bottlesLeft?: number;
  balanceUSD?: number;
  allowCheckoutBump?: boolean;
}

export async function fetchCustomerById(
  token: string,
  customerId: string
): Promise<ApiResult<CustomerDetail>> {
  return rtkResult<CustomerDetail>(`/api/customers/${customerId}`, {
    token,
    fallbackMessage: "Failed to fetch customer",
  });
}

export async function fetchActiveCustomersByArea(
  token: string,
  areaId: string
): Promise<ApiResult<ActiveAreaCustomer[]>> {
  const result = await rtkResult<unknown>(`/api/customers/area/${areaId}/active`, {
    token,
    fallbackMessage: "Failed to fetch active customers",
  });
  if (result.error) return { data: null, error: result.error };
  return {
    data: Array.isArray(result.data) ? (result.data as ActiveAreaCustomer[]) : [],
    error: null,
  };
}

export async function updateCustomerById(
  token: string,
  customerId: string,
  payload: UpdateCustomerPayload
): Promise<ApiResult<CustomerDetail>> {
  return rtkResult<CustomerDetail>(`/api/customers/${customerId}`, {
    token,
    method: "PATCH",
    jsonBody: payload,
    fallbackMessage: "Failed to update customer",
  });
}

export async function deactivateCustomer(
  token: string,
  customerId: string
): Promise<ApiResult<null>> {
  return rtkResult<null>(`/api/customers/${customerId}/deactivate`, {
    token,
    method: "PATCH",
    fallbackMessage: "Failed to deactivate customer",
  });
}

export async function restoreCustomer(
  token: string,
  customerId: string,
  payload: RestoreCustomerPayload
): Promise<ApiResult<unknown>> {
  return rtkResult(`/api/customers/${customerId}/restore`, {
    token,
    method: "PATCH",
    jsonBody: payload,
    fallbackMessage: "Failed to restore customer",
  });
}

export async function hardDeleteCustomer(
  token: string,
  customerId: string
): Promise<ApiResult<unknown>> {
  return rtkResult(`/api/customers/${customerId}/hard`, {
    token,
    method: "DELETE",
    fallbackMessage: "Failed to delete customer",
  });
}

export async function updateCustomerOpening(
  token: string,
  customerId: string,
  payload: OpeningEditorPayload
): Promise<ApiResult<unknown>> {
  return rtkResult(`/api/customers/${customerId}/opening`, {
    token,
    method: "PATCH",
    jsonBody: payload,
    fallbackMessage: "Failed to update opening",
  });
}

export async function fetchAndCacheCustomerInvoice(
  customerId: string,
  token: string
): Promise<ApiResult<null>> {
  const result = await rtkResult<{ sums?: unknown }>(`/api/customers/reciept/${customerId}`, {
    token,
    fallbackMessage: "Failed to fetch customer invoice",
  });
  if (!result.error && result.data?.sums) {
    await saveCustomerInvoicesToDB(customerId, result.data.sums);
  }
  return { data: null, error: result.error };
}

export interface CustomerStatementInitialSummary {
  bottlesLeft: number;
  balanceUSD: number;
  at: string | null;
  orderId: string | null;
}

export interface CustomerStatementOrder {
  _id: string;
  delivered: number;
  returned: number;
  payments: Array<{
    date: string;
    amount: number;
    currency: "USD" | "LBP";
    exchangeRate?: string;
    rateAtPaymentLBP?: number;
    _id?: string;
  }>;
  checkout: number;
  paid: number;
  timestamp: string;
  unitPriceUSD?: number;
  companyExchangeRateLBPAtSale?: number;
}

export interface CustomerStatementResponse {
  customer: CustomerDetail;
  orders: CustomerStatementOrder[];
  initial: CustomerStatementInitialSummary;
}

export async function fetchCustomerStatement(
  token: string,
  customerId: string
): Promise<ApiResult<CustomerStatementResponse>> {
  const [customerResult, statementResult] = await Promise.all([
    fetchCustomerById(token, customerId),
    rtkResult<{
      orders?: CustomerStatementOrder[];
      initial?: CustomerStatementInitialSummary;
    }>(`/api/orders/customer/${customerId}/with-initial`, {
      token,
      fallbackMessage: "Failed to fetch customer statement",
    }),
  ]);
  if (customerResult.error || !customerResult.data) {
    return { data: null, error: customerResult.error || "Failed to fetch customer statement" };
  }
  if (statementResult.error) {
    return { data: null, error: statementResult.error };
  }

  return {
    data: {
      customer: customerResult.data,
      orders:
        statementResult.data && Array.isArray(statementResult.data.orders)
          ? statementResult.data.orders
          : [],
      initial:
        statementResult.data?.initial ?? {
          bottlesLeft: 0,
          balanceUSD: 0,
          at: null,
          orderId: null,
        },
    },
    error: null,
  };
}

