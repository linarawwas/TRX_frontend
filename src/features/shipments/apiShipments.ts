// src/features/shipments/apiShipments.ts
import axios from "axios";
import { API_BASE } from "../../config/api";

const BASE = process.env.REACT_APP_API_BASE_URL || API_BASE;

export interface DateObject {
  day: number | null;
  month: number | null;
  year: number | null;
}

export interface ShipmentData {
  _id: string;
  dayId: string;
  date: { day: number; month: number; year: number };
  companyId: string;
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

export interface ShipmentsRangeResponse {
  shipments: ShipmentData[];
}

export async function fetchShipmentsByRange(
  token: string,
  companyId: string,
  fromDate: DateObject,
  toDate: DateObject
): Promise<ShipmentData[]> {
  const { data } = await axios.post<ShipmentsRangeResponse>(
    `${BASE}/api/shipments/range`,
    { companyId, fromDate, toDate },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return Array.isArray(data?.shipments) ? data.shipments : [];
}

