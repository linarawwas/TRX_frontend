## Technical debt & architectural risks

This document tracks known architectural issues and planned improvements. It is intentionally honest and focused on impact.

### Quick wins

1. **API base configuration is duplicated**
   - **Completed on:** 2026-03-10
   - **What changed:** Centralized all frontend API calls on the normalized `API_BASE` exported from `src/config/api.ts`, removed direct uses of `REACT_APP_API_BASE_URL` in feature APIs.
   - **Notes:** New code should always import `API_BASE` (or a small helper built on it) instead of reading environment variables or hardcoding hostnames.

2. **Router duplication**
   - **Completed on:** 2026-03-10
   - **What changed:** Extracted a `CommonRoutes` component (`src/Router/CommonRoutes.tsx`) that defines all routes shared between admin and employee experiences, and refactored both `AdminRouter` and `EmployeeRouter` to delegate to it. Removed duplicated route definitions inside `EmployeeRouter` so each path is now declared exactly once.
   - **Notes:** New shared routes should be added to `CommonRoutes` and kept role-specific routes inside the respective router components.

3. **IndexedDB docs out of date**
   - **Completed on:** 2026-03-10
   - **What changed:** Rewrote `src/utils/readme.md` to accurately document the current `indexedDB.ts` module, including `DB_VERSION = 15`, all active object stores (requests, customers, areas, invoices, products, discounts, exchange rates, etc.), and the public helper APIs.
   - **Notes:** Any future changes to `src/utils/indexedDB.ts` (new stores or helpers) should be reflected in `src/utils/readme.md` and, if user-visible, cross-referenced from `docs/state-management.md`.

### Medium-term refactors

1. **Auth/session scattered across components**
   - **Completed on:** 2026-03-10
   - **What changed:**
     - Introduced `src/features/auth/` with:
       - `authStorage.ts` to centralize reading/writing auth‑related `localStorage` keys (`token`, `companyId`, `isAdmin`, `username`) and hydrating the `UserInfo` Redux slice (`hydrateAuthFromStorage`, `persistAuthToStorage`, `clearAuth`).
       - `authApi.ts` with `fetchMeAndSync(token, dispatch)` wrapping `/api/users/me`, syncing `companyId`, `isAdmin`, and `username` into both Redux and `localStorage`.
       - `useAuth.ts` providing a `useAuth()` hook that exposes the current auth state plus helpers like `bootstrapFromStorage` and `logout`.
     - Updated `App.tsx` to derive `isAuthenticated` from the token returned by `hydrateAuthFromStorage(dispatch)` instead of manually reading `localStorage` and dispatching user actions inline.
     - Updated `Layout.tsx` to read `token`/`isAdmin` from Redux and call `fetchMeAndSync(token, dispatch)` instead of manually calling `/api/users/me` and mutating `localStorage` in place.
   - **Notes:** Future auth flows (login/logout, token refresh) should build on the `src/features/auth/` helpers and `useAuth` hook rather than dispatching `UserInfo` actions or touching `localStorage` directly.

2. **Redux is classic, not Toolkit**
   - **Completed on:** 2026-03-10
   - **What changed:**
     - All Redux slices (`UserInfo`, `Order`, `Shipment`, `Defaults`) are now implemented using Redux Toolkit `createSlice`, while preserving their existing public action APIs via re‑exports in the respective `action.ts` files.
     - `Shipment` reducer logic was ported into a `shipmentSlice` that keeps all previous behaviors (round info, pending orders, previous shipment snapshot, payments, profits/expenses, date fields) but benefits from immutable updates via Immer and stronger typing.
     - `Defaults` was migrated to a small `defaultsSlice` with typed state and reducers for `default_product` and `default_language`.
   - **Notes:** The store is still wired via `createStore` for now; a future follow‑up can move `store.ts` to `configureStore` to simplify middleware/devtools configuration, but all slices themselves are now Toolkit‑based and easier to evolve.

3. **Forms and validation are not standardized**
   - **Completed on:** 2026-03-10 (first step)
   - **What changed:** Introduced shared Zod schemas and validators in `src/features/finance/validation.ts` for finance forms, and wired them into both the config‑driven UI layer (`AddExpenses`, `AddProfits` via the `validate` prop on `AddToModel`) and the submit hooks (`useAddExpense`, `useAddProfit`). These schemas now provide a single source of truth for validating `name`, `value`, and `paymentCurrency` for expenses and extra profits.
   - **Notes:** Future forms should either (a) reuse these schemas where appropriate, or (b) define their own Zod schemas in a feature‑local `validation.ts` file and pass them through the `validate` prop (or equivalent) to ensure consistent, centralized validation rules and error messages.

### Longer-term architecture improvements

1. **Data fetching and caching abstraction**
   - **Current state:** Mix of custom hooks and direct `axios`/`fetch` calls.
   - **Risk:** Harder to add caching, deduplication, and automatic retries consistently.
   - **Direction:** Introduce RTK Query or a similar library for read‑heavy flows (shipments, customers, areas, finance summaries).

2. **Error boundaries and error surfaces**
   - **Current state:** `ErrorBoundary` component exists but is not wired around major route trees.
   - **Risk:** Uncaught render errors can still crash the entire app.
   - **Direction:** Wrap top‑level routers (or even each feature section) in `ErrorBoundary` components with user‑friendly fallbacks.

3. **Documentation consolidation**
   - **Current state:** Rich docs exist under `docs/` and `src/**/docs`, but there is no single index.
   - **Risk:** Hard for newcomers to discover all documentation.
   - **Direction:** Maintain a short `docs/INDEX.md` (or rely on the Documentation map in the README) and keep it updated when new docs are added.

Each time a refactor lands, update this file to move items from “planned” to “done” or to refine the direction.

