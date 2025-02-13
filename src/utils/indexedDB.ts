import { openDB } from 'idb';

const DB_NAME = 'OfflineDB'; // Use a single database
const AREA_STORE = 'areas';
const CUSTOMER_STORE = 'customers';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(AREA_STORE)) {
        db.createObjectStore(AREA_STORE, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(CUSTOMER_STORE)) {
        db.createObjectStore(CUSTOMER_STORE, { keyPath: '_id' });
      }
    },
  });
}

// Generic function to save data
async function saveData(storeName: string, data: any[]) {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  data.forEach((item) => store.put(item));
  await tx.done;
}

// Generic function to get data
async function getData(storeName: string) {
  const db = await initDB();
  return db.getAll(storeName);
}

// ---- Areas Functions ----
export const saveAreas = (areas: any[]) => saveData(AREA_STORE, areas);
export const getAreas = () => getData(AREA_STORE);

// ---- Customers Functions ----
export const saveCustomers = (customers: any[]) => saveData(CUSTOMER_STORE, customers);
export const getCustomers = () => getData(CUSTOMER_STORE);
