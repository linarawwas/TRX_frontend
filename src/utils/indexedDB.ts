import { openDB } from "idb";

// DB config
const DB_NAME = "MyDatabase";
const DB_VERSION = 11; // ← bump this to force upgrade

// Store names
const REQUESTS_STORE = "requests";
const AREAS_STORE_NAME = "areas";
const CUSTOMERS_STORE_NAME = "customers";
const DISCOUNT_STORE_NAME = "customerDiscounts";
const PRODUCTS_STORE_NAME = "products";
const TRANSACTIONS_STORE_NAME = "transactions";
const DAY_STORE_NAME = "dayStore";
const CUSTOMER_INVOICES_STORE = "customerInvoices";

// Initialize DB
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
        db.createObjectStore(CUSTOMER_INVOICES_STORE, { keyPath: "customerId" });
      }
      
    },
  });
}

// Utility for timestamps
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
  const index = db.transaction(AREAS_STORE_NAME).store.index("by_day");
  return await index.getAll(dayId);
}

// === CUSTOMERS ===
export async function saveCustomersToDB(areaId: string, customers: any[]) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
  for (const customer of customers) {
    await tx.store.put(withTimestamp({ ...customer, areaId }));
  }
  await tx.done;
}

export async function getCustomersFromDB(areaId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const index = db.transaction(CUSTOMERS_STORE_NAME).store.index("by_area");
  return await index.getAll(areaId);
}

// === CUSTOMER DISCOUNTS ===
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

// === PRODUCT TYPES ===
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

// === CLEAR ALL STORES (DEV ONLY) ===
export async function clearAllIndexedDb() {
  const db = await openDB(DB_NAME, DB_VERSION);
  for (const store of db.objectStoreNames) {
    const tx = db.transaction(store, "readwrite");
    await tx.store.clear();
    await tx.done;
  }
  console.log("✅ All IndexedDB stores cleared.");
}
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
