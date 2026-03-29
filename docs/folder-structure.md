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
  - `Distributors/` — Thin route-entry pages for distributor list/details.

- `src/pages/EmployeePages/`
  - `EmployeeHomePage/` — Employee dashboard (**reference page contract**: `index.tsx`, `hooks/`, `state/`, `services/`, `adapters/`, `types/`, `test-utils/`, `__tests__/`, `components/EmployeeHomeShell.tsx`). See `docs/frontend/page-architecture-contract.md` and `docs/architecture/frontend-project-blueprint.md`.
  - `StartShipment/` — Thin route-entry page for shipment start.

- `src/pages/SharedPages/`
  - Shared flows used by both roles:
    - `Addresses/` — Customers within an area and sequence management.
    - `Areas/`, `AreasForDay/` — Area and route organization.
    - `CustomersForArea/`, `viewCustomers/` — Customer listings.
    - `Shipment/ShipmentsList.tsx` — Shipments over time.
    - `OrdersTable/`, `RecordOrderForCustomer/` — Orders and order recording.
    - `UpdateCustomer/`, `UpdateOrder/` — Route-entry wrappers for update flows.
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
  - Prefer this folder for reusable UI and tightly scoped feature UI building blocks.
  - Avoid treating it as the long-term home for cross-file workflow controllers or route ownership.
  - `ErrorBoundary.tsx` — App-level error boundary.
  - See `docs/components/RefactoredComponents.md` for patterns used here.

### Features

- `src/features/api/` — Shared API infrastructure: RTK Query slice (`trxApi.ts`) and non-RTK transport helpers (`http.ts`).
- `src/features/finance/` — Types, hooks, selectors, validation, and utilities for finance.
- `src/features/shipments/` — Shipment APIs and feature-owned hooks such as shipment totals and shipment-start workflow control.
- `src/features/orders/` — Orders API, controller hooks, and order-owned utilities.
- `src/features/products/` — Products API and hooks.
- `src/features/customers/` — Customers API and controller hooks.
- `src/features/areas/` — Areas API and utilities.
- `src/features/distributors/` — Distributor API ownership, hooks, and feature-local utilities.

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
  - Other helpers: WhatsApp links, money formatting, date utilities, logging.

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

### Responsibility model

When in doubt, prefer:

- **`pages/`** for routing-level entry points and composition. Route files should stay thin and delegate behavior downward.
- **`components/`** for reusable presentation and tightly scoped UI building blocks.
- **`features/`** for domain logic: APIs, controller hooks, selectors, validation, and feature-owned helpers.
- **`utils/`** only for generic non-domain infrastructure.
- **`redux/`** only for truly global cross-feature state and selector boundaries.

Examples from the current repo:

- `src/pages/EmployeePages/StartShipment/StartShipmentPage.tsx` is the route-entry page; `src/components/EmployeeComponents/StartShipment/StartShipment.tsx` is the UI composition; `src/features/shipments/hooks/useStartShipmentController.ts` owns the workflow logic.
- `src/pages/AdminPages/Distributors/DistributorsPage.tsx` and `src/pages/AdminPages/Distributors/DistributorDetailsPage.tsx` are route wrappers; distributor data loading belongs in `src/features/distributors/hooks/useCompanyDistributorData.ts`.
- `src/features/orders/utils/invoicePreview.ts` is feature-owned business logic and therefore no longer belongs in `src/utils/`.

