# Documentation index

Single entry point for all project documentation. For a curated high-level map, see the [Documentation map](../README.md#documentation-map) in the root README.

---

## Root `docs/`

| Document | Description |
|----------|-------------|
| [trx-product-overview-frontend.md](trx-product-overview-frontend.md) | Product overview, user roles, flows, and frontend capabilities. |
| [frontend-architecture.md](frontend-architecture.md) | Canonical frontend architecture rules: data access policy plus folder responsibility model for pages, components, features, utils, and redux. |
| [folder-structure.md](folder-structure.md) | Where things live in `src/`, including route-entry pages, feature-owned controllers, and shared infrastructure boundaries. |
| [state-management.md](state-management.md) | Redux, feature hooks, IndexedDB, auth/session, and how they interact. |
| [technical-debt.md](technical-debt.md) | Known architectural risks, completed refactors, and planned improvements. |
| [architecture-evaluation.md](architecture-evaluation.md) | Senior-level evaluation: separation of concerns, modularity, scalability, naming, readability, coupling, onboarding, testability, maintainability; strengths and risks. |
| [testing.md](testing.md) | Testing strategy, current test coverage, conventions, and how to run focused tests. |

### `docs/pages/`

| Document | Description |
|----------|-------------|
| [AdminHomePage.md](pages/AdminHomePage.md) | Admin dashboard (hero, today snapshot, KPIs, finance tile). |
| [EmployeeHomePage.md](pages/EmployeeHomePage.md) | Employee dashboard. |
| [ProductsList.md](pages/ProductsList.md) | Products management page. |
| [SharedPages.md](pages/SharedPages.md) | Shared pages: addresses, areas, shipments list, customers, orders, expenses, profits, etc. |

### `docs/frontend/`

| Document | Description |
|----------|-------------|
| [page-architecture-contract.md](frontend/page-architecture-contract.md) | Standard page folder layers (`services/`, `adapters/`, `state/`, `hooks/`); Employee Home reference. |
| [migration-page-contract.md](frontend/migration-page-contract.md) | How to migrate other pages to the contract. |
| [employee-home.md](frontend/employee-home.md) | Employee home data flow and extension notes. |
| [frontend-project-blueprint.md](architecture/frontend-project-blueprint.md) | Whole-repo structure map, testing tiers, docs checklist, **commit conventions** (Conventional Commits, body, granularity). |

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


---
## How to add documentation

1. **Add an entry to this index** — In the table that matches your doc's location (root `docs/`, `docs/pages/`, `docs/components/`, `docs/css/`, or "Feature- and page-level docs"). Include the path and a short description.
2. **Update the README** — If the doc is top-level or important for navigation, add a link in the [README Documentation map](../README.md#documentation-map).
3. **Keep conventions** — See [technical-debt.md § Architecture conventions](technical-debt.md#architecture-conventions-ongoing) for the standing rule on keeping the index up to date.

