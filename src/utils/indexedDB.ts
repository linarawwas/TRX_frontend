import { openDB } from "idb";

// Database configuration
const DB_NAME = "MyDatabase";
const DB_VERSION = 7;

// Store names
const REQUESTS_STORE = "requests";
const AREAS_STORE_NAME = "areas";
const CUSTOMERS_STORE_NAME = "customers";
const DISCOUNT_STORE_NAME = "customerDiscounts";
const INVOICE_STORE_NAME = "customerInvoices";
const PRODUCTS_STORE_NAME = "products";
const TRANSACTIONS_STORE_NAME = "transactions";
const DAY_STORE_NAME = "dayStore";

// Initialize IndexedDB
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
        db.createObjectStore(AREAS_STORE_NAME, { keyPath: "dayId" });
      }
      if (!db.objectStoreNames.contains(CUSTOMERS_STORE_NAME)) {
        db.createObjectStore(CUSTOMERS_STORE_NAME, { keyPath: "areaId" });
      }
      if (!db.objectStoreNames.contains(DISCOUNT_STORE_NAME)) {
        db.createObjectStore(DISCOUNT_STORE_NAME, { keyPath: "customerId" });
      }
      if (!db.objectStoreNames.contains(INVOICE_STORE_NAME)) {
        db.createObjectStore(INVOICE_STORE_NAME, { keyPath: "customerId" });
      }
      if (!db.objectStoreNames.contains(PRODUCTS_STORE_NAME)) {
        db.createObjectStore(PRODUCTS_STORE_NAME, { keyPath: "companyId" });
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
    },
  });
}

// ==== REQUESTS STORE OPERATIONS ====
export async function saveRequest(request: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(REQUESTS_STORE, "readwrite");
  await tx.store.add(request);
  await tx.done;
}

export async function getPendingRequests() {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.getAll(REQUESTS_STORE);
}
export const removeRequestFromDb = async (requestId) => {
  try {
    console.log("Attempting to delete request with ID:", requestId); // Log the requestId
    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(REQUESTS_STORE, "readwrite");

    // Check if the request exists before deleting
    const request = await tx.store.get(requestId); // Checking if the key exists
    if (!request) {
      console.error(`Request with ID ${requestId} not found.`);
      return;
    }

    // Proceed with deletion from IndexedDB
    await tx.store.delete(requestId);
    await tx.done;
    console.log(`Request with ID ${requestId} deleted successfully.`);
  } catch (error) {
    console.error("Error removing request from IndexedDB:", error);
  }
};

// ==== TRANSACTIONS STORE OPERATIONS ====
export async function saveTransactionToDB(transaction: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(TRANSACTIONS_STORE_NAME, "readwrite");
  await tx.store.put(transaction);
  await tx.done;
}

export async function getTransactionsFromDB() {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.getAll(TRANSACTIONS_STORE_NAME);
}

export async function removeTransactionFromDB(transactionId: number) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(TRANSACTIONS_STORE_NAME, "readwrite");
  await tx.store.delete(transactionId);
  await tx.done;
}

// ==== OTHER STORE OPERATIONS ====
export async function saveCustomerInvoiceToCache(
  customerId: string,
  data: any
) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(INVOICE_STORE_NAME, "readwrite");
  await tx.store.put({ customerId, invoice: data });
  await tx.done;
}

export async function getCustomerInvoiceFromCache(customerId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(INVOICE_STORE_NAME, customerId);
  return result?.invoice || null;
}

export async function saveAreasToDB(dayId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(AREAS_STORE_NAME, "readwrite");
  await tx.store.put({ dayId, areas: data });
  await tx.done;
}

export async function getAreasFromDB(dayId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(AREAS_STORE_NAME, dayId);
  return result?.areas || null;
}

export async function saveCustomersToDB(areaId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
  await tx.store.put({ areaId, customers: data });
  await tx.done;
}

export async function getCustomersFromDB(areaId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(CUSTOMERS_STORE_NAME, areaId);
  return result?.customers || null;
}

export async function saveCustomerDiscountToDB(customerId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(DISCOUNT_STORE_NAME, "readwrite");
  await tx.store.put({ customerId, discount: data });
  await tx.done;
}

export async function getCustomerDiscountFromDB(customerId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(DISCOUNT_STORE_NAME, customerId);
  return result?.discount || null;
}

export async function saveProductTypeToDB(companyId: string, productType: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(PRODUCTS_STORE_NAME, "readwrite");
  await tx.store.put({ companyId, productType });
  await tx.done;
}

export async function getProductTypeFromDB(companyId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(PRODUCTS_STORE_NAME, companyId);
  return result?.productType || null;
}
export async function saveDayToDB(dayId: string, dayData: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(DAY_STORE_NAME, "readwrite");
  await tx.store.put({ dayId, ...dayData });
  await tx.done;
}
export async function getDayFromDB(dayId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(DAY_STORE_NAME, dayId);
  return result || null;
}
