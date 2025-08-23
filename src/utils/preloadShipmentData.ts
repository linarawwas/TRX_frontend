// preloadShipmentData.ts
import {
  // remove saveAreasToDB,
  saveCustomersToDB,
  saveCustomerDiscountToDB,
  saveDayToDB,
  saveProductTypeToDB,
  saveCustomerInvoicesToDB,
  saveAreasByDayToDB,
  saveCompanyAreasToDB,
} from "./indexedDB";

type Area = { _id: string; name: string; [k: string]: any };

export async function preloadShipmentData({
  dayId,
  token,
  companyId,
}: {
  dayId: string;
  token: string;
  companyId?: string;
}) {
  try {
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

    // Helpers
    const safeJson = async (resp: Response | undefined) => {
      if (!resp) return null;
      if (!resp.ok) return null;
      try {
        return await resp.json();
      } catch {
        return null;
      }
    };
    const normalizeAreas = (j: any): Area[] =>
      Array.isArray(j) ? j : Array.isArray(j?.areas) ? j.areas : [];

    // Parse
    const dayData = await safeJson(dayResp);
    const areasByDayJson = await safeJson(areasByDayResp);
    const companyJson = await safeJson(companyAreasResp);
    const productJson = await safeJson(productResp as any);

    const areasByDay: Area[] = normalizeAreas(areasByDayJson);
    const companyAreas: Area[] = normalizeAreas(companyJson);

    // Cache (skip overwriting with [] on failed fetches)
    const writes: Promise<any>[] = [];
    if (dayData) writes.push(saveDayToDB(dayId, dayData));
    if (areasByDayJson) writes.push(saveAreasByDayToDB(dayId, areasByDay));
    if (companyJson)
      writes.push(saveCompanyAreasToDB(companyId || "tenant", companyAreas));
    if (productJson) writes.push(saveProductTypeToDB(companyId, productJson));

    const results = await Promise.allSettled(writes);
    for (const r of results)
      if (r.status === "rejected")
        console.warn("⚠️ Preload cache step failed:", r.reason);

    // === Hydrate customers for TODAY’S areas only ===
    for (const area of companyAreas) {
      // ✅ was `areas`
      if (!area?._id) continue;

      const customersRes = await fetch(
        `http://localhost:5000/api/customers/area/${area._id}`,
        { headers: auth }
      );
      const customers = (await safeJson(customersRes)) || [];
      if (!Array.isArray(customers)) {
        console.warn(
          `❌ customers for area ${area._id} is not an array`,
          customers
        );
        continue;
      }

      await saveCustomersToDB(area._id, customers);

      // Per-customer details
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
            saveCustomerInvoicesToDB(customer._id, invoiceData?.sums ?? {}),
          ]);
        })
      );
    }

    console.log(
      `✅ Preload done — day areas: ${areasByDay.length}, company areas: ${companyAreas.length}`
    );
  } catch (error) {
    console.error("❌ Error during shipment data preload:", error);
  }
}
