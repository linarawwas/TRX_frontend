## Folder structure

This document explains how the frontend codebase is organized and where new code should go.

### Top-level layout

- `src/app/`
  - `main.tsx` — React root, Redux provider, service worker registration.
  - `App.tsx` — Top-level routing and auth gate.

- `src/Layout/`
  - `Layout.tsx` — Authenticated layout (side menu, toasts) and role-based router selection.

- `src/Router/`
  - `AdminRouter.tsx` — Routes for admin users.
  - `EmployeeRouter.tsx` — Routes for employee users.

### Pages

- `src/pages/AdminPages/`
  - `AdminHomePage/` — Admin dashboard.
  - `FinanceDashboard/` — Finance management (daily, monthly, entries).
  - `ProductsList/` — Product catalog management.

- `src/pages/EmployeePages/`
  - `EmployeeHomePage/` — Employee dashboard and quick actions.

- `src/pages/SharedPages/`
  - Shared flows used by both roles:
    - `Addresses/` — Customers within an area and sequence management.
    - `Areas/`, `AreasForDay/` — Area and route organization.
    - `CustomersForArea/`, `viewCustomers/` — Customer listings.
    - `Shipment/ShipmentsList.tsx` — Shipments over time.
    - `OrdersTable/`, `RecordOrderForCustomer/` — Orders and order recording.
    - `ViewExpenses/`, `ViewProfits/` — Expenses and extra profits.
    - `Login/` — Authentication.
  - See `docs/pages/SharedPages.md` for implementation details.

### Components

- `src/components/`
  - `UI reusables/` — Generic inputs and loaders (`NumberInput`, `SelectInput`, `SpinLoader`).
  - `dashboard/` — KPI and ring components used on dashboards.
  - `visuals/` — Visualization primitives (`ProgressRing`, `Sparkline`).
  - Domain-specific components:
    - `Customers/`, `Orders/`, `Areas/`, `Shipments/`, `Distributors/`,
    - `Profits/`, `Expenses/`, `EmployeeComponents/`, `LandingPage/`.
  - `ErrorBoundary.tsx` — App-level error boundary.
  - See `docs/components/RefactoredComponents.md` for patterns used here.

### Features

- `src/features/api/` — Shared API infrastructure: RTK Query slice (`trxApi.ts`) and non-RTK transport helpers (`http.ts`).
- `src/features/finance/` — Types, hooks, selectors, and utilities for finance.
- `src/features/shipments/` — Hooks and utilities for shipment totals.
- `src/features/orders/` — Orders API client.
- `src/features/products/` — Products API and hooks.
- `src/features/customers/` — Customers API.
- `src/features/areas/` — Areas API and utilities.
- `src/features/distributors/` — Distributor API ownership.

New domain logic with a clear boundary should be added as a new folder under `src/features/`.

### State

- `src/redux/`
  - `store.ts` — Redux store configuration and `RootState` type.
  - `rootReducer.ts` — Combines slices.
  - `UserInfo/`, `Order/`, `Shipment/`, `Defaults/` — Slice reducers and actions.
  - `selectors/` — Typed selectors for user, order, and shipment.

### Infrastructure

- `src/utils/`
  - `indexedDB.ts` — IndexedDB abstraction (requests, customers, areas, invoices, products, exchange rates, etc.).
  - `i18n.ts` — Translation keys and `t()` helper.
  - Other helpers: WhatsApp links, money formatting, invoice preview, date utilities.

- `src/hooks/`
  - `useMediaQuery.ts` — SSR-safe media query hook.
  - `useSyncOfflineOrders.ts` — Background sync for offline orders.

- `src/config/api.ts`
  - Provides `API_BASE` for API calls.

### Data access placement

When adding or changing server communication:

- Put **shared read-heavy, cacheable queries** in `src/features/api/trxApi.ts`.
- Put **feature-owned mutations or imperative requests** in the owning `src/features/**/api*.ts` file.
- Use `src/features/api/http.ts` for non-RTK auth/base-URL/request helpers.
- Do not add domain API ownership back under `src/utils/`.

When in doubt, prefer:

- **`pages/`** for routing‑level containers.
- **`components/`** for reusable presentation.
- **`features/`** for domain logic and data access.
- **`redux/`** only for truly global cross‑feature state.

