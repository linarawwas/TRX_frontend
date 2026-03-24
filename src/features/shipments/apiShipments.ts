import { apiClient } from "../../api/client";
import { jsonAxiosConfig, requestJson } from "../api/http";
import {
  saveAreasByDayToDB,
  saveCustomerDiscountToDB,
  saveCustomerInvoicesToDB,
  saveCustomersToDB,
  saveDayToDB,
  saveExchangeRateToDB,
  saveProductTypeToDB,
} from "../../utils/indexedDB";
import { createLogger } from "../../utils/logger";

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

type Area = { _id: string; name: string; customers?: any[]; [k: string]: any };

export type PreloadProgress =
  | { type: "start" }
  | { type: "meta:fetched"; dayAreas: number }
  | { type: "cache:done" }
  | { type: "rate:fetched"; rateLBP: number }
  | { type: "area:start"; index: number; total: number; name?: string }
  | { type: "area:customers"; index: number; total: number; customers: number }
  | { type: "area:done"; index: number; total: number }
  | { type: "done"; totals: { areas: number; customers: number } }
  | { type: "error"; message: string };

export type CreateRoundPayload = {
  dayId: string;
  type: number;
  carryingForDelivery: number;
  date: {
    day: number;
    month: number;
    year: number;
  };
};

type CreateShipmentApiResponse = {
  shipment: any;
  round?: any;
  error?: string;
};

const logger = createLogger("shipments-api");

export async function fetchShipmentsByRange(
  token: string,
  companyId: string,
  fromDate: DateObject,
  toDate: DateObject
): Promise<ShipmentData[]> {
  const { data } = await apiClient.post<ShipmentsRangeResponse>(
    "/api/shipments/range",
    { companyId, fromDate, toDate },
    jsonAxiosConfig(token)
  );
  return Array.isArray(data?.shipments) ? data.shipments : [];
}

export async function fetchDayByWeekday(
  token: string,
  weekday: string
): Promise<Array<{ _id: string }>> {
  const data = await requestJson<unknown[]>(`/api/days/name/${weekday}`, {
    token,
    fallbackMessage: "Failed to fetch work day",
  });
  return Array.isArray(data) ? (data as Array<{ _id: string }>) : [];
}

export async function createRoundOrShipment(opts: {
  token: string;
  payload: CreateRoundPayload;
  prevShipmentId?: string | null;
  prevDayId?: string | null;
}) {
  const { token, payload, prevShipmentId, prevDayId } = opts;
  const out = await requestJson<CreateShipmentApiResponse>("/api/shipments", {
    token,
    method: "POST",
    jsonBody: payload,
    fallbackMessage: "Shipment creation failed",
  });

  if (!out?.shipment?._id) {
    throw new Error(out?.error || "Shipment creation failed");
  }

  const { shipment, round = null } = out;
  const isNewShipment = !(
    prevShipmentId &&
    prevDayId &&
    shipment._id === prevShipmentId &&
    shipment.dayId === prevDayId
  );

  return { shipment, round, isNewShipment };
}

export async function preloadShipmentData({
  dayId,
  token,
  companyId,
  onProgress,
}: {
  dayId: string;
  token: string;
  companyId?: string;
  onProgress?: (p: PreloadProgress) => void;
}) {
  const emit = (p: PreloadProgress) => onProgress?.(p);

  try {
    emit({ type: "start" });

    const data = await requestJson<any>(`/api/shipments/preload/${dayId}`, {
      token,
      fallbackMessage: "Preload failed",
    });

    const dayData = data.day;
    const areasByDay: Area[] = Array.isArray(data.areas) ? data.areas : [];
    const productJson = data.product;
    const rateJson = data.exchangeRate;

    emit({ type: "meta:fetched", dayAreas: areasByDay.length });

    if (rateJson && typeof rateJson.exchangeRateInLBP === "number") {
      emit({
        type: "rate:fetched",
        rateLBP: Number(rateJson.exchangeRateInLBP),
      });
    }

    const cachePromises: Promise<unknown>[] = [];
    if (dayData) {
      cachePromises.push(saveDayToDB(dayId, dayData));
    }
    if (areasByDay.length > 0) {
      const areasWithoutCustomers = areasByDay.map(({ customers, ...area }) => area);
      cachePromises.push(saveAreasByDayToDB(dayId, areasWithoutCustomers));
    }
    if (productJson) {
      cachePromises.push(saveProductTypeToDB(companyId, productJson));
    }
    if (rateJson && typeof rateJson.exchangeRateInLBP === "number") {
      cachePromises.push(
        saveExchangeRateToDB(companyId, {
          exchangeRateInLBP: rateJson.exchangeRateInLBP,
        })
      );
    }

    const totalAreas = areasByDay.length;
    let totalCustomers = 0;

    for (let i = 0; i < areasByDay.length; i += 1) {
      const area = areasByDay[i];
      const index = i + 1;

      emit({
        type: "area:start",
        index,
        total: totalAreas,
        name: area?.name,
      });

      const customers = Array.isArray(area.customers) ? area.customers : [];
      totalCustomers += customers.length;

      emit({
        type: "area:customers",
        index,
        total: totalAreas,
        customers: customers.length,
      });

      if (customers.length > 0) {
        cachePromises.push(saveCustomersToDB(area._id, customers));

        for (const customer of customers) {
          if (!customer?._id) continue;

          const discountData = customer.discount || {
            hasDiscount: customer.hasDiscount || false,
            valueAfterDiscount: customer.valueAfterDiscount,
            discountCurrency: customer.discountCurrency,
            noteAboutCustomer: customer.noteAboutCustomer,
          };

          const invoiceSums = customer.invoiceSums || {};

          cachePromises.push(
            saveCustomerDiscountToDB(customer._id, discountData),
            saveCustomerInvoicesToDB(customer._id, invoiceSums)
          );
        }
      }

      emit({ type: "area:done", index, total: totalAreas });

      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await Promise.allSettled(cachePromises);
    emit({ type: "cache:done" });
    emit({
      type: "done",
      totals: { areas: totalAreas, customers: totalCustomers },
    });
  } catch (error: any) {
    logger.error("Error during shipment preload.", error);
    emit({
      type: "error",
      message: error?.message || "Preload failed",
    });
    throw error;
  }
}

