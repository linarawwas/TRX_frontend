// preloadShipmentData.ts
import {
  saveCustomersToDB,
  saveCustomerDiscountToDB,
  saveDayToDB,
  saveProductTypeToDB,
  saveCustomerInvoicesToDB,
  saveAreasByDayToDB,
  saveExchangeRateToDB,
} from "./indexedDB";

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

/**
 * Goal: preload all shipment data for offline use in a single optimized request.
 * Steps: fetch all data from single endpoint, cache to IndexedDB, maintain progress events.
 * Notes: replaces hundreds of individual requests with one database-optimized query.
 */
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
      `http://localhost:5000/api/shipments/preload/${dayId}`,
      { headers: auth }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Preload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Extract data from response
    const dayData = data.day;
    const areasByDay: Area[] = Array.isArray(data.areas) ? data.areas : [];
    const productJson = data.product;
    const rateJson = data.exchangeRate;

    emit({ type: "meta:fetched", dayAreas: areasByDay.length });

    // Emit exchange rate if available
    if (rateJson && typeof rateJson.exchangeRateInLBP === "number") {
      const rateLBP = Number(rateJson.exchangeRateInLBP);
      emit({ type: "rate:fetched", rateLBP });
    }

    // Cache core metadata
    const cachePromises: Promise<any>[] = [];
    if (dayData) {
      cachePromises.push(saveDayToDB(dayId, dayData));
    }
    if (areasByDay.length > 0) {
      // Save areas without customers for the areasByDay store
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

    // Cache customers, discounts, and invoices for each area
    const totalAreas = areasByDay.length;
    let totalCustomers = 0;

    // Process areas with progress updates for UI compatibility
    for (let i = 0; i < areasByDay.length; i++) {
      const area = areasByDay[i];
      const index = i + 1;

      emit({
        type: "area:start",
        index,
        total: totalAreas,
        name: area?.name,
      });

      const customers = Array.isArray(area.customers) ? area.customers : [];
      const customerCount = customers.length;
      totalCustomers += customerCount;

      emit({
        type: "area:customers",
        index,
        total: totalAreas,
        customers: customerCount,
      });

      if (customerCount > 0) {
        // Cache customers list for this area
        cachePromises.push(saveCustomersToDB(area._id, customers));

        // Cache discount and invoice data for each customer
        for (const customer of customers) {
          if (!customer?._id) continue;

          // Extract discount data (already included in customer object from backend)
          const discountData = customer.discount || {
            hasDiscount: customer.hasDiscount || false,
            valueAfterDiscount: customer.valueAfterDiscount,
            discountCurrency: customer.discountCurrency,
            noteAboutCustomer: customer.noteAboutCustomer,
          };

          // Extract invoice sums (already calculated in backend)
          // Backend returns invoiceSums with the same structure as customerOverallReceipt
          const invoiceSums = customer.invoiceSums || {};

          cachePromises.push(
            saveCustomerDiscountToDB(customer._id, discountData),
            saveCustomerInvoicesToDB(customer._id, invoiceSums)
          );
        }
      }

      emit({ type: "area:done", index, total: totalAreas });

      // Yield to UI periodically
      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // Wait for all cache operations to complete
    await Promise.allSettled(cachePromises);
    emit({ type: "cache:done" });

    emit({
      type: "done",
      totals: { areas: totalAreas, customers: totalCustomers },
    });
  } catch (error: any) {
    console.error("❌ Error during shipment data preload:", error);
    emit({
      type: "error",
      message: error?.message || "Preload failed",
    });
    throw error;
  }
}
