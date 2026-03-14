# TRX Frontend

Offline-first, mobile-first frontend for TRX: a SaaS application that digitizes delivery and collection workflow for bottled-water companies.

---

## Project overview

The app provides:

- **Admin experience** — Monitoring shipments, customers, areas, distributors, and financial performance.
- **Employee experience** — Field work, offline order capture, and daily routes.
- **RTL, Arabic-first UI** with dual-currency (USD/LBP) support.

For product and feature details, see [**docs/trx-product-overview-frontend.md**](docs/trx-product-overview-frontend.md).

## Why this system exists

Delivery and cash-collection in Lebanon face:

- **Unstable connectivity** — Routes often out of coverage.
- **Dual-currency** — USD and LBP.
- **Manual, paper-based operations** — Hard to audit and scale.

This frontend:

- Lets drivers **record deliveries, returns, and payments offline** and sync later.
- Gives admins **real-time visibility** into shipments and finances.
- Organizes customers, areas, and rounds for multiple distributors.

## Key capabilities

- **Shipments & rounds** — Start shipments and rounds; track delivered/returned/carrying per day and per round; shipment lists and KPIs.
- **Orders & customers** — Record orders per customer (delivered, returned, USD/LBP payments); customer statements and invoices; browse by area, sequence, status.
- **Finance** — Record expenses and extra profits per shipment/day; daily and monthly dashboards; filter and edit by type, category, period.
- **Offline** — Preload/cache areas, customers, products, discounts, invoices; queue orders when offline and sync when back online; UI shows pending offline orders.
- **Role-based UI** — **Admin**: dashboards, finance, products, distributors, reports. **Employee**: today snapshot, routes, record order, current shipment.

## Architecture overview

### Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript |
| State | Redux Toolkit (`configureStore`, `createSlice`), RTK Query for API caching |
| Routing | React Router v6 |
| Offline | IndexedDB via `idb`; service worker in production |
| HTTP | Axios / fetch; API base from `src/config/api.ts` |
| UI feedback | react-toastify |
| i18n | Custom typed Arabic translation keys (`src/utils/i18n.ts`) |
| Tooling | Create React App (react-scripts) |

### High-level layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **App bootstrap** | `src/index.tsx` → `src/app/main.tsx` | React root, Redux Provider, service worker registration |
| **Layout & routing** | `src/Layout/`, `src/Router/` | Authenticated layout, role-based AdminRouter / EmployeeRouter, shared CommonRoutes |
| **Pages** | `src/pages/AdminPages/`, `EmployeePages/`, `SharedPages/` | Role-specific and shared page containers |
| **Components** | `src/components/` | Reusable and domain UI; large screens like `RecordOrder` and `UpdateCustomer` now compose smaller presentational sections over controller hooks |
| **Features** | `src/features/` | Domain modules: auth, finance, shipments, products, orders, customers, areas, API (RTK Query) |
| **Global state** | `src/redux/` | Store (Toolkit), slices (UserInfo, Order, Shipment, Defaults), memoized selectors |
| **Infrastructure** | `src/utils/`, `src/hooks/`, `src/config/` | IndexedDB, API config, i18n, offline sync, shared hooks |

See [**docs/folder-structure.md**](docs/folder-structure.md) for a detailed breakdown.

### Redux and RTK Query

- **Store** (`src/redux/store.ts`) — `configureStore` with `rootReducer`, `localStorage` preload and subscribe, and middleware: `getDefaultMiddleware().concat(trxApi.middleware)` so thunks and RTK Query work.
- **Slices** — UserInfo, Order, Shipment, Defaults are implemented with `createSlice`. Selectors that return objects/arrays (e.g. `selectTodayProgress`, `selectRoundProgress`) use `createSelector` to avoid unnecessary rerenders.
- **RTK Query** — `src/features/api/trxApi.ts` defines the API slice; `useListShipmentsRangeQuery`, `useLazyShipmentsOrdersByDateQuery`, and hooks like `useTodayShipmentTotals` use it. New read-heavy flows should add endpoints here.

