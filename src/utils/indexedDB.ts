import { openDB } from "idb";

// Database name
const DB_NAME = "MyDatabase";

// Store names
const AREAS_STORE_NAME = "areas";
const CUSTOMERS_STORE_NAME = "customers";

// Save areas to IndexedDB
export async function saveAreasToDB(dayId: string, data: any) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      // Create areas object store if it doesn't exist
      if (!db.objectStoreNames.contains(AREAS_STORE_NAME)) {
        db.createObjectStore(AREAS_STORE_NAME, { keyPath: "dayId" });
      }
    },
  });

  const tx = db.transaction(AREAS_STORE_NAME, "readwrite");
  await tx.store.put({ dayId, data });
  await tx.done;
}

// Get areas from IndexedDB
export async function getAreasFromDB(dayId: string) {
  const db = await openDB(DB_NAME, 2);
  return (await db.get(AREAS_STORE_NAME, dayId))?.data || null;
}

// Save customers to IndexedDB
export async function saveCustomersToDB(areaId: string, data: any) {
  const db = await openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(AREAS_STORE_NAME)) {
        db.createObjectStore(AREAS_STORE_NAME, { keyPath: "dayId" });
      }
      if (!db.objectStoreNames.contains(CUSTOMERS_STORE_NAME)) {
        db.createObjectStore(CUSTOMERS_STORE_NAME, { keyPath: "areaId" });
      }
    },
  });

  // Add customer data to the store
  const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
  await tx.store.put({ areaId, data });
  await tx.done;
}

// Get customers from IndexedDB
export async function getCustomersFromDB(areaId: string) {
  const db = await openDB(DB_NAME, 2);
  return (await db.get(CUSTOMERS_STORE_NAME, areaId))?.data || null;
}
