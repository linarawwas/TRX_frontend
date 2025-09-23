// indexedDB.ts
import { openDB } from "idb";
import type { IDBPObjectStore } from "idb";

// ============================
// Logging helpers (toggleable)
// ============================
const IDB_DEBUG =
  // flip to `true` to always enable
  false ||
  /idbdebug=1|true/i.test(String(window?.location?.search)) ||
  localStorage.getItem("IDB_DEBUG") === "1";

const nowStr = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

const ok = (msg: string, ...args: any[]) => IDB_DEBUG;
// && console.log(`✅ [IDB ${nowStr()}] ${msg}`, ...args);
const info = (msg: string, ...args: any[]) => IDB_DEBUG;
// && console.log(`ℹ️  [IDB ${nowStr()}] ${msg}`, ...args);
const warn = (msg: string, ...args: any[]) =>
  console.warn(`⚠️  [IDB ${nowStr()}] ${msg}`, ...args);
const err = (msg: string, ...args: any[]) =>
  console.error(`❌ [IDB ${nowStr()}] ${msg}`, ...args);

async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = performance.now();
  try {
    const out = await fn();
    const dt = Math.round(performance.now() - t0);
    ok(`${label} (${dt}ms)`);
    return out;
  } catch (e) {
    const dt = Math.round(performance.now() - t0);
    err(`${label} failed after ${dt}ms`, e);
    throw e;
  }
}

// ============================
// DB config
// ============================
const DB_NAME = "MyDatabase";
const DB_VERSION = 15;

// Store names
const REQUESTS_STORE = "requests";
const CUSTOMERS_STORE_NAME = "customers";
const DISCOUNT_STORE_NAME = "customerDiscounts";
const PRODUCTS_STORE_NAME = "products";
const TRANSACTIONS_STORE_NAME = "transactions";
const DAY_STORE_NAME = "dayStore";
const CUSTOMER_INVOICES_STORE = "customerInvoices";
const AREAS_BY_DAY_STORE_NAME = "areasByDay";
const COMPANY_AREAS_STORE_NAME = "companyAreas";
const EXCHANGE_RATE_STORE = "exchangeRate"; // NEW

// ============================
// Initialization
// ============================
export async function initializeDB() {
  await time(`Open/upgrade DB v${DB_VERSION}`, async () =>
    openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        info(`Upgrading DB from v${oldVersion} → v${newVersion}`);

        if (!db.objectStoreNames.contains(REQUESTS_STORE)) {
          const store = db.createObjectStore(REQUESTS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("by_id", "id");
          ok(`Created store "${REQUESTS_STORE}" with index "by_id"`);
        }
        if (!db.objectStoreNames.contains(EXCHANGE_RATE_STORE)) {
          db.createObjectStore(EXCHANGE_RATE_STORE, { keyPath: "companyKey" });
        }
        if (!db.objectStoreNames.contains(CUSTOMERS_STORE_NAME)) {
          const store = db.createObjectStore(CUSTOMERS_STORE_NAME, {
            keyPath: "_id",
          });
          store.createIndex("by_area", "areaId");
          ok(`Created store "${CUSTOMERS_STORE_NAME}" with index "by_area"`);
        }

        if (!db.objectStoreNames.contains(DISCOUNT_STORE_NAME)) {
          const store = db.createObjectStore(DISCOUNT_STORE_NAME, {
            keyPath: "customerId",
          });
          store.createIndex("by_customer", "customerId");
          ok(`Created store "${DISCOUNT_STORE_NAME}" with index "by_customer"`);
        }

        if (!db.objectStoreNames.contains(PRODUCTS_STORE_NAME)) {
          const store = db.createObjectStore(PRODUCTS_STORE_NAME, {
            keyPath: "companyId",
          });
          store.createIndex("by_company", "companyId");
          ok(`Created store "${PRODUCTS_STORE_NAME}" with index "by_company"`);
        }

        if (!db.objectStoreNames.contains(TRANSACTIONS_STORE_NAME)) {
          db.createObjectStore(TRANSACTIONS_STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          ok(`Created store "${TRANSACTIONS_STORE_NAME}"`);
        }

        if (!db.objectStoreNames.contains(DAY_STORE_NAME)) {
          db.createObjectStore(DAY_STORE_NAME, { keyPath: "dayId" });
          ok(`Created store "${DAY_STORE_NAME}"`);
        }

        if (!db.objectStoreNames.contains(CUSTOMER_INVOICES_STORE)) {
          db.createObjectStore(CUSTOMER_INVOICES_STORE, {
            keyPath: "customerId",
          });
          ok(`Created store "${CUSTOMER_INVOICES_STORE}"`);
        }

        if (!db.objectStoreNames.contains(AREAS_BY_DAY_STORE_NAME)) {
          db.createObjectStore(AREAS_BY_DAY_STORE_NAME, { keyPath: "dayId" });
          ok(`Created store "${AREAS_BY_DAY_STORE_NAME}"`);
        }

        if (!db.objectStoreNames.contains(COMPANY_AREAS_STORE_NAME)) {
          db.createObjectStore(COMPANY_AREAS_STORE_NAME, {
            keyPath: "companyKey",
          });
          ok(`Created store "${COMPANY_AREAS_STORE_NAME}"`);
        }
      },
    })
  );
}

