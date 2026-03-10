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
   - **Notes:** The store was later moved to `configureStore` with `getDefaultMiddleware().concat(trxApi.middleware)` so thunks and RTK Query work correctly.

3. **Forms and validation are not standardized**
   - **Completed on:** 2026-03-10 (first step)
   - **What changed:** Introduced shared Zod schemas and validators in `src/features/finance/validation.ts` for finance forms, and wired them into both the config‑driven UI layer (`AddExpenses`, `AddProfits` via the `validate` prop on `AddToModel`) and the submit hooks (`useAddExpense`, `useAddProfit`). These schemas now provide a single source of truth for validating `name`, `value`, and `paymentCurrency` for expenses and extra profits.
   - **Notes:** Future forms should either (a) reuse these schemas where appropriate, or (b) define their own Zod schemas in a feature‑local `validation.ts` file and pass them through the `validate` prop (or equivalent) to ensure consistent, centralized validation rules and error messages.

### Longer-term architecture improvements

1. **Data fetching and caching abstraction**
   - **Completed on:** 2026-03-10 (initial RTK Query adoption)
   - **What changed:** Introduced an `RTK Query` API slice in `src/features/api/trxApi.ts` and migrated the “today’s shipments totals” flow (`useTodayShipmentTotals` used by `AdminHomePage`) to use a typed `useListShipmentsRangeQuery` hook backed by a shared cache and automatic request deduplication. The API slice is wired into the Redux store (`trxApi.reducer` and `trxApi.middleware`) so other read‑heavy flows (customers, areas, finance summaries) can be added incrementally.
   - **Notes:** As new data‑heavy features are built, they should prefer RTK Query endpoints/hooks instead of ad‑hoc `fetch`/`axios` calls, so that caching, retries, and status handling stay centralized and consistent.

2. **Error boundaries and error surfaces**
   - **Completed on:** 2026-03-10
   - **What changed:** Wired the existing `ErrorBoundary` component around the authenticated app shell in `App.tsx`: the route that renders `Layout` (and thus `AdminRouter` / `EmployeeRouter` and all nested routes) is now wrapped in `<ErrorBoundary fallback={<AuthAppErrorFallback />}>`. Added `AuthAppErrorFallback` in `src/components/ErrorBoundary.tsx` — a user-friendly, RTL-aware fallback with “تحديث الصفحة” (refresh) and “تسجيل الدخول” (go to login) actions so that uncaught render errors in the main app no longer white-screen the whole UI.
   - **Notes:** The login route is intentionally not wrapped so that auth remains usable if the error is in the authenticated shell. For finer isolation, consider wrapping individual feature sections (e.g. `FinanceDashboard`, shipment views) in their own `ErrorBoundary` components in a later pass.

3. **Documentation consolidation**
   - **Completed on:** 2026-03-10
   - **What changed:** Added [docs/INDEX.md](INDEX.md) as the single entry point for all project documentation. It lists every doc under `docs/` (root, pages, components, css) and feature/page-level docs under `src/**/docs`, with short descriptions and links. The root README’s Documentation map now points to `docs/INDEX.md` for the full index while keeping the curated high-level list.
   - **Notes:** When adding new documentation, add an entry to `docs/INDEX.md` (and to the README Documentation map if it’s a top-level doc) so the index stays discoverable.

Each time a refactor lands, update this file to move items from “planned” to “done” or to refine the direction.


---
## Architecture conventions (ongoing)

Formalized 2026-03. These are standing rules for all new and touched code. All Redux selectors that return objects or arrays have been migrated to `createSelector`; [docs/INDEX.md](INDEX.md) now includes a [How to add documentation](INDEX.md#how-to-add-documentation) section.

1. **RTK Query for data-heavy features**
   - New read-heavy or list/detail API flows must use the shared API slice in `src/features/api/trxApi.ts`: add endpoints and use the generated hooks (e.g. `useXQuery`). Do not add ad-hoc `fetch`/`axios` calls in features for server state.
   - Existing flows that still use `axios` in feature `api*.ts` files can stay as-is until they are refactored; when touching them, prefer migrating to RTK Query.

2. **Memoized selectors**
   - Any Redux selector that returns an object or array must be implemented with `createSelector` from `@reduxjs/toolkit` so that the same reference is returned when inputs are unchanged. This avoids unnecessary rerenders and satisfies Redux's expectations. Primitive-returning selectors do not need memoization.

3. **Documentation index**
   - When adding new documentation (under `docs/` or under `src/**/docs/`), add an entry to [docs/INDEX.md](INDEX.md). For top-level or user-facing docs, also add a link in the README [Documentation map](../README.md#documentation-map) if appropriate.
