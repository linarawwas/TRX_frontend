import { openDB } from "idb";

// DB config
const DB_NAME = "MyDatabase";
const DB_VERSION = 14;

// Store names
const REQUESTS_STORE = "requests";
const CUSTOMERS_STORE_NAME = "customers";
const DISCOUNT_STORE_NAME = "customerDiscounts";
const PRODUCTS_STORE_NAME = "products";
const TRANSACTIONS_STORE_NAME = "transactions";
const DAY_STORE_NAME = "dayStore";
const CUSTOMER_INVOICES_STORE = "customerInvoices"; // ✅ was missing
const AREAS_BY_DAY_STORE_NAME = "areasByDay";
const COMPANY_AREAS_STORE_NAME = "companyAreas";
// Initialization
export async function initializeDB() {
  await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(REQUESTS_STORE)) {
        const store = db.createObjectStore(REQUESTS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("by_id", "id");
      }

      if (!db.objectStoreNames.contains(CUSTOMERS_STORE_NAME)) {
        const store = db.createObjectStore(CUSTOMERS_STORE_NAME, {
          keyPath: "_id",
        });
        store.createIndex("by_area", "areaId");
      }

      if (!db.objectStoreNames.contains(DISCOUNT_STORE_NAME)) {
        const store = db.createObjectStore(DISCOUNT_STORE_NAME, {
          keyPath: "customerId",
        });
        store.createIndex("by_customer", "customerId");
      }

      if (!db.objectStoreNames.contains(PRODUCTS_STORE_NAME)) {
        const store = db.createObjectStore(PRODUCTS_STORE_NAME, {
          keyPath: "companyId",
        });
        store.createIndex("by_company", "companyId");
      }

      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE_NAME)) {
        db.createObjectStore(TRANSACTIONS_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(DAY_STORE_NAME)) {
        db.createObjectStore(DAY_STORE_NAME, { keyPath: "dayId" });
      }

      if (!db.objectStoreNames.contains(CUSTOMER_INVOICES_STORE)) {
        db.createObjectStore(CUSTOMER_INVOICES_STORE, {
          keyPath: "customerId",
        });
      }
      if (!db.objectStoreNames.contains(AREAS_BY_DAY_STORE_NAME)) {
        db.createObjectStore(AREAS_BY_DAY_STORE_NAME, { keyPath: "dayId" });
      }

      if (!db.objectStoreNames.contains(COMPANY_AREAS_STORE_NAME)) {
        db.createObjectStore(COMPANY_AREAS_STORE_NAME, {
          keyPath: "companyKey",
        });
      }
    },
  });
}

// Utility
const withTimestamp = (data: any) => ({
  ...data,
  lastUpdated: new Date().toISOString(),
});

// === REQUESTS ===
export async function saveRequest(request: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.put(REQUESTS_STORE, withTimestamp(request));
}

export async function getPendingRequests() {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.getAll(REQUESTS_STORE);
}

export async function removeRequestFromDb(requestId: number) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.delete(REQUESTS_STORE, requestId);
}

// === TRANSACTIONS ===
export async function saveTransactionToDB(transaction: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.put(TRANSACTIONS_STORE_NAME, withTimestamp(transaction));
}

export async function getTransactionsFromDB() {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.getAll(TRANSACTIONS_STORE_NAME);
}

export async function removeTransactionFromDB(transactionId: number) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.delete(TRANSACTIONS_STORE_NAME, transactionId);
}

// ✅ Minimal Area type
type Area = { _id: string; name: string; [k: string]: any };

// ✅ Transaction helper (now properly typed/imported)
async function withTx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBPObjectStore<any, any, any, any>) => Promise<T> | T
): Promise<T> {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(storeName, mode);
  const res = await fn(tx.store);
  await tx.done;
  return res;
}

// === AREAS (fixed) ===
export async function saveAreasByDayToDB(
  dayId: string,
  areas: Area[]
): Promise<void> {
  if (!dayId) return; // ✅ guard
  return withTx(AREAS_BY_DAY_STORE_NAME, "readwrite", (store) =>
    store.put({ dayId, areas, lastUpdated: new Date().toISOString() })
  );
}

export async function getAreasByDayFromDB(dayId?: string): Promise<Area[]> {
  if (!dayId) return []; // ✅ guard
  return withTx(AREAS_BY_DAY_STORE_NAME, "readonly", async (store) => {
    const row = await store.get(dayId);
    return Array.isArray(row?.areas) ? row.areas : [];
  });
}

export async function saveCompanyAreasToDB(
  companyKey: string,
  areas: Area[]
): Promise<void> {
  const key = (companyKey ?? "").trim();
  if (!key) return; // ✅ guard
  return withTx(COMPANY_AREAS_STORE_NAME, "readwrite", (store) =>
    store.put({ companyKey: key, areas, lastUpdated: new Date().toISOString() })
  );
}