// ============================
// Utility
// ============================
const withTimestamp = (data: any) => ({
  ...data,
  lastUpdated: new Date().toISOString(),
});

// Minimal Area type
type Area = { _id: string; name: string; [k: string]: any };

// Generic single-store tx helper
async function withTx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBPObjectStore<any, any, any, any>) => Promise<T> | T
): Promise<T> {
  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction(storeName, mode);
  const out = await fn(tx.store);
  await tx.done;
  return out;
}

// ============================
// REQUESTS
// ============================
export async function saveRequest(request: any) {
  await time(`Save request`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put(REQUESTS_STORE, withTimestamp(request));
  });
  ok(`Request saved (id may be auto-assigned)`);
}

export async function getPendingRequests() {
  return time(`Load pending requests`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const all = await db.getAll(REQUESTS_STORE);
    info(`Loaded ${all.length} pending requests`);
    return all;
  });
}

export async function removeRequestFromDb(requestId: number) {
  await time(`Delete request ${requestId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.delete(REQUESTS_STORE, requestId);
  });
  ok(`Request ${requestId} deleted`);
}

// ============================
// TRANSACTIONS
// ============================
export async function saveTransactionToDB(transaction: any) {
  await time(`Save transaction`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put(TRANSACTIONS_STORE_NAME, withTimestamp(transaction));
  });
  ok(`Transaction saved`);
}

export async function getTransactionsFromDB() {
  return time(`Load transactions`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const rows = await db.getAll(TRANSACTIONS_STORE_NAME);
    info(`Loaded ${rows.length} transactions`);
    return rows;
  });
}

export async function removeTransactionFromDB(transactionId: number) {
  await time(`Delete transaction ${transactionId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.delete(TRANSACTIONS_STORE_NAME, transactionId);
  });
  ok(`Transaction ${transactionId} deleted`);
}

// ============================
// AREAS
// ============================
export async function saveAreasByDayToDB(
  dayId: string,
  areas: Area[]
): Promise<void> {
  if (!dayId) {
    warn(`saveAreasByDayToDB skipped: empty dayId`);
    return;
  }
  await time(`Save areas by dayId=${dayId} (count=${areas.length})`, async () =>
    withTx(AREAS_BY_DAY_STORE_NAME, "readwrite", (store) =>
      store.put({ dayId, areas, lastUpdated: new Date().toISOString() })
    )
  );
  ok(`Areas by day saved (dayId=${dayId}, count=${areas.length})`);
}

export async function getAreasByDayFromDB(dayId?: string): Promise<Area[]> {
  if (!dayId) {
    warn(`getAreasByDayFromDB skipped: empty dayId`);
    return [];
  }
  return time(`Load areas by dayId=${dayId}`, async () =>
    withTx(AREAS_BY_DAY_STORE_NAME, "readonly", async (store) => {
      const row = await store.get(dayId);
      const count = Array.isArray(row?.areas) ? row.areas.length : 0;
      info(`Found ${count} areas for dayId=${dayId}`);
      return count ? row.areas : [];
    })
  );
}

