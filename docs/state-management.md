## State management

This document describes how state is managed across Redux, feature hooks, IndexedDB, and local component state.

### Redux store

Located in `src/redux/`.

- **Slices**
  - `UserInfo` — authentication token, companyId, isAdmin, username.
  - `Order` — current area, customer, product, and price selection.
  - `Shipment` — current shipment and round state. The persisted shape remains flat for compatibility, but it is now treated as four internal regions:
    - live shipment meta/date (`_id`, `dayId`, `year/month/day`, `exchangeRateLBP`, `target`)
    - live totals (`delivered`, `returned`, currency-specific payments, profits, expenses)
    - customer progress buckets (`CustomersWithFilledOrders`, `CustomersWithEmptyOrders`, `CustomersWithPendingOrders`)
    - round baseline state (`round`) used to derive “this round only” deltas
  - `Defaults` — configuration values and defaults.

- **Store configuration (`store.ts`)**
  - Uses Redux Toolkit `configureStore` with `rootReducer`, plus `getDefaultMiddleware().concat(trxApi.middleware)` so thunks and RTK Query work.
  - Hydrates initial state from `localStorage` (`reduxState` key).
  - Persists the entire Redux state back to `localStorage` on every change.
  - Exposes `RootState` type, used by typed selectors.

- **Selectors**
  - `src/redux/selectors/user.ts` — `selectUserToken`, `selectUserCompanyId`, `selectUserIsAdmin`, etc.; `selectUser` is memoized with `createSelector`.
  - `src/redux/selectors/order.ts` — `selectOrderCustomerId`, `selectOrderProductId`, etc.; `selectOrder` is memoized.
  - `src/redux/selectors/shipment.ts` — Shipment boundary selectors for meta, date, exchange rate, live totals, round progress, and customer buckets. Prefer these selectors over direct `state.shipment.*` reads, especially in business-critical flows. All selectors that return objects or arrays use `createSelector` to avoid unnecessary rerenders. See [technical-debt.md § Architecture conventions](technical-debt.md#architecture-conventions-ongoing).

New global concerns that need to be shared across multiple features should usually be added as a new slice plus selectors.

### Data access policy

Server communication is now split across two explicit boundaries:

- **RTK Query** in `src/features/api/trxApi.ts` for shared, read-heavy, cacheable server state.
- **Feature API modules** in `src/features/**/api*.ts` for imperative mutations and feature-owned requests that are not yet in RTK Query.

Rules:

- Components, pages, and controller hooks should not perform business-domain HTTP directly.
- Non-RTK requests should go through `src/features/api/http.ts` so `API_BASE`, auth headers, JSON parsing, and axios config reuse stay consistent.
- `src/utils/` is for infrastructure and pure helpers, not domain API ownership.

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

New domain API calls should live in feature `api*.ts` files, and new read-heavy/shared server-state flows should prefer RTK Query endpoints in `src/features/api/trxApi.ts` instead of new API modules under `src/utils/`. For the full policy, see `docs/frontend-architecture.md`.

### IndexedDB

Located at `src/utils/indexedDB.ts`.

Schema, versioning, and migration rules are documented in `src/utils/readme.md`. If you change `DB_VERSION`, stores, indexes, or persisted row shape, update that file first and keep the E2E IndexedDB helper in `tests/e2e/support/idb.ts` in sync.

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

### Shipment slice boundaries

`Shipment` is still one Redux slice, but Phase 3.2 clarified how maintainers should think about it:

1. **Live shipment meta/date**
   - Identity and date fields used when starting a shipment or recording orders.
2. **Live totals**
   - Day-level delivery, return, payment, profit, and expense totals.
3. **Customer buckets**
   - Progress lists for filled, empty, and pending customer orders.
4. **Round baseline**
   - `round` stores the baseline totals needed for `selectRoundProgress` to derive round-only deltas.

Preferred access pattern:

- Read shipment state through `src/redux/selectors/shipment.ts`.
- Keep write behavior behind the existing `src/redux/Shipment/action.ts` compatibility exports.
- Avoid introducing new direct `state.shipment.*` reads in components when a selector boundary already exists.

### RTK Query

- `src/features/api/trxApi.ts` defines the RTK Query API slice (`listShipmentsRange`, `shipmentsOrdersByDate`, and related).
- Hooks and pages such as `useTodayShipmentTotals` and `OrdersOfToday` use generated RTK Query hooks. New read-heavy flows should add endpoints to `trxApi` and use those hooks instead of introducing direct UI `fetch`/`axios` calls or new `utils/api*.ts` modules.

### Shared non-RTK transport

- `src/features/api/http.ts` is the shared helper layer for non-RTK requests.
- It centralizes API URL resolution (`src/config/api.ts`), auth header injection, JSON parsing, normalized request errors, and axios config reuse.
- Existing feature API modules may still use either `fetch` helpers or `axios`, but they should use this shared boundary rather than duplicating auth/base handling inline.

### Future improvements

- Slices are already on **Redux Toolkit** (`createSlice`); store uses `configureStore`.
- **RTK Query** is in use for shipment range data; extend it for other shared server state.
- **Auth** is centralized in `src/features/auth/`. Optional: further isolate session logic from `App`/`Layout` or add token refresh.

