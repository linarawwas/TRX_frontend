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
| HTTP | RTK Query + feature API modules over shared helpers in `src/features/api/`; API base from `src/config/api.ts` |
| UI feedback | react-toastify |
| i18n | Custom typed Arabic translation keys (`src/utils/i18n.ts`) |
| Tooling | Create React App (react-scripts) |

### High-level layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **App bootstrap** | `src/index.tsx` → `src/app/main.tsx` | React root, Redux Provider, service worker registration |
| **Layout & routing** | `src/Layout/`, `src/Router/` | Authenticated layout, role-based AdminRouter / EmployeeRouter, shared CommonRoutes |
| **Pages** | `src/pages/AdminPages/`, `EmployeePages/`, `SharedPages/` | Route-level entry points and composition; routers should prefer importing these page wrappers instead of deep feature components directly |
| **Components** | `src/components/` | Shared UI and clearly scoped feature UI building blocks; not the primary home for cross-file workflow controllers |
| **Features** | `src/features/` | Domain modules: auth, finance, shipments, products, orders, customers, areas, distributors, shared API helpers, and feature-owned controller hooks/utils |
| **Global state** | `src/redux/` | Store (Toolkit), slices (UserInfo, Order, Shipment, Defaults), memoized selectors |
| **Infrastructure** | `src/utils/`, `src/hooks/`, `src/config/` | IndexedDB, API config, i18n, logging, generic helpers, offline sync, shared hooks |

See [**docs/folder-structure.md**](docs/folder-structure.md) for a detailed breakdown.

### Redux and RTK Query

- **Store** (`src/redux/store.ts`) — `configureStore` with `rootReducer`, `localStorage` preload and subscribe, and middleware: `getDefaultMiddleware().concat(trxApi.middleware)` so thunks and RTK Query work.
- **Slices** — UserInfo, Order, Shipment, Defaults are implemented with `createSlice`. Selectors that return objects/arrays (e.g. `selectTodayProgress`, `selectRoundProgress`) use `createSelector` to avoid unnecessary rerenders.
- **RTK Query** — `src/features/api/trxApi.ts` defines the API slice; `useListShipmentsRangeQuery`, `useLazyShipmentsOrdersByDateQuery`, and hooks like `useTodayShipmentTotals` use it. New read-heavy flows should add endpoints here.

### Data access policy

- **RTK Query first for shared read state** — Read-heavy, cacheable, cross-screen list/detail flows belong in `src/features/api/trxApi.ts`.
- **Feature API modules for imperative flows** — Mutations and feature-owned requests live in `src/features/**/api*.ts`.
- **Prefer feature hooks in UI** — Components should consume `src/features/**/hooks` for request state instead of managing API loading/error wiring inline.
- **No business HTTP in UI files** — Pages, components, and controller hooks should call feature hooks or feature API functions rather than building requests inline.
- **Shared non-RTK HTTP boundary** — Non-RTK requests should use `src/features/api/http.ts` so auth headers, JSON parsing, and API URL resolution stay consistent.
- **`src/utils/` is not for domain API ownership** — Keep it for infrastructure and pure helpers such as IndexedDB, i18n, money/date utilities, and logging.
- **Reuse existing transforms** — Use shared utilities such as `src/features/areas/utils/sortCustomers.ts` for sequence/name ordering instead of duplicating sort logic.

### Folder responsibility policy

- **`pages/`** — Route-entry files and top-level composition. Thin wrappers are preferred for routed experiences like distributors, shipment start, and update screens.
- **`components/`** — Shared/reusable UI plus tightly scoped feature UI building blocks. Presentational sections stay here; cross-file workflow controllers do not.
- **`features/`** — Domain APIs, hooks/controllers, selectors, validation, workflow helpers, and feature-owned utilities.
- **`utils/`** — Generic non-domain infrastructure only.
- **`redux/`** — Global cross-feature state and selector boundaries, not per-screen workflow state.

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
  pages/               # Route-entry pages and composition wrappers
  components/          # Shared UI and feature-scoped presentational building blocks
  features/            # auth, api (trxApi + shared http), finance, shipments, products, orders, customers, areas, distributors
  redux/               # store, rootReducer, slices, selectors
  utils/               # IndexedDB, i18n, money/date, logger, and other generic helpers
  hooks/               # useMediaQuery, useSyncOfflineOrders
  config/              # api.ts (API_BASE)
  shared/styles/       # Global styles
  types/               # Shared TypeScript declarations
