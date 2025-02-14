import { openDB } from "idb";

// Database name
const DB_NAME = "MyDatabase";
const DB_VERSION = 6; // Make sure the version is consistent

// Store names
const AREAS_STORE_NAME = "areas";
const CUSTOMERS_STORE_NAME = "customers";
const DISCOUNT_STORE_NAME = "customerDiscounts";
const INVOICE_STORE_NAME = "customerInvoices";
const PRODUCTS_STORE_NAME = "products";

// Initialize the IndexedDB database
async function initializeDB() {
  await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
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
    },
  });
}

// Call this function at the start of your app
initializeDB();

// Save customer invoice to IndexedDB
export async function saveCustomerInvoiceToCache(customerId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(INVOICE_STORE_NAME, "readwrite");
  await tx.store.put({ customerId, invoice: data });
  await tx.done;
}

// Get customer invoice from IndexedDB
export async function getCustomerInvoiceFromCache(customerId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(INVOICE_STORE_NAME, customerId);
  return result?.invoice || null;
}

// Save areas to IndexedDB
export async function saveAreasToDB(dayId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(AREAS_STORE_NAME, "readwrite");
  await tx.store.put({ dayId, areas: data });
  await tx.done;
}

// Get areas from IndexedDB
export async function getAreasFromDB(dayId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(AREAS_STORE_NAME, dayId);
  return result?.areas || null;
}

// Save customers to IndexedDB
export async function saveCustomersToDB(areaId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
  await tx.store.put({ areaId, customers: data });
  await tx.done;
}

// Get customers from IndexedDB
export async function getCustomersFromDB(areaId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(CUSTOMERS_STORE_NAME, areaId);
  return result?.customers || null;
}

// Save customer discount status to IndexedDB
export async function saveCustomerDiscountToDB(customerId: string, data: any) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(DISCOUNT_STORE_NAME, "readwrite");
  await tx.store.put({ customerId, discount: data });
  await tx.done;
}

// Get customer discount status from IndexedDB
export async function getCustomerDiscountFromDB(customerId: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const result = await db.get(DISCOUNT_STORE_NAME, customerId);
  return result?.discount || null;
}
// Save product type to IndexedDB
export async function saveProductTypeToDB(companyId: string, productType: any) {
    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(PRODUCTS_STORE_NAME, "readwrite");
    await tx.store.put({ companyId, productType });
    await tx.done;
  }
  
  // Get product type from IndexedDB
  export async function getProductTypeFromDB(companyId: string) {
    const db = await openDB(DB_NAME, DB_VERSION);
    const result = await db.get(PRODUCTS_STORE_NAME, companyId);
    return result?.productType || null;
  }