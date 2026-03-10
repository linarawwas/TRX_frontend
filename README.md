## Project overview

This repository contains the frontend for TRX: an offline‑first, mobile‑first SaaS application that digitizes the delivery and collection workflow for bottled‑water and gas‑cylinder distribution companies.

The app provides:

- An **admin experience** for monitoring shipments, customers, areas, distributors, and financial performance.
- An **employee experience** optimized for field work, including offline order capture and daily routes.
- A fully **RTL, Arabic‑first UI** with dual‑currency (USD/LBP) support.

For a deep product and feature walkthrough, see  
[`docs/trx-product-overview-frontend.md`](docs/trx-product-overview-frontend.md).

## Why this system exists

Delivery and cash‑collection work in Lebanon happens under:

- **Unstable connectivity** (routes out of coverage for long periods).
- **Dual‑currency constraints** (USD and LBP).
- **Manual, paper‑based operations** that are hard to audit and scale.

This frontend is designed to:

- Let drivers **record deliveries, returns, and payments entirely offline** and sync later.
- Give admins and accountants **real‑time visibility** into shipments and finances.
- Organize customers, areas, and rounds into a workflow that can scale with multiple distributors.

## Key capabilities

From the frontend’s perspective, TRX enables:

- **Shipments & rounds**
  - Start shipments and additional rounds during the day.
  - Track delivered vs returned vs carrying, per day and per round.
  - View shipment lists with KPIs and per‑shipment breakdowns.

- **Orders & customers**
  - Record orders per customer (delivered, returned, payments in USD/LBP).
  - See customer statements and invoices with running balances.
  - Browse and search customers by area, sequence, and status.

- **Finance**
  - Record expenses and extra profits per shipment and per day.
  - Inspect daily and monthly finance dashboards with normalized totals.
  - Filter and edit entries by type, category, and period.

- **Offline‑aware workflows**
  - Preload and cache areas, customers, products, discounts, and invoices.
  - Queue orders when offline and **sync later** with background retry.
  - Indicate pending offline orders in the UI.

- **Role‑based UI**
  - **Admin**: dashboards, finance, products, distributors, reports.
  - **Employee**: today’s snapshot, routes, record order, current shipment.

## Architecture overview

### Tech stack

- **React 18 + TypeScript**
- **Redux** (classic) for core global state
- **React Router v6** for routing
- **IndexedDB** via `idb` for offline caching and background sync
- **Axios / fetch** for HTTP calls
- **react‑toastify** for notifications
- **Custom i18n** utility for typed Arabic translation keys
- **Create React App** tooling and a custom service worker registration

### High‑level layers

- **UI & pages** — `src/pages/**`, `src/components/**`
  - Page containers per role (admin/employee) and shared flows.
  - Presentational components for KPIs, progress rings, lists, and forms.

- **Feature modules** — `src/features/**`
  - Domain modules for finance, shipments, products, orders, customers, and areas.
  - Provide typed APIs, hooks, selectors, and utilities per feature.

- **Global state** — `src/redux/**`
  - Slices for user/session, current order context, shipment state, and defaults.
  - Store is hydrated from `localStorage` and persisted back on each change.

- **Infrastructure & utilities** — `src/utils/**`, `src/hooks/**`, `src/config/**`
  - IndexedDB abstraction, API base configuration, i18n, offline sync, shared hooks.

### Offline & service worker

- A service worker is registered in production (`src/app/main.tsx`) to cache built assets and coordinate updates.
- IndexedDB (`src/utils/indexedDB.ts`) stores:
  - Pending API requests (offline orders),
  - Customers, areas, products, discounts, invoices, days, and exchange rates.
- `src/hooks/useSyncOfflineOrders.ts`:
  - Listens for `online` events.
  - Replays pending order requests and updates Redux.
  - Uses toasts and retries to keep the user informed.

## Folder structure (high level)

```text
src/
  app/            # Bootstrap (React root, SW registration, App)
  Layout/         # Authenticated layout + role-based routing (admin vs employee)
  Router/         # AdminRouter and EmployeeRouter (react-router v6)
  pages/          # AdminPages, EmployeePages, SharedPages
  components/     # Reusable UI and domain components (KPI, snapshots, forms, etc.)
  features/       # Domain feature modules (finance, shipments, products, orders, customers, areas)
  redux/          # Redux store, reducers, and typed selectors
  utils/          # IndexedDB, API helpers, i18n, money, WhatsApp, date utils, etc.
  hooks/          # Shared hooks (media query, offline sync)
  config/         # API base and environment configuration
  shared/styles/  # Global styles
  types/          # Shared TypeScript declarations
```

See [`docs/folder-structure.md`](docs/folder-structure.md) for a more detailed breakdown.

## Core technical decisions

- **Redux for core global state**
  - User/session, shipment metrics, and current order selection are centralized in Redux.
  - The store loads from `localStorage` at startup and persists on every change.

- **Feature modules for domain logic**
  - Newer domains (finance, products, shipments, shared pages) follow a feature‑first pattern:
    - `types.ts`, `api*.ts`, `hooks/*`, `selectors.ts`, `utils/*`, and docs.
  - Page components coordinate hooks and UI, staying relatively thin.

- **IndexedDB as a first‑class storage layer**
  - Centralized in `src/utils/indexedDB.ts` with logging, timing, and separate stores per domain.
  - Used both for offline queuing (pending requests) and caching (customers, areas, invoices, exchange rate).

- **Typed i18n**
  - `TranslationKey` union ensures translation keys are type‑checked.
  - `t(key, params?)` handles interpolation and keeps Arabic text out of components when possible.