### Auth and session

- **Auth feature** — `src/features/auth/`: `authStorage.ts` (load/save auth to `localStorage`, hydrate Redux), `authApi.ts` (`fetchMeAndSync`), `useAuth.ts`.
- **App** — `App.tsx` uses `hydrateAuthFromStorage(dispatch)` and gates routes by `isAuthenticated`. `Layout.tsx` calls `fetchMeAndSync(token, dispatch)` to refresh user profile and role.

### Offline and service worker

- **Service worker** — Registered in production in `src/app/main.tsx`; caches assets and supports update flow (reload on controller change). Runtime status logging now goes through `src/utils/logger.ts`.
- **IndexedDB** (`src/utils/indexedDB.ts`) — Stores pending requests, customers, areas, products, discounts, invoices, days, exchange rates. See `src/utils/readme.md`.
- **Sync** — `src/hooks/useSyncOfflineOrders.ts` (mounted from `App.tsx`) replays pending order requests when back online and updates Redux.

### Error handling

- **ErrorBoundary** — Wraps the authenticated app shell in `App.tsx`. Renders `AuthAppErrorFallback` (RTL-aware refresh and login links) so render errors don’t white-screen the app. Login route is outside the boundary.

## Folder structure (high level)

```text
src/
  index.tsx           # CRA entry; delegates to app/main
  app/                # main.tsx (React root, Provider, SW), App.tsx (routing, auth gate)
  Layout/              # Layout.tsx (menu, toasts, AdminRouter | EmployeeRouter)
  Router/              # AdminRouter, EmployeeRouter, CommonRoutes
  pages/               # AdminPages, EmployeePages, SharedPages
  components/          # UI reusables, dashboard, visuals, domain components, ErrorBoundary
  features/            # auth, api (trxApi), finance, shipments, products, orders, customers, areas
  redux/               # store, rootReducer, slices, selectors
  utils/               # indexedDB, API helpers, i18n, money, date, etc.
  hooks/               # useMediaQuery, useSyncOfflineOrders
  config/              # api.ts (API_BASE)
  shared/styles/       # Global styles
  types/               # Shared TypeScript declarations
```

Details: [**docs/folder-structure.md**](docs/folder-structure.md).

## Core technical decisions

- **Redux Toolkit for global state** — Slices with `createSlice`; store with `configureStore` and thunk + RTK Query middleware. State is hydrated from `localStorage` and persisted on change.
- **RTK Query for server state** — Shared caching, deduplication, and lifecycle for API data; extend via new endpoints in `trxApi.ts`.
- **Feature modules and controller hooks for domain logic** — Features own types, API, hooks, selectors, utils; the heaviest UI flows now keep business logic in controller hooks and keep page files mostly compositional.
- **IndexedDB as offline layer** — Centralized in `src/utils/indexedDB.ts`; used for queuing and caching; see `src/utils/readme.md`.
- **Typed i18n** — `TranslationKey` union and `t(key, params?)` in `src/utils/i18n.ts`.
- **Single API base** — All calls use `API_BASE` (or `apiUrl()`) from `src/config/api.ts`; no direct env or hardcoded hosts in features.

## Data flow (high level)

1. **App startup** — `index.tsx` → `main.tsx` → Provider + `App`. `App` runs `hydrateAuthFromStorage(dispatch)` and routes to `/login` or authenticated layout by `isAuthenticated`.
2. **After login** — `Layout` mounts, calls `fetchMeAndSync(token, dispatch)` (`/api/users/me`), updates Redux and `localStorage`, then renders AdminRouter or EmployeeRouter.
3. **Routes** — `CommonRoutes` holds shared routes; each router adds role-specific routes and uses `CommonRoutes()` so only `<Route>` elements are children of `<Routes>`.
4. **Example: Admin today** — `AdminHomePage` uses `useTodayShipmentTotals(token, companyId)` (RTK Query); renders RingCard, KPI cards, CurrentShipmentStat.
5. **Example: Offline orders** — Orders stored in IndexedDB; `useSyncOfflineOrders` replays on `online`, updates Shipment slice and shows toasts.

