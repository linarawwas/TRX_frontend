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
  - Uses Redux Toolkit `configureStore` with `rootReducer`, plus `getDefaultMiddleware().concat(trxApi.middleware)` so thunks and RTK Query work.
  - Hydrates initial state from `localStorage` (`reduxState` key).
  - Persists the entire Redux state back to `localStorage` on every change.
  - Exposes `RootState` type, used by typed selectors.

- **Selectors**
  - `src/redux/selectors/user.ts` — `selectUserToken`, `selectUserCompanyId`, `selectUserIsAdmin`, etc.; `selectUser` is memoized with `createSelector`.
  - `src/redux/selectors/order.ts` — `selectOrderCustomerId`, `selectOrderProductId`, etc.; `selectOrder` is memoized.
  - `src/redux/selectors/shipment.ts` — Shipment meta, today/round progress, and customer-list selectors; all selectors that return objects or arrays use `createSelector` to avoid unnecessary rerenders. See [technical-debt.md § Architecture conventions](technical-debt.md#architecture-conventions-ongoing).

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

New domain API calls should live in feature `api*.ts` files, and new read-heavy/shared server-state flows should prefer RTK Query endpoints in `src/features/api/trxApi.ts` instead of new API modules under `src/utils/`.

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

Auth/session is centered around:

- `localStorage` keys (`token`, `companyId`, `isAdmin`, `username`).
- `UserInfo` Redux slice (`src/redux/UserInfo/*`) which is effectively the `AuthState` for the app.
- A small auth feature module in `src/features/auth/`:
  - `authStorage.ts` — `loadAuthFromStorage`, `hydrateAuthFromStorage`, `persistAuthToStorage`, `clearAuth`.
  - `authApi.ts` — `fetchMeAndSync(token, dispatch)` wraps `/api/users/me`, persists the result to both Redux and `localStorage`.
  - `useAuth.ts` — `useAuth()` hook exposing `{ token, companyId, isAdmin, username, isAuthenticated, bootstrapFromStorage, logout }`.

Usage:

- `App.tsx`
  - Calls `hydrateAuthFromStorage(dispatch)` on each render to keep the Redux user slice aligned with auth‑related `localStorage`.
  - Derives `isAuthenticated` from the (possibly hydrated) `token` and gates routing.
- `Layout.tsx`
  - Reads `token` and `isAdmin` from Redux.
  - On mount (and when `token` changes), calls `fetchMeAndSync(token, dispatch)` to load `/api/users/me` and synchronize `companyId`, `isAdmin`, and `username` to both Redux and `localStorage`.

New auth‑related code should prefer the helpers in `src/features/auth/` (or the `useAuth` hook) instead of reading/writing `localStorage` directly.

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

### RTK Query

- `src/features/api/trxApi.ts` defines the RTK Query API slice (`listShipmentsRange`, `shipmentsOrdersByDate`, and related).
- Hooks and pages such as `useTodayShipmentTotals` and `OrdersOfToday` use generated RTK Query hooks. New read-heavy flows should add endpoints to `trxApi` and use those hooks instead of introducing new `utils/api*.ts` modules.

### Future improvements

- Slices are already on **Redux Toolkit** (`createSlice`); store uses `configureStore`.
- **RTK Query** is in use for shipment range data; extend it for other shared server state.
- **Auth** is centralized in `src/features/auth/`. Optional: further isolate session logic from `App`/`Layout` or add token refresh.