- **Service worker with explicit update flow**
  - A small update routine sends `SKIP_WAITING` to the waiting worker and reloads the page when a new SW activates.

## Data / request flow (high level)

### Authentication and routing

1. `src/app/App.tsx`:
   - Reads `token`, `companyId`, `isAdmin`, `username` from `localStorage`.
   - Seeds Redux with this information.
   - Routes `/login` vs `/*` based on authentication.

2. `src/Layout/Layout.tsx`:
   - On mount, calls `/api/users/me` to refresh user profile and role.
   - Writes updated `companyId`, `isAdmin`, and `username` to Redux and `localStorage`.
   - Renders the side menu and either `AdminRouter` or `EmployeeRouter`.

3. `AdminRouter` and `EmployeeRouter`:
   - Define page routes for each role using React Router v6.

### Example: Admin dashboard (today)

- `AdminHomePage`:
  - Reads `token` and `companyId` from Redux.
  - Uses `useTodayShipmentTotals(token, companyId)` (`src/features/shipments/hooks/useTodayShipmentTotals.ts`).
  - Computes net USD/LBP and trend data using shipment utilities.
  - Renders:
    - `RingCard` with a visual delivery rate,
    - KPI cards for net USD, LBP payments, and LBP expenses,
    - Current shipment stats.

### Example: Offline order sync

- When offline:
  - Order submissions are stored to IndexedDB via the `requests` store.

- When connectivity returns:
  - `useSyncOfflineOrders`:
    - Loads all pending requests.
    - Replays them against the API.
    - On success: removes them from IndexedDB, updates shipment Redux state, and shows a success toast.
    - On failure: logs and shows an error toast, then schedules a retry.

For a more narrative explanation of user flows, see  
[`docs/trx-product-overview-frontend.md`](docs/trx-product-overview-frontend.md).

## State management

- **Redux slices** (`src/redux/*`):
  - `UserInfo` — session token, companyId, isAdmin, username.
  - `Order` — currently selected area, customer, product, and price.
  - `Shipment` — shipment identifiers, date, metrics, customer lists, and round state.
  - `Defaults` — configuration values and defaults.

- **Feature hooks** (`src/features/**/hooks/*`):
  - Encapsulate data fetching and derived logic for:
    - Finance summaries and entries,
    - Products,
    - Shipments,
    - Orders,
    - Customers and areas.

- **IndexedDB**:
  - Used for caching and offline persistence, especially for customers, areas, invoices, exchange rates, and queued requests.

See [`docs/state-management.md`](docs/state-management.md) for details and examples.

## Local development

### Prerequisites

- Node.js (LTS)
- npm or yarn
- A running backend API compatible with the endpoints used in `src/features/**` and `src/utils/api*.ts`

### Setup

```bash
npm install
```

### Environment variables

Create a `.env` file at the project root, for example:

```bash
REACT_APP_API_BASE=https://api.example.com
```

The frontend reads  `REACT_APP_API_BASE_URL` from the .env file. All API modules consume the normalized `API_BASE` exported from `src/config/api.ts`.

### Scripts

- `npm start` — start development server.
- `npm run build` — production build.
- `npm test` — run tests (via CRA).
- `npm run lint` / `npm run lint:fix` — run ESLint.
- `npm run format` / `npm run format:check` — run Prettier on `src/**/*`.

## Environment & debugging

- **Service worker**
  - Only registered in production builds.
  - Logs registration info and update events to the console.

- **IndexedDB debugging**
  - Add `?idbdebug=1` to the URL **or** set `localStorage.IDB_DEBUG = "1"` to enable verbose IndexedDB logs.

## Documentation map

High‑level and product:

- [`docs/trx-product-overview-frontend.md`](docs/trx-product-overview-frontend.md) — Product, user roles, flows, and frontend features.

Pages:

- [`docs/pages/AdminHomePage.md`](docs/pages/AdminHomePage.md) — Admin dashboard.
- [`docs/pages/EmployeeHomePage.md`](docs/pages/EmployeeHomePage.md) — Employee dashboard.
- [`docs/pages/ProductsList.md`](docs/pages/ProductsList.md) — Products management page.
- [`docs/pages/SharedPages.md`](docs/pages/SharedPages.md) — Shared pages (addresses, areas, shipments list, customers, orders, etc.).

Components:

- [`docs/components/RefactoredComponents.md`](docs/components/RefactoredComponents.md) — Shared UI components, hooks, and patterns.

Architecture & glue:

- [`docs/folder-structure.md`](docs/folder-structure.md) — Where things live in `src/`.
- [`docs/state-management.md`](docs/state-management.md) — Redux, feature hooks, IndexedDB, and how they interact.
- [`docs/technical-debt.md`](docs/technical-debt.md) — Known architectural risks and planned improvements.

## Improvement roadmap (architecture)

The codebase is being evolved from a classic Redux + utils structure into a feature‑oriented, hook‑driven architecture.

Planned directions (described in more detail in `docs/technical-debt.md`):

- **Quick wins**
  - Standardize API base configuration and remove remaining hardcoded URLs.
  - Clean up route duplication and naming inconsistencies.
  - Ensure all docs referencing IndexedDB match the current implementation.

- **Medium term**
  - Extract an `auth` feature for session and role management.
  - Migrate Redux slices to Redux Toolkit.

- **Long term**
  - Introduce RTK Query or a similar data‑fetching abstraction.
  - Standardize forms and validation around a shared pattern.
  - Grow test coverage around feature selectors, hooks, and critical workflows.
