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

4. **Oversized smart components**
   - **Completed on:** 2026-03-14
   - **What changed:** Extracted controller hooks from two of the largest UI containers, then completed the next render-decomposition pass:
     - `src/features/orders/hooks/useRecordOrderController.ts` now owns the Redux access, invoice preview logic, submission flow, offline queueing, and WhatsApp message generation that previously lived inline in `RecordOrder.tsx`.
     - `src/features/customers/hooks/useUpdateCustomerController.ts` now owns customer fetching, area/placement loading, update/deactivate/restore/delete mutations, and modal state that previously lived inline in `UpdateCustomer.tsx`.
     - `RecordOrder.tsx` now acts as a page composer and delegates repeated render blocks to `RecordOrderStepField.tsx`, `RecordOrderLbpSection.tsx`, and `RecordOrderOverTargetModal.tsx`.
     - `UpdateCustomer.tsx` now acts as a page composer and delegates the hero/actions, edit form, invoices tab, and modal trees to `UpdateCustomerHeader.tsx`, `UpdateCustomerForm.tsx`, `UpdateCustomerInvoicesPanel.tsx`, and `UpdateCustomerModals.tsx`.
     - Added page-level wiring tests for both composition files:
       - `src/components/Orders/RecordOrder/RecordOrder.test.tsx`
       - `src/components/Customers/UpdateCustomer/UpdateCustomer.test.tsx`
  - **Notes:** The highest-risk UI containers now have clear controller-vs-view boundaries. The next best follow-up is shipment-slice boundary hardening/testing and selective integration coverage across multi-screen flows.

5. **Phase 1 safety net and store typing**
   - **Completed on:** 2026-03-13
   - **What changed:**
     - Added the first focused automated safety net:
       - `src/redux/selectors/selectors.test.ts`
       - `src/features/shipments/hooks/useTodayShipmentTotals.test.ts`
       - `src/features/finance/hooks/useAddExpense.test.ts`
       - `src/features/finance/hooks/useAddProfit.test.ts`
       - `src/redux/Shipment/reducer.test.ts`
       - `src/hooks/useSyncOfflineOrders.test.tsx`
       - `src/features/auth/authApi.test.ts`
       - `src/features/auth/authStorage.test.ts`
       - `src/features/auth/useAuth.test.ts`
       - `src/components/Orders/RecordOrder/useRecordOrderController.test.ts`
       - `src/components/Customers/UpdateCustomer/useUpdateCustomerController.test.ts`
       - `docs/testing.md`
     - Removed Redux typing shortcuts in `src/redux/Shipment/reducer.ts` by replacing `(state as any)` and `PayloadAction<any>` with typed state and payload handling.
     - Kept `RootState` centralized in `src/redux/store.ts` and removed the need for local redefinitions in touched code.
     - Resolved the store middleware suppression by aligning `redux` with the Toolkit stack (`redux@^5.0.1`) and deleting the `@ts-expect-error` from `store.ts`.
   - **Notes:** This is now a solid high-value regression net for the main business flows, not full coverage. The next best targets are a few remaining edge branches (`RecordOrder` over-target/LBP-pad interactions, `UpdateCustomer` non-happy-path mutation branches, offline sync dedupe under repeated online events) plus a small number of end-to-end integration paths across auth -> shipment -> order recording.

6. **Phase 2 clear boundaries**
   - **Completed on:** 2026-03-13
   - **What changed:**
     - Moved finance server-state ownership out of `src/utils/apiFinances.ts` and into `src/features/finance/apiFinance.ts`, then updated finance hooks and `FinanceDashboard` to import only from the feature API module.
     - Migrated the `orders-today` read flow from `src/utils/apiToday.ts` into the shared RTK Query slice in `src/features/api/trxApi.ts`, and updated `OrdersOfToday.tsx` to use the generated lazy query hook.
     - Added `src/utils/logger.ts` and replaced the highest-noise raw console usage in `src/hooks/useSyncOfflineOrders.ts`, `src/components/EmployeeComponents/StartShipment/StartShipment.tsx`, `src/app/main.tsx`, and the IndexedDB logging helpers in `src/utils/indexedDB.ts`.
     - Deleted the now-obsolete `src/utils/apiFinances.ts` and `src/utils/apiToday.ts` modules.
   - **Notes:** The rule is now explicit in code: new domain API calls belong in feature `api*.ts` files or in `src/features/api/trxApi.ts`; `src/utils/` should be reserved for pure helpers and infrastructure. Remaining cleanup can migrate other `utils` API modules incrementally.