export async function getCompanyAreasFromDB(
  companyKey?: string | null
): Promise<Area[]> {
  const db = await openDB(DB_NAME, DB_VERSION);
  const key = (companyKey ?? "").toString().trim();
  let row = key ? await db.get(COMPANY_AREAS_STORE_NAME, key) : undefined;
  if (!row && key !== "tenant") {
    row = await db.get(COMPANY_AREAS_STORE_NAME, "tenant"); // fallback
  }
  return Array.isArray(row?.areas) ? row.areas : [];
}

export async function saveCustomersToDB(areaId: string, customers: any[]) {
  const db = await openDB(DB_NAME, DB_VERSION);

  // 🛑 Get existing IDs BEFORE opening the write transaction
  const existing = await getCustomersFromDB(areaId);
  const existingIds = new Set(existing.map((c) => c._id));

  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
  const store = tx.store;

  try {
    console.log(
      `🧹 Deleting ${existing.length} old customers for area ${areaId}`
    );
    for (const c of existing) {
      store.delete(c._id); // ❗ no await here
    }

    console.log(
      `💾 Saving ${customers.length} new customers to area ${areaId}`
    );
    for (const customer of customers) {
      store.put({
        ...customer,
        areaId,
        lastUpdated: new Date().toISOString(),
      }); // ❗ no await here
    }

    await tx.done;
    console.log(`✅ Customers for area ${areaId} saved to IndexedDB`);
  } catch (err) {
    console.error("❌ Failed to save customers to IndexedDB:", err);
  }
}

export async function getCustomersFromDB(areaId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readonly");
  const store = tx.store;

  try {
    if (store.indexNames.contains("by_area")) {
      return await store.index("by_area").getAll(areaId);
    } else {
      console.warn(
        "⚠️ Index 'by_area' not found. Falling back to manual filter."
      );
      const all = await store.getAll();
      return all.filter((c: any) => c.areaId === areaId);
    }
  } catch (err) {
    console.error("❌ Failed to load customers:", err);
    return [];
  }
}

// === DISCOUNTS ===
export async function saveCustomerDiscountToDB(
  customerId: string,
  discount: any
) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.put(DISCOUNT_STORE_NAME, withTimestamp({ customerId, discount }));
}

export async function getCustomerDiscountFromDB(customerId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(DISCOUNT_STORE_NAME, customerId);
  return result?.discount || null;
}
// indexedDB.ts
// --- KEY NORMALIZER (must be in the same module) ---
const PRODUCT_KEY_FALLBACK = "tenant";
function companyKey(companyId?: string | null) {
  const v = (companyId ?? "").toString().trim();
  return v.length ? v : PRODUCT_KEY_FALLBACK;
}

export async function saveProductTypeToDB(
  companyId: string | undefined,
  product: { id: number; type: string; priceInDollars: number } | any
) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const key = companyKey(companyId);

  // Match the existing store schema (keyPath: "companyId")
  await db.put(PRODUCTS_STORE_NAME, {
    companyId: key,
    productType: product, // keep "productType" to match your existing row
    lastUpdated: new Date().toISOString(), // keep existing field naming
  });
}

export async function getProductTypeFromDB(
  companyId: string | undefined
): Promise<any | null> {
  const db = await openDB(DB_NAME, DB_VERSION);
  const key = companyKey(companyId);

  // With keyPath: "companyId", the key is that value
  let row = await db.get(PRODUCTS_STORE_NAME, key);

  // Back-compat: try tenant fallback if not found
  if (!row && key !== "tenant") {
    row = await db.get(PRODUCTS_STORE_NAME, "tenant");
  }

  if (!row) return null;

  // Normalize older/newer shapes
  if (row.productType) return row.productType; // current shape
  if (row.product) return row.product; // if you ever wrote it under "product"
  return row;
}

// === DAYS ===
export async function saveDayToDB(dayId: string, dayData: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.put(DAY_STORE_NAME, withTimestamp({ dayId, ...dayData }));
}

export async function getDayFromDB(dayId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.get(DAY_STORE_NAME, dayId);
}

// === INVOICES ===
export async function saveCustomerInvoicesToDB(customerId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(CUSTOMER_INVOICES_STORE, "readwrite");
  await tx.store.put({
    customerId,
    ...data,
    lastUpdated: new Date().toISOString(),
  });
  await tx.done;
}

export async function getCustomerInvoicesFromDB(customerId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.get(CUSTOMER_INVOICES_STORE, customerId);
}

// === DEV: CLEAR ALL ===
export async function clearAllIndexedDb() {
  const db = await openDB(DB_NAME, DB_VERSION);
  for (const store of db.objectStoreNames) {
    const tx = db.transaction(store, "readwrite");
    await tx.store.clear();
    await tx.done;
  }
  console.log("✅ All IndexedDB stores cleared.");
}
