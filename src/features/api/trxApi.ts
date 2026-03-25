import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE } from "../../config/api";

export interface DateObj {
  day: number;
  month: number;
  year: number;
}

export interface ShipmentSummary {
  carryingForDelivery: number;
  calculatedDelivered: number;
  calculatedReturned: number;
  shipmentLiraPayments: number;
  shipmentUSDPayments: number;
  shipmentLiraExtraProfits: number;
  shipmentUSDExtraProfits: number;
  shipmentLiraExpenses: number;
  shipmentUSDExpenses: number;
}

export interface ListShipmentsRangeRequest {
  companyId?: string;
  fromDate: DateObj;
  toDate: DateObj;
}

export interface ListShipmentsRangeResponse {
  shipments: ShipmentSummary[];
}

export interface ShipmentsOrdersByDateRequest {
  date?: string;
  includeExternal?: boolean;
}

type OrderPayment = {
  amount: number;
  currency: "USD" | "LBP";
  date?: string;
};

export interface ShipmentOrder {
  _id: string;
  customerid: string;
  customerObjId?: string;
  customerName?: string;
  productId: number;
  delivered: number;
  returned: number;
  payments?: OrderPayment[];
  sumUSD?: number;
  sumLBP?: number;
  createdAt?: string;
  orderTime?: string;
  type?: number;
}

export interface ShipmentWithOrders {
  _id: string;
  orders: ShipmentOrder[];
}

export interface ShipmentsOrdersByDateResponse {
  shipments?: ShipmentWithOrders[];
  date?: {
    year?: number;
    month?: number;
    day?: number;
  };
}

export const trxApi = createApi({
  reducerPath: "trxApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token: string | null = state?.user?.token ?? null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    listShipmentsRange: builder.query<
      ListShipmentsRangeResponse,
      ListShipmentsRangeRequest
    >({
      query: (body) => ({
        url: "/api/shipments/range",
        method: "POST",
        body,
      }),
    }),
    shipmentsOrdersByDate: builder.query<
      ShipmentsOrdersByDateResponse,
      ShipmentsOrdersByDateRequest
    >({
      query: ({ date, includeExternal }) => {
        const params = new URLSearchParams();
        params.set("includeExternal", includeExternal ? "true" : "false");
        if (date) {
          params.set("date", date);
        }
        return `/api/shipments/orders/by-date?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useListShipmentsRangeQuery,
  useLazyListShipmentsRangeQuery,
  useLazyShipmentsOrdersByDateQuery,
} = trxApi;

