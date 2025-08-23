// preloadShipmentData.ts
import {
  saveCustomersToDB,
  saveCustomerDiscountToDB,
  saveDayToDB,
  saveProductTypeToDB,
  saveCustomerInvoicesToDB,
  saveAreasByDayToDB,
  saveCompanyAreasToDB,
} from "./indexedDB";

type Area = { _id: string; name: string; [k: string]: any };

export type PreloadProgress =
  | { type: "start" }
  | { type: "meta:fetched"; dayAreas: number; companyAreas: number }
  | { type: "cache:done" }
  | { type: "area:start"; index: number; total: number; name?: string }
  | { type: "area:customers"; index: number; total: number; customers: number }
  | { type: "area:done"; index: number; total: number }
  | { type: "done"; totals: { areas: number; customers: number } }
  | { type: "error"; message: string };

export async function preloadShipmentData({
  dayId,
  token,
  companyId,
  onProgress,
  fastStart = false, // if true, preload today's areas first (for quicker UX)
}: {
  dayId: string;
  token: string;
  companyId?: string;
  onProgress?: (p: PreloadProgress) => void;
  fastStart?: boolean;
}) {
  const emit = (p: PreloadProgress) => onProgress?.(p);
  try {
    emit({ type: "start" });
    const auth = { Authorization: `Bearer ${token}` };

    // Core fetches (in parallel)
    const dayRes = fetch(`http://localhost:5000/api/days/${dayId}`, {
      headers: auth,
    });
    const areasByDayRes = fetch(
      `http://localhost:5000/api/areas/day/${dayId}`,
      { headers: auth }
    );
    const companyAreasRes = fetch(`http://localhost:5000/api/areas/company`, {
      headers: auth,
    });

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

    const [dayResp, areasByDayResp, companyAreasResp, productResp] =
      await Promise.all([
        dayRes,
        areasByDayRes,
        companyAreasRes,
        productResPromise,
      ]);

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
    const companyJson = await safeJson(companyAreasResp);
    const productJson = await safeJson(productResp as any);

    const areasByDay: Area[] = normalizeAreas(areasByDayJson);
    const companyAreas: Area[] = normalizeAreas(companyJson);

    emit({
      type: "meta:fetched",
      dayAreas: areasByDay.length,
      companyAreas: companyAreas.length,
    });

    // Cache (only when available)
    const writes: Promise<any>[] = [];
    if (dayData) writes.push(saveDayToDB(dayId, dayData));
    if (areasByDayJson) writes.push(saveAreasByDayToDB(dayId, areasByDay));
    if (companyJson)
      writes.push(saveCompanyAreasToDB(companyId || "tenant", companyAreas));
    if (productJson) writes.push(saveProductTypeToDB(companyId, productJson));
    await Promise.allSettled(writes);
    emit({ type: "cache:done" });

    // Decide which areas to hydrate first
    const firstBatch = fastStart ? areasByDay : companyAreas;
    const secondBatch = fastStart
      ? companyAreas.filter(
          (a) => !new Set(areasByDay.map((x) => x._id)).has(a._id)
        )
      : [];

    let totalAreas = firstBatch.length + secondBatch.length;
    let processedAreas = 0;
    let totalCustomers = 0;

    const MAX_CONCURRENT = 5;
    async function hydrateBatch(batch: Area[]) {
      for (let i = 0; i < batch.length; i += MAX_CONCURRENT) {
        const slice = batch.slice(i, i + MAX_CONCURRENT);
        await Promise.all(
          slice.map(async (area, sliceIdx) => {
            const index = processedAreas + sliceIdx + 1;
            emit({
              type: "area:start",
              index,
              total: totalAreas,
              name: area?.name,
            });

            const customersRes = await fetch(
              `http://localhost:5000/api/customers/area/${area._id}`,
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
              await saveCustomersToDB(area._id, customers);
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
        // Give the UI a chance to paint
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    await hydrateBatch(firstBatch);
    if (secondBatch.length) await hydrateBatch(secondBatch);

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
