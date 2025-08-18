// preloadShipmentData.ts
import {
  saveAreasToDB,
  saveCustomersToDB,
  saveCustomerDiscountToDB,
  saveDayToDB,
  saveProductTypeToDB,
  saveCustomerInvoicesToDB,
} from "./indexedDB";

/**
 * Preload all data needed for today's shipment.
 * - Prefers tenant-inferred endpoints (no companyId)
 * - Falls back to legacy companyId endpoints when necessary
 */
export async function preloadShipmentData({
  dayId,
  token,
  companyId, // optional: only used for legacy fallback
}: {
  dayId: string;
  token: string;
  companyId?: string;
}) {
  try {
    // === Step 1: Core fetches in parallel ===
    // Day (GET)
    const dayRes = fetch(`http://localhost:5000/api/days/${dayId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Areas — try day-scoped GET first; fallback to company route if needed
    const areasResPromise = (async () => {
      // Preferred (adjust to your actual route name):
      const r1 = await fetch(`http://localhost:5000/api/areas/day/${dayId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r1.ok) return r1;

      // Fallback to legacy company route if available:
      if (companyId) {
        const r2 = await fetch(
          `http://localhost:5000/api/areas/company/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return r2;
      }

      // Last resort: generic areas (server should scope by auth)
      return fetch(`http://localhost:5000/api/areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    })();

    // Product “Bottles” — prefer company-less GET; fallback to legacy company route if needed
    const productResPromise = (async () => {
      // Preferred: server infers tenant
      // const r1 = await fetch(
      //   `http://localhost:5000/api/products/type?name=Bottles`,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // if (r1.ok) return r1;

      // // Fallback legacy (only if companyId is provided)
      if (companyId) {
        const r2 = await fetch(
          `http://localhost:5000/api/products/productType/company/${companyId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: "Bottles" }),
          }
        );
        return r2;
      }

      // Last resort: fetch all products and filter client-side
      return fetch(`http://localhost:5000/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    })();

    const [dayResp, areasResp, productResp] = await Promise.all([
      dayRes,
      areasResPromise,
      productResPromise,
    ]);

    // Parse JSON safely
    const dayData = await dayResp.json().catch(() => null);
    const areasJson = await areasResp.json().catch(() => null);
    const productJson = await productResp.json().catch(() => null);

    // Normalize arrays
    const areas: any[] = Array.isArray(areasJson)
      ? areasJson
      : Array.isArray(areasJson?.areas)
      ? areasJson.areas
      : [];

    // Normalize product to a single item (if your API returns array)
    let productData = productJson;
    if (Array.isArray(productJson)) {
      // Try to pick Bottles product if multiple
      productData =
        productJson.find((p: any) => p?.type === "Bottles") || productJson[0];
    }

    // Cache day/areas/product (companyId may be undefined; your IndexedDB key just needs to be consistent)
    await Promise.all([
      saveDayToDB(dayId, dayData),
      saveAreasToDB(dayId, areas),
      saveProductTypeToDB(companyId, productData),
    ]);

    // === Step 2: For each area, fetch customers and cache their (discount + invoice) ===
    for (const area of areas) {
      if (!area?._id) continue;

      const customersRes = await fetch(
        `http://localhost:5000/api/customers/area/${area._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const customers = (await customersRes.json().catch(() => [])) as any[];

      if (!Array.isArray(customers)) {
        console.warn(`❌ customers for area ${area._id} is not an array`, customers);
        continue;
      }

      await saveCustomersToDB(area._id, customers);

      // Per-customer tasks
      const tasks = customers.map(async (customer: any) => {
        if (!customer?._id) return;

        const [discountRes, invoiceRes] = await Promise.all([
          fetch(`http://localhost:5000/api/customers/discount/${customer._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/customers/reciept/${customer._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const discountData = await discountRes.json().catch(() => ({}));
        const invoiceData = await invoiceRes.json().catch(() => ({}));

        await Promise.all([
          saveCustomerDiscountToDB(customer._id, discountData),
          saveCustomerInvoicesToDB(customer._id, invoiceData?.sums ?? {}),
        ]);
      });

      await Promise.all(tasks);
    }

    console.log("✅ Shipment data preloaded successfully");
  } catch (error) {
    console.error("❌ Error during shipment data preload:", error);
  }
}