export async function saveCompanyAreasToDB(
  companyKey: string,
  areas: Area[]
): Promise<void> {
  const key = (companyKey ?? "").trim();
  if (!key) {
    warn(`saveCompanyAreasToDB skipped: empty companyKey`);
    return;
  }
  await time(
    `Save company areas key=${key} (count=${areas.length})`,
    async () =>
      withTx(COMPANY_AREAS_STORE_NAME, "readwrite", (store) =>
        store.put({
          companyKey: key,
          areas,
          lastUpdated: new Date().toISOString(),
        })
      )
  );
  ok(`Company areas saved (key=${key}, count=${areas.length})`);
}

export async function getCompanyAreasFromDB(
  companyKey?: string | null
): Promise<Area[]> {
  const key = (companyKey ?? "").toString().trim();
  return time(
    `Load company areas key=${key || "∅"} (with tenant fallback)`,
    async () => {
      const db = await openDB(DB_NAME, DB_VERSION);
      let row = key ? await db.get(COMPANY_AREAS_STORE_NAME, key) : undefined;
      if (!row && key !== "tenant") {
        info(`No areas under key=${key}; trying 'tenant' fallback`);
        row = await db.get(COMPANY_AREAS_STORE_NAME, "tenant");
      }
      const count = Array.isArray(row?.areas) ? row.areas.length : 0;
      info(
        `Resolved company areas: count=${count} (key=${
          row ? row.companyKey : "none"
        })`
      );
      return count ? row.areas : [];
    }
  );
}

// ============================
// CUSTOMERS
// ============================
export async function saveCustomersToDB(areaId: string, customers: any[]) {
  await time(
    `Save customers for area=${areaId} (count=${customers.length})`,
    async () => {
      const db = await openDB(DB_NAME, DB_VERSION);

      const existing = await getCustomersFromDB(areaId);
      const tx = db.transaction(CUSTOMERS_STORE_NAME, "readwrite");
      const store = tx.store;

      info(`Deleting ${existing.length} old customers for area ${areaId}`);
      for (const c of existing) {
        store.delete(c._id);
      }

      info(`Writing ${customers.length} new customers for area ${areaId}`);
      for (const customer of customers) {
        store.put({
          ...customer,
          areaId,
          lastUpdated: new Date().toISOString(),
        });
      }

      await tx.done;
    }
  );
  ok(`Customers for area ${areaId} saved to IndexedDB`);
}

export async function getCustomersFromDB(areaId: string) {
  return time(`Load customers for area=${areaId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(CUSTOMERS_STORE_NAME, "readonly");
    const store = tx.store;

    try {
      let rows: any[] = [];
      if (store.indexNames.contains("by_area")) {
        rows = await store.index("by_area").getAll(areaId);
      } else {
        warn(`Index 'by_area' not found. Falling back to manual filter.`);
        rows = await store.getAll();
        rows = rows.filter((c: any) => c.areaId === areaId);
      }
      info(`Loaded ${rows.length} customers for area=${areaId}`);
      return rows;
    } catch (e) {
      err(`Failed to load customers for area=${areaId}`, e);
      return [];
    }
  });
}

// ============================
// DISCOUNTS
// ============================
export async function saveCustomerDiscountToDB(
  customerId: string,
  discount: any
) {
  await time(`Save discount for customer=${customerId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put(DISCOUNT_STORE_NAME, withTimestamp({ customerId, discount }));
  });
  ok(`Discount saved (customer=${customerId})`);
}