More narrative flows: [**docs/trx-product-overview-frontend.md**](docs/trx-product-overview-frontend.md). State details: [**docs/state-management.md**](docs/state-management.md).

## Local development

### Prerequisites

- Node.js (LTS)
- npm or yarn
- Backend API compatible with the endpoints used in `src/features/**` and shared infrastructure helpers under `src/utils/`

### Setup

```bash
npm install
```

### Environment variables

- **API base** — All requests use `API_BASE` from `src/config/api.ts`.
  - When the app runs on **localhost** (any port), the frontend **always** uses `http://localhost:5000` so dev never hits a remote API.
  - Otherwise it uses `REACT_APP_API_BASE_URL` or `REACT_APP_API_BASE` from `.env` (no trailing slash).

Example `.env` for non-localhost:

```bash
REACT_APP_API_BASE_URL=https://api.example.com
```

### Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests (CRA) |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` / `npm run format:check` | Prettier on `src/**/*` |

## Environment and debugging

- **Service worker** — Production only; registration and update events are logged through `src/utils/logger.ts`.
- **IndexedDB** — Add `?idbdebug=1` or set `localStorage.IDB_DEBUG = "1"` for verbose logs.

## Documentation map

**Single index:** [**docs/INDEX.md**](docs/INDEX.md) — Lists all docs under `docs/` and feature-level docs under `src/`.

| Area | Documents |
|------|-----------|
| **Product** | [trx-product-overview-frontend.md](docs/trx-product-overview-frontend.md) |
| **Pages** | [AdminHomePage](docs/pages/AdminHomePage.md), [EmployeeHomePage](docs/pages/EmployeeHomePage.md), [ProductsList](docs/pages/ProductsList.md), [SharedPages](docs/pages/SharedPages.md) |
| **Components** | [RefactoredComponents](docs/components/RefactoredComponents.md) |
| **CSS** | [RefactorGuide](docs/css/RefactorGuide.md) |
| **Architecture** | [folder-structure](docs/folder-structure.md), [state-management](docs/state-management.md), [technical-debt](docs/technical-debt.md), [architecture-evaluation](docs/architecture-evaluation.md), [testing](docs/testing.md) |

Feature- and page-level docs under `src/` are linked from [docs/INDEX.md](docs/INDEX.md).

## Improvement roadmap

The codebase is feature-oriented and hook-driven. The items tracked in [**docs/technical-debt.md**](docs/technical-debt.md) are largely complete (API base, router consolidation, auth feature, Redux Toolkit store and slices, RTK Query, error boundaries, IndexedDB docs, forms validation, documentation index). In addition:

- **Conventions (done)** — [Architecture conventions](docs/technical-debt.md#architecture-conventions-ongoing) are documented: (1) use RTK Query for new data-heavy features, (2) memoize selectors that return objects/arrays with `createSelector`, (3) add new docs to [docs/INDEX.md](docs/INDEX.md) (see [How to add documentation](docs/INDEX.md#how-to-add-documentation)). All Redux selectors that return non-primitives are now memoized.
- **Phase 1 completed** — The first test baseline is in place ([testing guide](docs/testing.md), selector tests, and initial feature-hook tests), Shipment reducer typing shortcuts were removed, and the store no longer relies on a middleware `@ts-expect-error`.
- **Phase 2 completed** — Finance API ownership now lives under `src/features/finance/apiFinance.ts`, the `orders-today` read flow now uses `trxApi`, and the noisiest startup/offline runtime logs are routed through `src/utils/logger.ts`.
- **Phase 3.1 completed** — `RecordOrder.tsx` and `UpdateCustomer.tsx` are now composition files over controller hooks and presentational subcomponents, with page-level tests covering stepper/modal/form wiring and key UI branches.

**Optional, longer-term:** Shipment slice decomposition or boundary documentation; a few multi-screen integration tests; error boundaries per feature area; further form/validation standardization.

When refactors land, update `docs/technical-debt.md` so the roadmap stays accurate.