```

Details: [**docs/folder-structure.md**](docs/folder-structure.md).

## Core technical decisions

- **Redux Toolkit for global state** — Slices with `createSlice`; store with `configureStore` and thunk + RTK Query middleware. State is hydrated from `localStorage` and persisted on change.
- **RTK Query for server state** — Shared caching, deduplication, and lifecycle for API data; extend via new endpoints in `trxApi.ts`.
- **Feature-owned data access for non-RTK flows** — Domain requests belong in feature API modules, and shared fetch/axios behavior goes through `src/features/api/http.ts`.
- **Feature modules and controller hooks for domain logic** — Features own types, API, hooks, selectors, utils; the heaviest UI flows now keep business logic in controller hooks and keep page files mostly compositional.
- **IndexedDB as offline layer** — Centralized in `src/utils/indexedDB.ts`; used for queuing and caching; see `src/utils/readme.md`.
- **Typed i18n** — `TranslationKey` union and `t(key, params?)` in `src/utils/i18n.ts`.
- **Single API base and auth strategy** — All calls use `API_BASE` / `apiUrl()` from `src/config/api.ts`; RTK Query injects auth in `trxApi`, while non-RTK feature APIs use the shared helpers in `src/features/api/http.ts`.

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
  - When the app runs on **localhost** (any port), the frontend **always** uses `http://localhost:5000/` so dev never hits a remote API.
  - Otherwise it uses `REACT_APP_API_BASE_URL` or `REACT_APP_API_BASE` from `.env` (no trailing slash).
  - For production behind nginx reverse proxy, use `REACT_APP_API_BASE_URL=/api`.

Example `.env` for non-localhost:

```bash
REACT_APP_API_BASE_URL=https://api.example.com
```

Example `.env.production` for nginx reverse proxy:

```bash
REACT_APP_API_BASE_URL=/api
```

### Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests (CRA) |
| `npm run test:e2e` | Run mocked Playwright browser journeys |
| `npm run test:e2e:headed` | Run Playwright in headed mode |
| `npm run test:e2e:debug` | Run Playwright with the inspector |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` / `npm run format:check` | Prettier on `src/**/*` |

## Environment and debugging

- **Service worker** — Production only; registration and update events are logged through `src/utils/logger.ts`.
- **IndexedDB** — Add `?idbdebug=1` or set `localStorage.IDB_DEBUG = "1"` for verbose logs.

## Security

Current baseline from `npm audit --json`:

- **High:** 16
- **Moderate:** 3
- **Low:** 13
- **Critical:** 0

### Vulnerability map (current)

| Package | Current version(s) | Patched version target | Dependency type | Severity |
|---|---:|---:|---|---|
| `xlsx` | `0.18.5` | `>=0.20.2` | direct | high |
| `react-scripts` | `5.0.1` | semver-major migration required | direct | high |
| `crypto-browserify` | `3.12.1` | no safe non-breaking path in current chain | direct | low |
| `serialize-javascript` | `6.0.2`, `4.0.0` | `>=7.0.3` | transitive | high |
| `underscore` | `1.13.6` | `>1.13.7` | transitive | high |
| `flatted` | `3.4.1` | `>=3.4.2` | transitive | high |
| `nth-check` | `1.0.2` | `>=2.0.1` | transitive | high |
| `postcss` | `7.0.39` (vulnerable node), `8.5.8` present | `>=8.4.31` on vulnerable path | transitive | moderate |
| `elliptic` | `6.6.1` | parent replacement required | transitive | low |
| `@tootallnate/once` | `1.1.2` | `>=3.0.1` | transitive | low |
| `webpack-dev-server` | `4.15.2` | `>=5.2.1` | transitive | moderate |
| `@svgr/plugin-svgo` / `@svgr/webpack` / `svgo` / `css-select` | `5.5.0` / `5.5.0` / `1.3.2` / `2.1.0` | requires parent major upgrade path | transitive | high |
| `workbox-build` / `workbox-webpack-plugin` / `rollup-plugin-terser` | `6.6.0` / `6.6.0` / `7.0.2` | requires parent upgrade path | transitive | high |
| `resolve-url-loader` | `4.0.0` | requires parent upgrade path | transitive | moderate |
| `jest` chain (`@jest/core`, `jest-cli`, `jest-config`, `jest-environment-jsdom`, `jsdom`, `http-proxy-agent`) | `27.x` / `16.7.0` / `4.0.1` | parent upgrade path | transitive | low |
| `bfj` / `jsonpath` | `7.1.0` / `1.3.0` | parent upgrade path | transitive | high |

Notes:

- Several transitive vulnerabilities are locked under `react-scripts@5` and require careful, non-breaking remediation strategy.
- This section is intentionally a living status tracker and is updated as fixes are applied.

## Docker deployment shape

- Frontend is built to static assets during image build.
- nginx serves the static assets on port `80`.
- nginx proxies `/api/*` to the backend container.
- Backend connects to MongoDB Atlas via `MONGO_URI`.

Run from repository root:

```bash
cp .env.example .env
docker compose up --build
```

## Browser E2E

The repo now includes a first Playwright layer for the most critical journeys, all using **mocked/intercepted APIs** rather than a live backend. This keeps the suite deterministic while still covering auth bootstrap, route branching, shipment start, offline order replay, finance entry creation, orders-today reporting, and update-customer save flow.

Typical setup:

```bash
npx playwright install chromium
npm run test:e2e
```

Notes:

- The suite targets `http://localhost:3000`.
- `playwright.config.ts` can reuse an already-running CRA dev server.
- Browser state is seeded through `tests/e2e/support/app.ts` and IndexedDB helpers in `tests/e2e/support/idb.ts`.
- Network behavior is mocked in-spec through helpers in `tests/e2e/support/network.ts`.

## Documentation map

**Single index:** [**docs/INDEX.md**](docs/INDEX.md) — Lists all docs under `docs/` and feature-level docs under `src/`.

| Area | Documents |
|------|-----------|
| **Product** | [trx-product-overview-frontend.md](docs/trx-product-overview-frontend.md) |
| **Pages** | [AdminHomePage](docs/pages/AdminHomePage.md), [EmployeeHomePage](docs/pages/EmployeeHomePage.md), [ProductsList](docs/pages/ProductsList.md), [SharedPages](docs/pages/SharedPages.md) |
| **Components** | [RefactoredComponents](docs/components/RefactoredComponents.md) |
| **CSS** | [RefactorGuide](docs/css/RefactorGuide.md) |
| **Architecture** | [frontend-architecture](docs/frontend-architecture.md), [folder-structure](docs/folder-structure.md), [state-management](docs/state-management.md), [technical-debt](docs/technical-debt.md), [architecture-evaluation](docs/architecture-evaluation.md), [testing](docs/testing.md) |

Feature- and page-level docs under `src/` are linked from [docs/INDEX.md](docs/INDEX.md).

## Improvement roadmap

The codebase is feature-oriented and hook-driven. The items tracked in [**docs/technical-debt.md**](docs/technical-debt.md) are largely complete (API base, router consolidation, auth feature, Redux Toolkit store and slices, RTK Query, error boundaries, IndexedDB docs, forms validation, documentation index). In addition:

- **Conventions (done)** — [Architecture conventions](docs/technical-debt.md#architecture-conventions-ongoing) are documented: (1) use RTK Query for new data-heavy features, (2) memoize selectors that return objects/arrays with `createSelector`, (3) add new docs to [docs/INDEX.md](docs/INDEX.md) (see [How to add documentation](docs/INDEX.md#how-to-add-documentation)). All Redux selectors that return non-primitives are now memoized.
- **Phase 1 completed** — The first test baseline is in place ([testing guide](docs/testing.md), selector tests, and initial feature-hook tests), Shipment reducer typing shortcuts were removed, and the store no longer relies on a middleware `@ts-expect-error`.
- **Phase 2 completed** — Finance API ownership now lives under `src/features/finance/apiFinance.ts`, the `orders-today` read flow now uses `trxApi`, and the noisiest startup/offline runtime logs are routed through `src/utils/logger.ts`.
- **Phase 3.1 completed** — `RecordOrder.tsx` and `UpdateCustomer.tsx` are now composition files over controller hooks and presentational subcomponents, with page-level tests covering stepper/modal/form wiring and key UI branches.
- **Critical E2E journeys completed** — Playwright now covers the highest-risk cross-layer workflows with mocked APIs and seeded browser state: auth shell, shipment start, offline replay, finance create flow, orders-today report, and update-customer save flow.
- **Phase 4 completed** — High-value non-core admin/shared routes now use route-level lazy loading with a shared suspense fallback, and `src/utils/readme.md` now documents IndexedDB versioning, migration rules, and schema-change maintenance steps.
- **Data access architecture clarified** — Shared non-RTK HTTP helpers now centralize API URL/auth behavior, domain API ownership is feature-first, and the highest-risk direct HTTP flows have been moved out of UI/controllers into feature APIs.
- **Folder responsibility boundaries clarified** — Routers now enter several routed screens through thin page files, high-signal workflow controllers live under `src/features/**/hooks`, and feature-owned helpers like invoice preview no longer live in `src/utils/`.

**Optional, longer-term:** Broader lazy-loading only if bundle metrics justify it; expand RTK Query to more shared read flows; continue removing lower-priority direct UI request sites; Shipment slice decomposition beyond the current selector boundaries if coupling remains painful; a few additional multi-screen integration tests beyond the current critical set; error boundaries per feature area; further form/validation standardization.

When refactors land, update `docs/technical-debt.md` so the roadmap stays accurate.