7. **Phase 3.2 shipment boundaries**
   - **Completed on:** 2026-03-14
   - **What changed:**
     - Clarified the internal regions of `src/redux/Shipment/reducer.ts` and `src/redux/Shipment/types.ts` without changing the external persisted store shape: live shipment meta, live totals, previous snapshot fields, customer buckets, a legacy compatibility payment field, and round baseline state.
     - Expanded `src/redux/selectors/shipment.ts` with boundary-level selectors for shipment date, exchange rate, live totals, customer buckets, and previous snapshot data.
     - Migrated the highest-impact consumers away from raw `state.shipment.*` reads toward those selectors:
       - `src/components/EmployeeComponents/StartShipment/StartShipment.tsx`
       - `src/features/orders/hooks/useRecordOrderController.ts`
       - `src/features/finance/hooks/useAddExpense.ts`
       - `src/features/finance/hooks/useAddProfit.ts`
     - Strengthened `src/redux/Shipment/reducer.test.ts` and `src/redux/selectors/selectors.test.ts` around shipment boundary regions, snapshot restore behavior, and falsy-value edge cases.
   - **Notes:** This is the safe precursor to any later sub-slice split. The next step, if still needed, is to reduce remaining cross-module coupling and only then consider splitting the `Shipment` store shape itself.

8. **Phase 4 scale and performance**
   - **Completed on:** 2026-03-14
   - **What changed:**
     - Added a balanced first pass of route-level code-splitting using `React.lazy` + `Suspense` for high-value non-core screens:
       - `src/components/Distributors/DistributorsPage.tsx`
       - `src/components/Distributors/DistributorDetails.tsx`
       - `src/components/Customers/AddCustomers/AddCustomers.tsx`
       - `src/pages/AdminPages/ProductsList/Products.tsx`
       - `src/pages/SharedPages/OrdersTable/OrdersTable.tsx`
       - `src/pages/SharedPages/Shipment/ShipmentsList.tsx`
     - Kept the auth/bootstrap shell eager and preserved the existing nested lazy-load inside `AdminHomePage` for `FinanceDashboard`.
     - Cleaned `src/utils/readme.md` so it no longer contains stale legacy schema notes, and added IndexedDB versioning/migration guidance: when to bump `DB_VERSION`, preferred `oldVersion < N` upgrade steps, additive vs breaking changes, and a schema-change maintainer checklist.
     - Updated `docs/state-management.md` to point maintainers to the canonical IndexedDB versioning rules and to keep `tests/e2e/support/idb.ts` aligned with schema changes.
   - **Notes:** This is intentionally a balanced first pass, not a full app-wide lazy-loading sweep. If bundle pressure grows further, the next step is to profile the remaining heavy routes and consider broader route or modal-level splitting.