export async function getCustomerDiscountFromDB(customerId: string) {
  return time(`Load discount for customer=${customerId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const row = await db.get(DISCOUNT_STORE_NAME, customerId);
    info(
      row
        ? `Discount found for customer=${customerId}`
        : `No discount for customer=${customerId}`
    );
    return row?.discount || null;
  });
}

// ============================
// PRODUCTS (product type row per company)
// ============================
const PRODUCT_KEY_FALLBACK = "tenant";
function companyKey(companyId?: string | null) {
  const v = (companyId ?? "").toString().trim();
  return v.length ? v : PRODUCT_KEY_FALLBACK;
}

export async function saveProductTypeToDB(
  companyId: string | undefined,
  product: { id: number; type: string; priceInDollars: number } | any
) {
  const key = companyKey(companyId);
  await time(`Save productType for company=${key}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put(PRODUCTS_STORE_NAME, {
      companyId: key,
      productType: product,
      lastUpdated: new Date().toISOString(),
    });
  });
  ok(`ProductType saved (company=${key})`);
}

export async function getProductTypeFromDB(
  companyId: string | undefined
): Promise<any | null> {
  const key = companyKey(companyId);
  return time(
    `Load productType for company=${key} (with tenant fallback)`,
    async () => {
      const db = await openDB(DB_NAME, DB_VERSION);
      let row = await db.get(PRODUCTS_STORE_NAME, key);
      if (!row && key !== "tenant") {
        info(`No productType under company=${key}; trying 'tenant' fallback`);
        row = await db.get(PRODUCTS_STORE_NAME, "tenant");
      }
      info(
        row
          ? `ProductType found (company=${row.companyId})`
          : `No productType found`
      );
      if (!row) return null;
      if (row.productType) return row.productType;
      if (row.product) return row.product;
      return row;
    }
  );
}

// ============================
// DAYS
// ============================
export async function saveDayToDB(dayId: string, dayData: any) {
  await time(`Save day record dayId=${dayId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put(DAY_STORE_NAME, withTimestamp({ dayId, ...dayData }));
  });
  ok(`Day saved (dayId=${dayId})`);
}

export async function getDayFromDB(dayId: string) {
  return time(`Load day record dayId=${dayId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const row = await db.get(DAY_STORE_NAME, dayId);
    info(row ? `Day found (dayId=${dayId})` : `No day for dayId=${dayId}`);
    return row;
  });
}

// ============================
// INVOICES
// ============================
export async function saveCustomerInvoicesToDB(customerId: string, data: any) {
  await time(`Save invoices for customer=${customerId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(CUSTOMER_INVOICES_STORE, "readwrite");
    await tx.store.put({
      customerId,
      ...data,
      lastUpdated: new Date().toISOString(),
    });
    await tx.done;
  });
  ok(`Invoices saved (customer=${customerId})`);
}

export async function getCustomerInvoicesFromDB(customerId: string) {
  return time(`Load invoices for customer=${customerId}`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const row = await db.get(CUSTOMER_INVOICES_STORE, customerId);
    info(
      row
        ? `Invoices found (customer=${customerId})`
        : `No invoices (customer=${customerId})`
    );
    return row;
  });
}

// Helpers
export async function saveExchangeRateToDB(
  companyId: string | undefined,
  rate: { exchangeRateInLBP: number }
) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const key = companyKey(companyId); // you already have companyKey()
  await db.put(EXCHANGE_RATE_STORE, {
    companyKey: key,
    ...rate,
    lastUpdated: new Date().toISOString(),
  });
}

export async function getExchangeRateFromDB(
  companyId?: string | undefined
): Promise<{ exchangeRateInLBP: number } | null> {
  const db = await openDB(DB_NAME, DB_VERSION);
  const key = companyKey(companyId);
  let row = await db.get(EXCHANGE_RATE_STORE, key);
  if (!row && key !== "tenant")
    row = await db.get(EXCHANGE_RATE_STORE, "tenant");
  return row ? { exchangeRateInLBP: Number(row.exchangeRateInLBP || 0) } : null;
}
// ============================
// DEV: CLEAR ALL
// ============================
export async function clearAllIndexedDb() {
  await time(`Clear ALL stores`, async () => {
    const db = await openDB(DB_NAME, DB_VERSION);
    for (const store of db.objectStoreNames) {
      const tx = db.transaction(store, "readwrite");
      await tx.store.clear();
      await tx.done;
      info(`Cleared store "${store}"`);
    }
  });
  ok(`All stores cleared`);
}
