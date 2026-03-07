## State management

This document describes how state is managed across Redux, feature hooks, IndexedDB, and local component state.

### Redux store

Located in `src/redux/`.

- **Slices**
  - `UserInfo` — authentication token, companyId, isAdmin, username.
  - `Order` — current area, customer, product, and price selection.
  - `Shipment` — current shipment and round state (IDs, dates, metrics, customer buckets).
  - `Defaults` — configuration values and defaults.

- **Store configuration (`store.ts`)**
  - Combines reducers via `rootReducer`.
  - Hydrates initial state from `localStorage` (`reduxState` key).
  - Persists the entire Redux state back to `localStorage` on every change.
  - Exposes `RootState` type, used by typed selectors.

- **Selectors**
  - `src/redux/selectors/user.ts` — `selectUserToken`, `selectUserCompanyId`, `selectUserIsAdmin`, etc.
  - `src/redux/selectors/order.ts` — `selectOrderCustomerId`, `selectOrderProductId`, etc.
  - `src/redux/selectors/shipment.ts` — shipment meta and progress selectors.

New global concerns that need to be shared across multiple features should usually be added as a new slice plus selectors.

### Feature hooks

Located under `src/features/**/hooks/`.

Examples:

- Finance:
  - `useFinanceCategories`, `useDailySummary`, `useMonthlySummary`, `useFinanceEntries`.
- Shipments:
  - `useTodayShipmentTotals`.
- Products:
  - `useProducts`, `useAddProduct`.
- Finance actions:
  - `useAddExpense`, `useAddProfit`.

**Responsibilities:**

- Own API calls for their domain using feature‑local `api*.ts`.
- Expose `{ data, loading, error, refetch }` or similar objects.
- Hide transport details from page components.

New data‑heavy views should prefer a feature hook over calling `fetch` or `axios` directly in the component.

### IndexedDB

Located at `src/utils/indexedDB.ts`.

**Stores include (non‑exhaustive):**

- `requests` — queued API requests recorded while offline.
- `customers` — cached customers per area.
- `customerDiscounts` — per‑customer discount data.
- `products` — product configuration per company.
- `customerInvoices` — cached invoice summaries per customer.
- `dayStore` — per‑day metadata.
- `areasByDay`, `companyAreas` — area layouts and assignments.
- `exchangeRate` — cached exchange rate per company.

**Patterns:**

- Pages / hooks use these helpers to:
  - Preload data for offline use (e.g. AreasForDay, CustomersForArea).
  - Read and write invoices, discounts, and product metadata.
  - Store and replay pending order requests.

### Auth and session

Today, session is managed via a mix of:

- `localStorage` keys (`token`, `companyId`, `isAdmin`, `username`).
- `UserInfo` Redux slice, seeded in:
  - `App.tsx` (on startup).
  - `Layout.tsx` (after fetching `/api/users/me`).

Future direction:

- Extract this into a dedicated `src/features/auth/` module with a `useAuth` hook, and move all `localStorage` access and profile fetching there.

### Local component state

Components use `useState` for:

- View‑level controls (tabs, filters, search queries, toggles).
- Transient UI state (open/closed sections, selected dates, modals).

When a piece of state:

- Is truly local to one page or component → **keep it local**.
- Is shared between multiple unrelated areas → consider **Redux**.
- Is domain data that is loaded from the backend and consumed by one or two pages → use **feature hooks**.

### Offline sync and Redux

`src/hooks/useSyncOfflineOrders.ts` is mounted at the app root (`App.tsx`) and coordinates:

- Reading pending requests from IndexedDB.
- Replaying them when the network is available.
- Updating the `Shipment` Redux slice:
  - `addCustomerWithEmptyOrder`, `addCustomerWithFilledOrder`, `removePendingOrder`.

This hook is the main bridge between **persistent offline data** and **in‑memory Redux state** for orders.

### Future improvements

- Migrate slices to **Redux Toolkit** for more concise reducers.
- Consider **RTK Query** or similar for shared data fetching, caching, and invalidation.
- Introduce an `auth` feature and move session logic out of `App` and `Layout`.

