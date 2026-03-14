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

## Versioning and migrations

`src/utils/indexedDB.ts` is the single source of truth for schema shape and upgrade behavior.

### When to bump `DB_VERSION`

Increase `DB_VERSION` whenever a change affects IndexedDB structure or stored row compatibility, including:

- adding a new object store
- adding or changing an index
- changing a key path
- changing persisted row shape in a way older records cannot satisfy safely
- removing or renaming stores/fields that existing readers still expect

### Preferred migration style

For non-trivial upgrades, prefer stepwise guards inside `upgrade(db, oldVersion)`:

```ts
if (oldVersion < 16) {
  // create store, add index, or transform data for version 16
}
```

This is safer than relying only on `if (!db.objectStoreNames.contains(...))` once schema history becomes more complex.

### Migration policy

- **Additive change**: create the missing store/index and keep old rows readable where possible.
- **Shape extension**: prefer tolerant readers and default values so older cached rows still work.
- **Breaking shape/key change**: either transform existing rows during upgrade or explicitly clear/rebuild the affected store.
- **Store removal/rename**: treat as breaking; document the reset strategy and update all callers in the same change.

### Clearing vs transforming data

- **Transform existing rows** when the data is still valuable offline and conversion is straightforward.
- **Clear and rebuild a store** when cached data is derivable from the backend and transformation would be fragile.
- **Use `clearAllIndexedDb()` only for development or emergency troubleshooting**, not as the default migration strategy.

### Version history summary

| Version | Summary |
|---------|---------|
| `15` | Current schema with queued requests, customers, discounts, products, transactions, days, invoices, areas-by-day, company areas, and exchange-rate caching. |

If future schema versions are introduced, extend this table instead of creating a second source of truth elsewhere.

### Maintainer checklist

When changing IndexedDB schema or row shape:

1. Update `DB_VERSION` and `upgrade()` in `src/utils/indexedDB.ts`.
2. Update this document to describe the new schema/migration behavior.
3. Keep `tests/e2e/support/idb.ts` aligned with the current stores and `DB_VERSION`.
4. Re-run the offline-related test coverage:
   - `npm run test:e2e`
   - `npm test -- --watch=false`
   - `npx tsc --noEmit`
5. If the change is user-visible or architectural, cross-reference it from `docs/state-management.md` and roadmap docs.

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

