import type { Page } from "@playwright/test";

const DB_NAME = "MyDatabase";
const DB_VERSION = 15;

type RequestRow = {
  id?: number;
  url: string;
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };
  timestamp?: string;
  lastUpdated?: string;
};

type SeedDbInput = {
  requests?: RequestRow[];
  discounts?: Array<{ customerId: string; discount: Record<string, unknown> }>;
  invoices?: Array<{ customerId: string; invoice: Record<string, unknown> }>;
  products?: Array<{ companyId: string; productType: Record<string, unknown> }>;
  days?: Array<{ dayId: string; day: Record<string, unknown> }>;
  areasByDay?: Array<{ dayId: string; areas: Array<Record<string, unknown>> }>;
  exchangeRates?: Array<{
    companyKey: string;
    exchangeRateInLBP: number;
  }>;
};

const storeNames = [
  "requests",
  "customerDiscounts",
  "customerInvoices",
  "products",
  "dayStore",
  "areasByDay",
  "exchangeRate",
] as const;

type StoreName = (typeof storeNames)[number];

export async function seedIndexedDb(page: Page, seed: SeedDbInput) {
  await page.evaluate(
    async ({ dbName, dbVersion, payload, writableStores }) => {
      function ensureStores(db: IDBDatabase) {
        if (!db.objectStoreNames.contains("requests")) {
          const store = db.createObjectStore("requests", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("by_id", "id");
        }
        if (!db.objectStoreNames.contains("customerDiscounts")) {
          const store = db.createObjectStore("customerDiscounts", {
            keyPath: "customerId",
          });
          store.createIndex("by_customer", "customerId");
        }
        if (!db.objectStoreNames.contains("customerInvoices")) {
          db.createObjectStore("customerInvoices", { keyPath: "customerId" });
        }
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "companyId" });
          store.createIndex("by_company", "companyId");
        }
        if (!db.objectStoreNames.contains("dayStore")) {
          db.createObjectStore("dayStore", { keyPath: "dayId" });
        }
        if (!db.objectStoreNames.contains("areasByDay")) {
          db.createObjectStore("areasByDay", { keyPath: "dayId" });
        }
        if (!db.objectStoreNames.contains("exchangeRate")) {
          db.createObjectStore("exchangeRate", { keyPath: "companyKey" });
        }
      }

      function openDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
          const request = window.indexedDB.open(dbName, dbVersion);
          request.onupgradeneeded = () => ensureStores(request.result);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      function waitForTx(tx: IDBTransaction) {
        return new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      }

      const db = await openDb();
      const tx = db.transaction(writableStores, "readwrite");
      for (const storeName of writableStores) {
        tx.objectStore(storeName).clear();
      }

      for (const row of payload.requests ?? []) {
        tx.objectStore("requests").put({
          lastUpdated: row.lastUpdated ?? new Date().toISOString(),
          ...row,
        });
      }
      for (const row of payload.discounts ?? []) {
        tx.objectStore("customerDiscounts").put({
          customerId: row.customerId,
          discount: row.discount,
          lastUpdated: new Date().toISOString(),
        });
      }
      for (const row of payload.invoices ?? []) {
        tx.objectStore("customerInvoices").put({
          customerId: row.customerId,
          lastUpdated: new Date().toISOString(),
          ...row.invoice,
        });
      }
      for (const row of payload.products ?? []) {
        tx.objectStore("products").put({
          companyId: row.companyId,
          productType: row.productType,
          lastUpdated: new Date().toISOString(),
        });
      }
      for (const row of payload.days ?? []) {
        tx.objectStore("dayStore").put({
          dayId: row.dayId,
          ...row.day,
          lastUpdated: new Date().toISOString(),
        });
      }
      for (const row of payload.areasByDay ?? []) {
        tx.objectStore("areasByDay").put({
          dayId: row.dayId,
          areas: row.areas,
          lastUpdated: new Date().toISOString(),
        });
      }
      for (const row of payload.exchangeRates ?? []) {
        tx.objectStore("exchangeRate").put({
          companyKey: row.companyKey,
          exchangeRateInLBP: row.exchangeRateInLBP,
          lastUpdated: new Date().toISOString(),
        });
      }

      await waitForTx(tx);
      db.close();
    },
    {
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      payload: seed,
      writableStores: [...storeNames],
    }
  );
}

export async function readStoreRows<T>(page: Page, storeName: StoreName): Promise<T[]> {
  return page.evaluate(
    async ({ dbName, dbVersion, targetStore }) => {
      function openDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
          const request = window.indexedDB.open(dbName, dbVersion);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      function requestToPromise<R>(request: IDBRequest<R>) {
        return new Promise<R>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      const db = await openDb();
      const tx = db.transaction(targetStore, "readonly");
      const rows = await requestToPromise(tx.objectStore(targetStore).getAll());
      db.close();
      return rows;
    },
    {
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      targetStore: storeName,
    }
  );
}

export async function readPendingRequests(page: Page) {
  return readStoreRows<RequestRow>(page, "requests");
}
