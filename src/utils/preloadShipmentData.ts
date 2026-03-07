// preloadShipmentData.ts
import {
  saveCustomersToDB,
  saveCustomerDiscountToDB,
  saveDayToDB,
  saveProductTypeToDB,
  saveCustomerInvoicesToDB,
  saveAreasByDayToDB,
  saveExchangeRateToDB, // NEW
} from "./indexedDB";
import { API_BASE } from "../config/api";

type Area = { _id: string; name: string; [k: string]: any };

export type PreloadProgress =
  | { type: "start" }
  | { type: "meta:fetched"; dayAreas: number }
  | { type: "cache:done" }
  | { type: "rate:fetched"; rateLBP: number } // ⬅️ add this
  | { type: "area:start"; index: number; total: number; name?: string }
  | { type: "area:customers"; index: number; total: number; customers: number }
  | { type: "area:done"; index: number; total: number }
  | { type: "done"; totals: { areas: number; customers: number } }
  | { type: "error"; message: string };

export async function preloadShipmentData({
  dayId,
  token,
  companyId, // optional, only for product fallback
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
    const auth = { Authorization: `Bearer ${token}` };

    // Single optimized endpoint that fetches everything
    const response = await fetch(
      `${API_BASE}/api/shipments/preload/${dayId}`,
      { headers: auth }
    );

    // Product “Bottles” (tenant-inferred; legacy fallback by companyId)
    const productResPromise = (async () => {
      const r1 = await fetch(
        `http://localhost:5000/api/products/type?name=Bottles`,
        { headers: auth }
      );
      if (r1.ok) return r1;
      if (companyId) {
        return fetch(
          `http://localhost:5000/api/products/productType/company/${companyId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", ...auth },
            body: JSON.stringify({ type: "Bottles" }),
          }
        );
      }
      return undefined;
    })();
    const exchangeRateRes = fetch(`http://localhost:5000/api/exchange-rate`, {
      headers: auth,
    });

    const [dayResp, areasByDayResp, productResp, exchangeRateResp] =
      await Promise.all([
        dayRes,
        areasByDayRes,
        productResPromise,
        exchangeRateRes,
      ]);
    // Helpers
    const safeJson = async (resp: Response | undefined) => {
      if (!resp || !resp.ok) return null;
      try {
        return await resp.json();
      } catch {
        return null;
      }
    };
    const normalizeAreas = (j: any): Area[] =>
      Array.isArray(j) ? j : Array.isArray(j?.areas) ? j.areas : [];

    const dayData = await safeJson(dayResp);
    const areasByDayJson = await safeJson(areasByDayResp);
    const productJson = await safeJson(productResp as any);
    const rateJson = await safeJson(exchangeRateResp); // { companyId, exchangeRateInLBP }

    const areasByDay: Area[] = normalizeAreas(areasByDayJson);

    emit({ type: "meta:fetched", dayAreas: areasByDay.length });

    // --- Cache only today's context ---
    const writes: Promise<any>[] = [];
    if (dayData) writes.push(saveDayToDB(dayId, dayData));
    if (areasByDayJson) writes.push(saveAreasByDayToDB(dayId, areasByDay));
    if (productJson) writes.push(saveProductTypeToDB(companyId, productJson));
    if (rateJson && typeof rateJson.exchangeRateInLBP === "number") {
      const rateLBP = Number(rateJson.exchangeRateInLBP);
      emit({ type: "rate:fetched", rateLBP }); // ⬅️ emit
      await saveExchangeRateToDB(companyId, { exchangeRateInLBP: rateLBP });
    }
    await Promise.allSettled(writes);
    emit({ type: "cache:done" });

    // --- Hydrate ONLY today's areas (ACTIVE customers, already sorted by API) ---
    const totalAreas = areasByDay.length;
    let processedAreas = 0;
    let totalCustomers = 0;

    const MAX_CONCURRENT = 5;
    for (let i = 0; i < areasByDay.length; i += MAX_CONCURRENT) {
      const slice = areasByDay.slice(i, i + MAX_CONCURRENT);

      await Promise.all(
        slice.map(async (area, sliceIdx) => {
          const index = processedAreas + sliceIdx + 1;
          emit({
            type: "area:start",
            index,
            total: totalAreas,
            name: area?.name,
          });

          // Use your new endpoint
          const customersRes = await fetch(
            `http://localhost:5000/api/customers/area/${area._id}/active`,
            { headers: auth }
          );
          const customers = (await safeJson(customersRes)) || [];

          emit({
            type: "area:customers",
            index,
            total: totalAreas,
            customers: Array.isArray(customers) ? customers.length : 0,
          });

          if (Array.isArray(customers)) {
            totalCustomers += customers.length;

            // Cache list
            await saveCustomersToDB(area._id, customers);

            // Cache per-customer details
            await Promise.all(
              customers.map(async (customer: any) => {
                if (!customer?._id) return;
                const [discountRes, invoiceRes] = await Promise.all([
                  fetch(
                    `http://localhost:5000/api/customers/discount/${customer._id}`,
                    { headers: auth }
                  ),
                  fetch(
                    `http://localhost:5000/api/customers/reciept/${customer._id}`,
                    { headers: auth }
                  ),
                ]);
                const discountData = (await safeJson(discountRes)) || {};
                const invoiceData = (await safeJson(invoiceRes)) || {};
                await Promise.all([
                  saveCustomerDiscountToDB(customer._id, discountData),
                  saveCustomerInvoicesToDB(
                    customer._id,
                    invoiceData?.sums ?? {}
                  ),
                ]);
              })
            );
          }

          emit({ type: "area:done", index, total: totalAreas });
        })
      );

      processedAreas += slice.length;
      // Yield to the UI
      await new Promise((r) => setTimeout(r, 0));
    }

    emit({
      type: "done",
      totals: { areas: totalAreas, customers: totalCustomers },
    });
  } catch (error: any) {
    console.error("❌ Error during shipment data preload:", error);
    onProgress?.({
      type: "error",
      message: error?.message || "Preload failed",
    });
    throw error;
  }
}