9. **Data-access architecture boundary**
   - **Completed on:** 2026-03-14
   - **What changed:**
     - Added `src/features/api/http.ts` as the shared non-RTK transport boundary for API URL resolution, auth headers, JSON parsing, normalized request errors, and axios config reuse.
     - Moved domain API ownership out of `src/utils/` for the refactored paths:
       - distributor APIs now live in `src/features/distributors/apiDistributors.ts`
       - shipment bootstrap/preload APIs now live in `src/features/shipments/apiShipments.ts`
       - customer invoice cache refresh now lives in `src/features/customers/apiCustomers.ts`
     - Removed the corresponding legacy utility API modules from `src/utils/`.
     - Refactored the highest-risk direct HTTP seams out of UI/controller files, including shipment bootstrap, update-customer flows, update-order/payment flows, customer statement loading, and distributor data loading.
     - Standardized the rule in docs: RTK Query for shared read-heavy state, feature API modules for imperative or transitional requests, and no new business-domain HTTP inside page/component/controller files.
   - **Notes:** This is a boundary-hardening pass, not a claim that every request in the repo has already been migrated. Remaining lower-priority direct request sites should be removed incrementally when touched.

10. **Folder responsibility boundary**
   - **Completed on:** 2026-03-14
   - **What changed:**
     - Added thin route-entry pages for high-signal routed screens so routers import `src/pages/**` entry files instead of deep feature components directly:
       - `src/pages/AdminPages/Distributors/DistributorsPage.tsx`
       - `src/pages/AdminPages/Distributors/DistributorDetailsPage.tsx`
       - `src/pages/EmployeePages/StartShipment/StartShipmentPage.tsx`
       - `src/pages/SharedPages/UpdateCustomer/UpdateCustomerPage.tsx`
       - `src/pages/SharedPages/UpdateOrder/UpdateOrderPage.tsx`
     - Moved feature-owned controller hooks out of `src/components/` and into the owning feature:
       - `src/features/customers/hooks/useUpdateCustomerController.ts`
       - `src/features/orders/hooks/useRecordOrderController.ts`
       - `src/features/distributors/hooks/useCompanyDistributorData.ts`
       - `src/features/shipments/hooks/useStartShipmentController.ts`
     - Moved the invoice preview projection helper to `src/features/orders/utils/invoicePreview.ts` so `src/utils/` stays generic.
     - Updated routers, screens, and tests to follow the new page-entry + feature-controller pattern.
   - **Notes:** This is intentionally a focused pass, not a repo-wide move of every screen. Remaining routed screens under `src/components/` can adopt the same pattern incrementally when touched.

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

2. **API ownership**
   - New domain API code belongs in the owning feature (`src/features/**/api*.ts`) or in `src/features/api/trxApi.ts` for shared read-heavy/server-state endpoints. Do not add new API modules under `src/utils/`.

3. **Shared non-RTK HTTP**
   - Non-RTK server communication must go through `src/features/api/http.ts` (or helpers built on it) so `API_BASE`, auth headers, JSON parsing, and axios config reuse stay consistent.
   - Do not hand-roll `Authorization` headers, API URLs, or ad-hoc JSON parsing in each feature.

4. **No business HTTP in UI files**
   - Pages, components, and controller hooks may orchestrate server work, but business-domain requests must live in feature APIs or RTK Query endpoints, not inline `fetch`/`axios` calls in UI files.

5. **Memoized selectors**
   - Any Redux selector that returns an object or array must be implemented with `createSelector` from `@reduxjs/toolkit` so that the same reference is returned when inputs are unchanged. This avoids unnecessary rerenders and satisfies Redux's expectations. Primitive-returning selectors do not need memoization.

6. **Logging**
   - Use `src/utils/logger.ts` instead of raw `console.log`/`console.info` for runtime status messages. `debug`/`info` are silent in production by default; keep `warn`/`error` for actionable failures only.

7. **Documentation index**
   - When adding new documentation (under `docs/` or under `src/**/docs/`), add an entry to [docs/INDEX.md](INDEX.md). For top-level or user-facing docs, also add a link in the README [Documentation map](../README.md#documentation-map) if appropriate.

8. **Folder responsibilities**
   - New routed screens should prefer a thin `src/pages/**` entry file.
   - Cross-file workflow controllers, feature-owned helpers, and orchestration hooks belong in `src/features/**`, not `src/components/` or `src/utils/`.
   - `src/components/` should stay focused on shared/reusable UI and clearly scoped feature UI building blocks.
