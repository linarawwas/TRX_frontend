# Documentation index

Single entry point for all project documentation. For a curated high-level map, see the [Documentation map](../README.md#documentation-map) in the root README.

---

## Root `docs/`

| Document | Description |
|----------|-------------|
| [trx-product-overview-frontend.md](trx-product-overview-frontend.md) | Product overview, user roles, flows, and frontend capabilities. |
| [folder-structure.md](folder-structure.md) | Where things live in `src/` (layers, features, shared code). |
| [state-management.md](state-management.md) | Redux, feature hooks, IndexedDB, auth/session, and how they interact. |
| [technical-debt.md](technical-debt.md) | Known architectural risks, completed refactors, and planned improvements. |

### `docs/pages/`

| Document | Description |
|----------|-------------|
| [AdminHomePage.md](pages/AdminHomePage.md) | Admin dashboard (hero, today snapshot, KPIs, finance tile). |
| [EmployeeHomePage.md](pages/EmployeeHomePage.md) | Employee dashboard. |
| [ProductsList.md](pages/ProductsList.md) | Products management page. |
| [SharedPages.md](pages/SharedPages.md) | Shared pages: addresses, areas, shipments list, customers, orders, expenses, profits, etc. |

### `docs/components/`

| Document | Description |
|----------|-------------|
| [RefactoredComponents.md](components/RefactoredComponents.md) | Shared UI components, hooks, and patterns (e.g. NumberInput, KpiCard, Sparkline). |

### `docs/css/`

| Document | Description |
|----------|-------------|
| [RefactorGuide.md](css/RefactorGuide.md) | CSS refactoring notes and conventions. |

---

## Feature- and page-level docs (`src/`)

Docs colocated with code; useful when working inside a specific feature or page.

| Path | Description |
|------|-------------|
| [src/features/finance/docs/INDEX.md](../src/features/finance/docs/INDEX.md) | Finance feature: types, hooks, selectors, utilities. |
| [src/pages/AdminPages/AdminHomePage/docs/README.md](../src/pages/AdminPages/AdminHomePage/docs/README.md) | Admin home page structure and behavior. |
| [src/pages/AdminPages/FinanceDashboard/docs/README.md](../src/pages/AdminPages/FinanceDashboard/docs/README.md) | Finance dashboard page and components. |

---

## Other references

- **IndexedDB** — Implementation and API are documented in [src/utils/readme.md](../src/utils/readme.md) (next to `indexedDB.ts`).
- **API base** — Configuration is in [src/config/api.ts](../src/config/api.ts); see README “Local development” for env vars.

When adding new documentation, add an entry here (and in the README Documentation map if it’s a top-level doc) so the index stays up to date.
