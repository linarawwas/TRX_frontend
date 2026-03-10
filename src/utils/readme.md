# IndexedDB Utility Module (`src/utils/indexedDB.ts`)

## Overview

This module wraps a single IndexedDB database named `MyDatabase` and provides:

- A **request queue** used for offline order sync.
- Cached **customers, areas, products, invoices, and exchange rates**.
- Helper functions for **day metadata** and **transactions**.
- Small debug helpers for timing and logging.

The goal is to keep all IndexedDB logic centralized and testable while giving pages and hooks a simple, typed API.

---

## Database Details

- **Database Name:** `MyDatabase`
- **Version:** `15`

### Object stores

- **`requests`**
  - **Key:** `id` (auto-increment)
  - **Use:** Queued HTTP requests recorded while offline.
  - **Indexes:** `by_id`

- **`customers`**
  - **Key:** `_id` (customer id from backend)
  - **Indexes:** `by_area` (by `areaId`)
  - **Use:** Cached customers per area for offline browsing.

- **`customerDiscounts`**
  - **Key:** `customerId`
  - **Use:** Per‑customer discount metadata (stored as `{ customerId, discount, lastUpdated }`).

- **`products`**
  - **Key:** `companyId` (or `"tenant"` fallback)
  - **Use:** Cached product type configuration per company.

- **`transactions`**
  - **Key:** `id` (auto-increment)
  - **Use:** Generic store for arbitrary “transaction” rows (currently used as an append-only log).

- **`dayStore`**
  - **Key:** `dayId`
  - **Use:** Cached metadata about a day (used when preloading shipments/areas).

- **`customerInvoices`**
  - **Key:** `customerId`
  - **Use:** Cached invoice/statement aggregates per customer.

- **`areasByDay`**
  - **Key:** `dayId`
  - **Use:** Cached list of areas for a given `dayId` (used by `AreasForDay`).

- **`companyAreas`**
  - **Key:** `companyKey` (company id or `"tenant"`)
  - **Use:** Cached set of areas for a company; supports a `"tenant"` fallback.

- **`exchangeRate`**
  - **Key:** `companyKey` (company id or `"tenant"`)
  - **Use:** Cached LBP/USD exchange rate per company.

---

## Initialization

The database is initialized via:

```ts
export async function initializeDB(): Promise<void>;
```

This:

- Opens or upgrades the database to `DB_VERSION = 15`.
- Creates any missing object stores and indexes listed above.
- Logs upgrade steps when `IDB_DEBUG` is enabled.

`initializeDB()` should be called once at app start (this is already done in the app bootstrap).

### Debug logging

Logging is controlled by the `IDB_DEBUG` flag:

- Set `?idbdebug=1` in the URL **or**
- Set `localStorage.IDB_DEBUG = "1"`

to enable detailed console logging and timing for all operations.

---

## Core APIs

### 1. Request queue (offline HTTP)

These functions back the offline order sync flow (`useSyncOfflineOrders`):

```ts
export async function saveRequest(request: any): Promise<void>;
export async function getPendingRequests(): Promise<any[]>;
export async function removeRequestFromDb(requestId: number): Promise<void>;
```

- `saveRequest` stores a request descriptor (URL + options) in `requests` with a `lastUpdated` timestamp.
- `getPendingRequests` returns all queued requests.
- `removeRequestFromDb` deletes a queued request after successful sync.

### 2. Transactions

Generic “transaction” log helpers:

```ts
export async function saveTransactionToDB(transaction: any): Promise<void>;
export async function getTransactionsFromDB(): Promise<any[]>;
export async function removeTransactionFromDB(transactionId: number): Promise<void>;
```

These are used as a generic audit/log store and can be extended for troubleshooting or analytics.

### 3. Areas and company areas

Per‑day areas:

```ts
export async function saveAreasByDayToDB(dayId: string, areas: Area[]): Promise<void>;
export async function getAreasByDayFromDB(dayId?: string): Promise<Area[]>;
```

- `saveAreasByDayToDB` overwrites the list of areas for a given `dayId`.
- `getAreasByDayFromDB` returns cached areas for that `dayId` (or `[]` when absent).

Per‑company areas with fallback:

```ts
export async function saveCompanyAreasToDB(companyKey: string, areas: Area[]): Promise<void>;
export async function getCompanyAreasFromDB(companyKey?: string | null): Promise<Area[]>;
```

- `companyKey` is a normalized string (`companyId` or `"tenant"`).
- Reads will fall back to the `"tenant"` key if no company‑specific record is found.

### 4. Customers

```ts
export async function saveCustomersToDB(areaId: string, customers: any[]): Promise<void>;
export async function getCustomersFromDB(areaId: string): Promise<any[]>;
```

- For a given `areaId`:
  - Deletes any existing cached customers.
  - Writes new customers with `areaId` and `lastUpdated`.
- Reads use the `by_area` index when available, falling back to a full scan if needed.

### 5. Customer discounts

```ts
export async function saveCustomerDiscountToDB(customerId: string, discount: any): Promise<void>;
export async function getCustomerDiscountFromDB(customerId: string): Promise<any | null>;
```

- Stores `{ customerId, discount, lastUpdated }` in `customerDiscounts`.
- Returns the discount payload (or `null` when absent).

### 6. Products (per company)

