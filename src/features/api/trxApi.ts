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
  }),
});

export const { useListShipmentsRangeQuery } = trxApi;

