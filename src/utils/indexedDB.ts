import { openDB } from "idb";

// DB config
const DB_NAME = "MyDatabase";
const DB_VERSION = 12;

// Store names
const REQUESTS_STORE = "requests";
const AREAS_STORE_NAME = "areas";
const CUSTOMERS_STORE_NAME = "customers";
const DISCOUNT_STORE_NAME = "customerDiscounts";
const PRODUCTS_STORE_NAME = "products";
const TRANSACTIONS_STORE_NAME = "transactions";
const DAY_STORE_NAME = "dayStore";
const CUSTOMER_INVOICES_STORE = "customerInvoices";

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

      if (!db.objectStoreNames.contains(AREAS_STORE_NAME)) {
        const store = db.createObjectStore(AREAS_STORE_NAME, {
          keyPath: "_id",
        });
        store.createIndex("by_day", "dayId");
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

// === AREAS ===
export async function saveAreasToDB(dayId: string, areas: any[]) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(AREAS_STORE_NAME, "readwrite");
  for (const area of areas) {
    await tx.store.put(withTimestamp({ ...area, dayId }));
  }
  await tx.done;
}

export async function getAreasFromDB(dayId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(AREAS_STORE_NAME, "readonly");
  const store = tx.store;

  try {
    if (store.indexNames.contains("by_day")) {
      return await store.index("by_day").getAll(dayId);
    } else {
      console.warn(
        "⚠️ Index 'by_day' not found. Falling back to manual filter."
      );
      const all = await store.getAll();
      return all.filter((area: any) => area.dayId === dayId);
    }
  } catch (err) {
    console.error("❌ Failed to load areas:", err);
    return [];
  }
}

export async function saveCustomersToDB(areaId: string, customers: any[]) {
  const db = await openDB(DB_NAME, DB_VERSION);

  // 🛑 Get existing IDs BEFORE opening the write transaction
  const existing = await getCustomersFromDB(areaId);
  const existingIds = new Set(existing.map((c) => c._id));

  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
  const store = tx.store;

  try {
    console.log(`🧹 Deleting ${existing.length} old customers for area ${areaId}`);
    for (const c of existing) {
      store.delete(c._id); // ❗ no await here
    }

    console.log(`💾 Saving ${customers.length} new customers to area ${areaId}`);
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

// === PRODUCTS ===
export async function saveProductTypeToDB(companyId: string, productType: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.put(PRODUCTS_STORE_NAME, withTimestamp({ companyId, productType }));
}

export async function getProductTypeFromDB(companyId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(PRODUCTS_STORE_NAME, companyId);
  return result?.productType || null;
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
