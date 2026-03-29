## Frontend data access architecture

This document defines where server communication belongs in the frontend and which patterns are canonical versus transitional.

### Goals

- Keep business-domain HTTP out of pages, components, and controller hooks.
- Make API ownership obvious from the folder structure.
- Use one clear strategy for API base resolution and auth headers.
- Improve coherence incrementally without a reckless rewrite.

### Folder responsibility model

- **`pages/`** — Route-entry files and route-level composition. They should stay thin and prefer delegating detailed behavior to feature hooks and UI sections. For **in-folder page modules** (e.g. Employee Home), follow **[page architecture contract](frontend/page-architecture-contract.md)** (`services/`, `adapters/`, `state/`, `hooks/`, presentational shell).
- **`components/`** — Shared/reusable UI and clearly scoped feature UI building blocks. They are not the primary home for cross-file workflow controllers.
- **`features/`** — Domain logic: APIs, controller hooks, selectors, validation, and feature-owned utilities.
- **`utils/`** — Generic non-domain infrastructure only.
- **`redux/`** — Global cross-feature state and selector boundaries only.

Current high-signal examples:

- Distributor routes now enter through `src/pages/AdminPages/Distributors/` while distributor data orchestration lives in `src/features/distributors/hooks/useCompanyDistributorData.ts`.
- Shipment start now uses `src/pages/EmployeePages/StartShipment/StartShipmentPage.tsx` as the route entry and `src/features/shipments/hooks/useStartShipmentController.ts` for workflow logic.
- `RecordOrder` and `UpdateCustomer` consume controller hooks from `src/features/orders/hooks/` and `src/features/customers/hooks/`, not from `src/components/`.

### Canonical policy

#### 1. RTK Query for shared read-heavy server state

Use `src/features/api/trxApi.ts` when the data is:

- cacheable
- shared across screens
- list/detail oriented
- likely to benefit from deduplication, loading state, or invalidation

Examples already in place:

- shipments range queries used by dashboard/reporting flows
- orders-by-date reporting for `OrdersOfToday`

#### 2. Feature API modules for imperative or transitional flows

Use `src/features/**/api*.ts` when the request is:

- mutation-heavy
- tightly owned by one feature
- not yet worth migrating to RTK Query
- part of a focused UI flow that still needs explicit orchestration

Examples:

- `src/features/customers/apiCustomers.ts`
- `src/features/orders/apiOrders.ts`
- `src/features/shipments/apiShipments.ts`
- `src/features/distributors/apiDistributors.ts`

#### 3. Route pages and UI components do not own business HTTP

UI files may orchestrate feature APIs and hooks, but they should not define domain request URLs, auth headers, or transport parsing inline.

Allowed:

- calling a feature hook
- calling a feature API function
- handling UI state, toasts, navigation, and form state

Not allowed for new code:

- `fetch("/api/...")` directly in page/component/controller files
- ad hoc `axios.get(...)` in UI files for business-domain data
- inline `Authorization: Bearer ...` construction in UI files

#### 4. Shared non-RTK HTTP helpers

Non-RTK feature APIs should use `src/features/api/http.ts`.

That file centralizes:

- API URL resolution through `src/config/api.ts`
- auth-header injection for non-RTK calls
- JSON request/response handling
- normalized error throwing
- axios config reuse

#### 5. `src/utils/` is infrastructure only

`src/utils/` should hold infrastructure and pure helpers such as:

- IndexedDB
- i18n
- logger
- money/date formatting
- generic formatting helpers

Feature-owned business helpers such as invoice/order projections should live under the owning feature, not in `src/utils/`.

### Base URL and auth strategy

#### Base URL

- `src/config/api.ts` is the single authority for `API_BASE` and `apiUrl()`.
- RTK Query uses that base through `fetchBaseQuery`.
- Non-RTK feature APIs use it indirectly through `src/features/api/http.ts`.

#### Auth headers

- RTK Query injects `Authorization` via `prepareHeaders` in `trxApi`.
- Non-RTK feature APIs use `authHeaders()`, `requestJson()`, `authAxiosConfig()`, or `jsonAxiosConfig()` from `src/features/api/http.ts`.
- UI files should not manually construct auth headers for business-domain calls.

### Incremental migration stance

This architecture is enforced incrementally, not via a full rewrite.

Current truth:

- RTK Query is still intentionally selective, not universal.
- Some feature APIs still use `axios` while others use shared `fetch` helpers.
- That transport mix is acceptable temporarily as long as ownership is feature-first and auth/base behavior stays centralized.
- Routed screens are still not universally wrapped under `pages/`, but the highest-signal flows now use thin route-entry pages and feature-owned controllers as the default pattern.
- A few lower-priority direct request sites may still exist and should be treated as remaining migration work, not hidden debt.

### Preferred decision tree

1. Is this shared, read-heavy, and cacheable?
   - Use RTK Query in `src/features/api/trxApi.ts`.
2. Is this feature-owned, imperative, or mutation-heavy?
   - Put it in that feature's `api*.ts`.
3. Does the UI need orchestration?
   - Orchestrate through a feature hook/controller, but keep transport in the feature API module.
4. Do you need a new helper?
   - Add it under `src/features/api/` only if it is shared transport infrastructure, not domain logic.

### Remaining migration work

This refactor establishes the boundary, but it does not claim the entire migration is complete.

Next likely candidates:

- lower-priority forms and upload screens that still call the backend directly
- more shared read flows that would benefit from RTK Query
- further cleanup of legacy transport style differences inside older feature API modules