```ts
export async function saveProductTypeToDB(
  companyId: string | undefined,
  product: { id: number; type: string; priceInDollars: number } | any
): Promise<void>;

export async function getProductTypeFromDB(
  companyId: string | undefined
): Promise<any | null>;
```

- Internally normalizes the company key to either a trimmed `companyId` or `"tenant"`.
- Reads will fall back to `"tenant"` when no company‑specific row exists.
- Handles legacy shapes (`row.product`, `row.productType`) for backwards compatibility.

### 7. Days

```ts
export async function saveDayToDB(dayId: string, dayData: any): Promise<void>;
export async function getDayFromDB(dayId: string): Promise<any | undefined>;
```

- Persists per‑day metadata (e.g. shipment info) under `dayId`.

### 8. Customer invoices

```ts
export async function saveCustomerInvoicesToDB(customerId: string, data: any): Promise<void>;
export async function getCustomerInvoicesFromDB(customerId: string): Promise<any | undefined>;
```

- Stores a denormalized invoice/summary object under `customerId` with `lastUpdated`.
- Used by invoice/statement pages to render quickly and support offline reads.

### 9. Exchange rate cache

```ts
export async function saveExchangeRateToDB(
  companyId: string | undefined,
  rate: { exchangeRateInLBP: number }
): Promise<void>;

export async function getExchangeRateFromDB(
  companyId?: string | undefined
): Promise<{ exchangeRateInLBP: number } | null>;
```

- Stores the company’s LBP/USD rate in `exchangeRate` with a normalized `companyKey`.
- Reads fall back to `"tenant"` when no company‑specific entry exists.

### 10. Dev helpers

```ts
export async function clearAllIndexedDb(): Promise<void>;
```

- Clears **all** object stores in `MyDatabase`.
- Intended for development and troubleshooting; use with care.

---

## Usage example (customers & areas)

```ts
import {
  initializeDB,
  saveAreasByDayToDB,
  getAreasByDayFromDB,
  saveCustomersToDB,
  getCustomersFromDB,
} from "./indexedDB";

await initializeDB();

await saveAreasByDayToDB("monday-id", [{ _id: "a1", name: "Downtown" }]);
const areas = await getAreasByDayFromDB("monday-id");

await saveCustomersToDB("a1", [{ _id: "c1", name: "John's Restaurant" }]);
const customers = await getCustomersFromDB("a1");
```

---

## Notes

- All operations are **asynchronous** and may throw errors:
  - Callers should handle failures and provide user feedback when used in UI flows.
- Logging and timing are centralized via the internal `time()` helper and `IDB_DEBUG` flag.
- This module is the **single source of truth** for IndexedDB schema and access in the app.

# IndexedDB Utility Module

## Overview
This module provides utility functions for managing an IndexedDB database named `MyDatabase`. It is designed to store and retrieve data related to areas, customers, customer invoices, discounts, and product types for an inventory management and shipment tracking application.

## Database Details
- **Database Name:** `MyDatabase`
- **Version:** 6
- **Stores:**
  - `areas`: Stores area data with `dayId` as the key.
  - `customers`: Stores customer data with `areaId` as the key.
  - `customerDiscounts`: Stores discount details with `customerId` as the key.
  - `customerInvoices`: Stores invoice details with `customerId` as the key.
  - `products`: Stores product types with `companyId` as the key.

## Initialization
The database is initialized with the function `initializeDB()`, which ensures the necessary object stores are created if they do not already exist.

```typescript
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
```

This function should be called at the start of the application.

## Functions

### 1. Customer Invoices
#### Save Customer Invoice
```typescript
async function saveCustomerInvoiceToCache(customerId: string, data: any)
```
- Stores invoice data for a given customer.

#### Get Customer Invoice
```typescript
async function getCustomerInvoiceFromCache(customerId: string)
```
- Retrieves the invoice for a given customer.

### 2. Areas
#### Save Areas
```typescript
async function saveAreasToDB(dayId: string, data: any)
```
- Saves area data under a given `dayId`.

#### Get Areas
```typescript
async function getAreasFromDB(dayId: string)
```
- Retrieves area data for a specific `dayId`.

### 3. Customers
#### Save Customers
```typescript
async function saveCustomersToDB(areaId: string, data: any)
```
- Stores customers under a given `areaId`.

#### Get Customers
```typescript
async function getCustomersFromDB(areaId: string)
```
- Retrieves customers for a specific `areaId`.

### 4. Customer Discounts
#### Save Customer Discount
```typescript
async function saveCustomerDiscountToDB(customerId: string, data: any)
```
- Saves discount data for a given customer.

#### Get Customer Discount
```typescript
async function getCustomerDiscountFromDB(customerId: string)
```
- Retrieves the discount status of a customer.

### 5. Products
#### Save Product Type
```typescript
async function saveProductTypeToDB(companyId: string, productType: any)
```
- Saves product type data for a given `companyId`.

#### Get Product Type
```typescript
async function getProductTypeFromDB(companyId: string)
```
- Retrieves product type data for a given `companyId`.

## Usage Example
```typescript
await saveCustomerInvoiceToCache("123", { total: 100, items: ["item1", "item2"] });
const invoice = await getCustomerInvoiceFromCache("123");
console.log(invoice);
```

## Notes
- The database is initialized once at the start of the app.
- IndexedDB operations are asynchronous.
- Ensure error handling is implemented when using these functions in production.

## Dependencies
- [`idb`](https://www.npmjs.com/package/idb) (IndexedDB wrapper for modern browsers)

