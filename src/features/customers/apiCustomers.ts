import { runUnifiedRequest } from "../api/rtkRequest";
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

export async function fetchCustomersByCompany(token: string): Promise<CustomersResponse> {
  const data = await runUnifiedRequest<{
    active?: Customer[];
    inactive?: Customer[];
  }>(
    {
      url: "/api/customers/company",
      token,
    },
    "Failed to fetch company customers"
  );
  return {
    active: Array.isArray(data?.active) ? data.active : [],
    inactive: Array.isArray(data?.inactive) ? data.inactive : [],
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
): Promise<CustomerDetail> {
  return runUnifiedRequest<CustomerDetail>(
    {
      url: `/api/customers/${customerId}`,
      token,
    },
    "Failed to fetch customer"
  );
}

export async function fetchActiveCustomersByArea(
  token: string,
  areaId: string
): Promise<ActiveAreaCustomer[]> {
  const data = await runUnifiedRequest<unknown>(
    {
      url: `/api/customers/area/${areaId}/active`,
      token,
    },
    "Failed to fetch active customers"
  );
  return Array.isArray(data) ? (data as ActiveAreaCustomer[]) : [];
}

export async function updateCustomerById(
  token: string,
  customerId: string,
  payload: UpdateCustomerPayload
): Promise<CustomerDetail> {
  return runUnifiedRequest<CustomerDetail>(
    {
      url: `/api/customers/${customerId}`,
      token,
      method: "PATCH",
      body: payload,
    },
    "Failed to update customer"
  );
}

export async function deactivateCustomer(
  token: string,
  customerId: string
): Promise<void> {
  await runUnifiedRequest(
    {
      url: `/api/customers/${customerId}/deactivate`,
      token,
      method: "PATCH",
    },
    "Failed to deactivate customer"
  );
}

export async function restoreCustomer(
  token: string,
  customerId: string,
  payload: RestoreCustomerPayload
): Promise<unknown> {
  return runUnifiedRequest(
    {
      url: `/api/customers/${customerId}/restore`,
      token,
      method: "PATCH",
      body: payload,
    },
    "Failed to restore customer"
  );
}

export async function hardDeleteCustomer(
  token: string,
  customerId: string
): Promise<unknown> {
  return runUnifiedRequest(
    {
      url: `/api/customers/${customerId}/hard`,
      token,
      method: "DELETE",
    },
    "Failed to delete customer"
  );
}

export async function updateCustomerOpening(
  token: string,
  customerId: string,
  payload: OpeningEditorPayload
): Promise<unknown> {
  return runUnifiedRequest(
    {
      url: `/api/customers/${customerId}/opening`,
      token,
      method: "PATCH",
      body: payload,
    },
    "Failed to update opening"
  );
}

export async function fetchAndCacheCustomerInvoice(
  customerId: string,
  token: string
): Promise<void> {
  try {
    const data = await runUnifiedRequest<{ sums?: unknown }>(
      {
        url: `/api/customers/reciept/${customerId}`,
        token,
      },
      "Failed to fetch customer invoice"
    );
    if (data?.sums) {
      await saveCustomerInvoicesToDB(customerId, data.sums);
    }
  } catch {
    // Swallow to preserve existing caller behavior.
  }
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
): Promise<CustomerStatementResponse> {
  const [customer, statement] = await Promise.all([
    fetchCustomerById(token, customerId),
    runUnifiedRequest<{
      orders?: CustomerStatementOrder[];
      initial?: CustomerStatementInitialSummary;
    }>(
      {
        url: `/api/orders/customer/${customerId}/with-initial`,
        token,
      },
      "Failed to fetch customer statement"
    ),
  ]);

  return {
    customer,
    orders: Array.isArray(statement?.orders) ? statement.orders : [],
    initial: statement?.initial ?? {
      bottlesLeft: 0,
      balanceUSD: 0,
      at: null,
      orderId: null,
    },
  };
}

