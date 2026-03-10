# TRX Frontend — Architecture Evaluation

Senior-level evaluation of the codebase against industry standards. Intended for maintainers and new contributors.

---

## Red flags for senior review

If a senior frontend developer were to review this repository, these are the things that would most likely **alarm them** or stand out as **red flags** in a first pass:

| Red flag | What they see | Why it matters |
|----------|----------------|----------------|
| **One test file in the whole app** | `find src -name "*.test.*"` returns a single file (`StartShipment.test.tsx`). No tests for hooks, selectors, API layer, or critical flows (order submission, offline sync, finance). | High risk of regressions; refactors are unsafe; “we don’t have time to test” is a classic tech-debt spiral. |
| **~900 LOC component** | `UpdateCustomer.tsx` is ~898 lines; `RecordOrder.tsx` is ~755 lines. | Unmaintainable; violates single responsibility; hard to test or change; suggests logic was never extracted into hooks or smaller components. |
| **Duplicate `RootState`** | `RecordOrder.tsx` defines its own `type RootState = { ... }` instead of importing from `redux/store`. | Type drift; store changes won’t be caught here; breaks “single source of truth” for global state shape. |
| **`any` in core Redux** | `Shipment/reducer.ts` uses `(state as any).payments` and `PayloadAction<any>` for customer-order actions. | Bypasses type safety in the most critical state; defeats the purpose of TypeScript in the reducer. |
| **`@ts-expect-error` in store** | `redux/store.ts` uses `@ts-expect-error` on the middleware configuration. | Suggests version or type mismatches (e.g. redux vs RTK); could hide real bugs if the comment becomes wrong later. |
| **API logic in two places** | Both `utils/` (e.g. `apiHelpers.ts`, `apiFinances.ts`, `apiShipments.ts`) and `features/*/api*.ts` contain HTTP calls. | Unclear ownership; duplication; “where do I add a new endpoint?” has no single answer. |
| **Console usage in production path** | Dozens of `console.log` / `console.error` / `console.warn` across components, hooks, and utils (e.g. `useSyncOfflineOrders.ts` has many). | Noisy or leaking info in production; no structured logging; suggests debugging leftovers. |
| **500+ LOC IndexedDB module** | Single `utils/indexedDB.ts` file (~522 LOC) with many stores and helpers. | Single point of failure; hard to reason about; migrations and versioning are riskier. |
| **Shipment slice as a hub** | One large slice (~256 LOC) with many fields; order flow, finance, and sync all depend on it. | Any change to shipment state has broad impact; refactoring is costly and risky. |
| **No code-splitting** | No `React.lazy` or route-based splitting; one main bundle. | Bundle size will grow with every feature; slower first load; not aligned with common production practices. |

**Summary:** The most alarming points are **almost no tests**, **very large components**, **type shortcuts in Redux (`any`, duplicate RootState)**, and **split/duplicated API layer**. Addressing these first would materially improve confidence for a senior reviewer and for ongoing maintenance.

---

## Order of operations for fixing issues

Fixing things in the right order reduces rework and risk: later steps rely on the safety and clarity from earlier ones. Below is a recommended sequence.

### Phase 1 — Safety net and type correctness (do first)

**Goal:** Make refactors safe and remove type shortcuts so the rest of the work doesn’t introduce hidden bugs.

| Step | Action | Why this order |
|------|--------|----------------|
| 1.1 | **Add a minimal test suite** — Unit tests for Redux selectors (pure, easy), then 1–2 critical feature hooks (e.g. `useTodayShipmentTotals`, `useAddExpense`). Add a short `docs/testing.md` (what to test, how to run, how to mock Redux/API). | Without tests, refactoring large components or Redux is dangerous. Selectors and hooks are the fastest way to get a safety net; they also protect the next steps. |
| 1.2 | **Fix Redux types** — In `Shipment/reducer.ts`, replace `(state as any)` and `PayloadAction<any>` with proper types (e.g. extend `ShipmentState` for `payments`, type the customer-id payloads). In `RecordOrder.tsx`, delete the local `RootState` and import `RootState` from `redux/store`. | Type safety in the core store prevents drift and catches bugs when you touch shipment/order code. Doing this before big refactors avoids fixing types twice. |
| 1.3 | **Resolve or document the store `@ts-expect-error`** — Either fix the middleware typings (e.g. upgrade/align redux and RTK types) or keep the suppression with a clear comment and a link to an issue. | Removes a visible “we silenced the compiler” red flag and clarifies whether it’s technical debt or acceptable. |

**Outcome:** Tests exist for the most stable, high-value code; Redux and RecordOrder use a single, typed source of truth. You can refactor with less fear.

---

### Phase 2 — Clear boundaries (no big structural refactors yet)

**Goal:** Decide where new code lives and clean up noise so future work follows a single pattern.

| Step | Action | Why this order |
|------|--------|----------------|
| 2.1 | **Consolidate API ownership** — Document the rule: “New server state: RTK Query in `trxApi` or feature `api*.ts`; no new API in `utils/`.” Migrate 1–2 utils API modules (e.g. one from `utils/apiFinances.ts` or `utils/apiHelpers.ts`) into the corresponding feature or into `trxApi`. Leave the rest for incremental migration. | Gives a single answer to “where do I add an endpoint?” and starts reducing duplication without rewriting the whole app. |
| 2.2 | **Tame console usage** — Replace or wrap `console.log`/`error`/`warn` in a small logger that no-ops (or strips) in production, or remove obvious debug logs. Prioritize `useSyncOfflineOrders`, then other hooks and components. | Reduces production noise and info leak; quick wins, no architectural change. |

**Outcome:** New features have a clear API home; production logs are under control.

---

### Phase 3 — Reduce blast radius (make big components and slice manageable)

**Goal:** Shrink the largest components and clarify the Shipment slice so changes are local and testable.

| Step | Action | Why this order |
|------|--------|----------------|
| 3.1 | **Break down the largest components** — Start with **RecordOrder** or **UpdateCustomer**. Extract custom hooks (e.g. “order submission”, “customer form state”, “invoice fetch”) and move business logic into them; then extract presentational subcomponents. Add component or integration tests for the critical path (e.g. submit order, save customer). Repeat for the other. | Doing this after Phase 1 means you have selector/hook tests and correct types; you’re not refactoring and fixing types at once. Smaller components are easier to test and change. |
| 3.2 | **Shipment slice** — Either split into sub-slices (e.g. shipment meta vs round vs customer lists) or, if that’s too big a step, document internal “regions” and add unit tests for the reducer so future splits are safe. | Depends on having some tests (Phase 1) and possibly on RecordOrder/UpdateCustomer consuming shipment in a clearer way (Phase 3.1). Improves maintainability without blocking other work. |

**Outcome:** Critical flows live in smaller, testable units; Shipment changes are safer and more localized.

---

### Phase 4 — Scale and performance (when needed)

**Goal:** Address bundle size and IndexedDB growth when they become real constraints.

| Step | Action | Why this order |
|------|--------|----------------|
| 4.1 | **Code-splitting** — Introduce `React.lazy` for the heaviest routes (e.g. FinanceDashboard, RecordOrder, UpdateCustomer). Measure bundle size before/after. | Do this when the main bundle is actually a problem (e.g. slow first load). By then, Phase 3 should have made route boundaries clearer. |
| 4.2 | **IndexedDB** — Document versioning and migration strategy in `src/utils/readme.md`. Split by domain (e.g. requests vs customers vs areas) only if the single file becomes a real maintenance or performance bottleneck. | Low priority until the app or offline usage grows; documentation is cheap and helps anyone touching the DB. |

**Outcome:** Load time and offline layer are ready for growth without a single huge module bearing all the weight.

---

### Summary table

| Phase | Focus | Typical duration |
|-------|--------|-------------------|
| **1** | Tests (selectors, 1–2 hooks), Redux types, store ts-error | 1–2 sprints |
| **2** | API ownership rule + one migration, console cleanup | ~1 sprint |
| **3** | Extract hooks/subcomponents from RecordOrder & UpdateCustomer; Shipment slice tests or split | 2–3 sprints |
| **4** | Code-splitting, IndexedDB docs (and optional split) | As needed |

**Rule of thumb:** Do Phase 1 before any large refactor. Do Phase 3.1 (large components) before investing in Shipment slice splits. Do Phase 4 when metrics or pain justify it, not as the first priority.

---

## 1. Separation of concerns

### Strengths

- **Clear layer boundaries** — App bootstrap (`app/`), layout/routing (`Layout/`, `Router/`), pages, components, features, redux, and infrastructure are separated. Documentation (folder-structure, state-management) states where new code belongs.
- **Feature modules** — Domain logic lives in `src/features/` (auth, finance, shipments, products, orders, customers, areas, api). Features own types, API clients, hooks, and sometimes selectors/validation, so UI is not mixed with data-fetching details.
- **Redux for cross-cutting state only** — User, Order, Shipment, and Defaults are global; feature hooks own server state and derived data (e.g. `useTodayShipmentTotals`, `useAddExpense`).
- **Single API base** — All HTTP calls go through `src/config/api.ts`; no scattered env reads or hardcoded hosts.

### Gaps

- **Utils vs features** — `src/utils/` still contains API-oriented modules (`apiHelpers.ts`, `apiToday.ts`, `apiFinances.ts`, `apiShipments.ts`, `distributorApi.ts`) that overlap with feature `api*.ts` and with RTK Query. Domain-specific fetching is split between utils and features, which blurs “where does this call live?”
- **Large components** — Some components own too much: `RecordOrder.tsx` (~755 LOC) and `UpdateCustomer.tsx` (~898 LOC) mix layout, form state, Redux dispatch, IndexedDB, API helpers, and inline types. Business logic is not fully extracted into hooks or feature modules.
- **Inline state types** — `RecordOrder.tsx` defines a local `RootState` type instead of importing from `redux/store`, duplicating and drifting from the real store shape.

**Verdict:** Good at the folder/layer level; weaker inside a few heavy components and in the utils/features boundary. **Score: 7/10**

---

## 2. Modularity

### Strengths

- **Feature folders** — Each feature is a module with a clear boundary (e.g. `features/finance`: types, api, hooks, validation, selectors, utils). New domains can be added as new feature folders.
- **Shared UI** — Reusable pieces live in `components/UI reusables/`, `dashboard/`, `visuals/` (e.g. NumberInput, KpiCard, ProgressRing, SpinLoader). Dashboard and form patterns are reused across pages.
- **Router modularity** — `CommonRoutes` centralizes shared routes; AdminRouter and EmployeeRouter only add role-specific routes and delegate to it, reducing duplication.
- **Auth as a module** — Auth is encapsulated in `features/auth/` (storage, API, `useAuth`); App and Layout depend on the public API, not on localStorage or Redux details.

### Gaps

- **Cross-imports** — Pages and components often import from multiple layers (redux actions, selectors, utils, config, feature hooks) in one file. There is no strict “pages only import from features + components” rule, so modules are not fully isolated.
- **IndexedDB as a global util** — `utils/indexedDB.ts` is a large single module (500+ LOC) used by many features. It is well-documented but not split by domain (e.g. requests vs customers vs areas), so changes can have broad impact.
- **Shipment slice size** — The Shipment Redux slice (250+ LOC) holds many concerns (IDs, dates, metrics, round state, customer buckets, prev snapshot). It could be split into sub-slices or domains for easier evolution.

**Verdict:** Modular at the feature and router level; some modules (IndexedDB, Shipment, a few components) are large and could be split. **Score: 7/10**

---

## 3. Scalability

### Strengths

- **Feature-first growth** — New capabilities can be added as new feature folders and routes without touching core app structure. Conventions (RTK Query for data, memoized selectors, docs in INDEX) support consistent scaling.
- **RTK Query** — Caching and request lifecycle are centralized in `trxApi`; adding endpoints and hooks is straightforward. Migration path from ad-hoc axios to RTK Query is documented.
- **Role-based routing** — Admin vs Employee routes are separated; adding a new role would mean a new router and layout branch, which is contained.

### Gaps

- **No code-splitting** — No visible route-based or feature-based lazy loading. As the app grows, the main bundle could become large; CRA supports `React.lazy` and this is not yet used.
- **LocalStorage persistence** — Full Redux state is serialized to localStorage on every change. For large state or frequent updates this can become a performance and storage concern; no strategy for selective or debounced persistence is documented.
- **Single IndexedDB abstraction** — All offline/cache usage goes through one module and DB version. Scaling to many stores or versions would require care to avoid bottlenecks and migration complexity.

**Verdict:** Structure and conventions support scaling; bundle size, persistence strategy, and IndexedDB growth need attention as the app grows. **Score: 6/10**

---

## 4. Naming consistency

### Strengths

- **Components** — PascalCase for components and folders (e.g. `RecordOrder`, `AdminHomePage`, `TodaySnapshot`). Aligns with React conventions.
- **Hooks** — `use*` prefix used consistently (`useAuth`, `useTodayShipmentTotals`, `useAddExpense`, `useSyncOfflineOrders`).
- **Redux** — Selectors use `select*`; actions use verb phrases (`setShipmentDelivered`, `addCustomerWithFilledOrder`). Slice names are clear (UserInfo, Order, Shipment, Defaults).
- **Features** — Feature folders and API files follow a pattern: `features/<domain>/api*.ts`, `hooks/use*.ts`.

### Gaps

- **RootState** — The canonical type lives in `redux/store.ts`, but `RecordOrder.tsx` defines its own `RootState` with a subset of the store. Naming is the same but the type is duplicated and can drift; should import from store.
- **Mixed casing in paths** — `viewCustomers` (camelCase) vs `ViewExpenses` (PascalCase) in SharedPages; `EmployeeComponents` vs `UI reusables` (space). Minor but inconsistent for newcomers.
- **API helpers** — `apiHelpers.ts`, `apiToday.ts`, `apiFinances.ts` suggest “API” but sit in utils next to non-API helpers (money, i18n, indexedDB). Feature-level `apiFinance.ts`, `apiProducts.ts` use similar names; the split (utils vs features) is not obvious from naming alone.

**Verdict:** Generally consistent (components, hooks, Redux); a few duplicated types and path/casing inconsistencies. **Score: 7/10**

---

## 5. Readability

### Strengths

- **TypeScript** — Types are used across redux, features, and many components. Redux state and selectors are typed; feature hooks expose clear contracts.
- **Documentation** — README, docs/ (folder-structure, state-management, technical-debt, INDEX, “How to add documentation”), and feature-level docs (e.g. finance, AdminHomePage, FinanceDashboard) give a clear map and conventions. Architecture conventions (RTK Query, memoized selectors, doc index) are written down.
- **Stable patterns** — Feature hooks return `{ data, loading, error, refetch }`-style objects; selectors are memoized where they return objects/arrays. Repeating these patterns aids scanning.

### Gaps

- **Very long files** — `UpdateCustomer.tsx` (~898 LOC) and `RecordOrder.tsx` (~755 LOC) are hard to read in one pass. Logic is not broken into smaller components or hooks with single responsibilities.
- **Inline types in components** — Large inline type blocks (e.g. in RecordOrder) and local `RootState` definitions reduce readability and reuse; shared types in a feature or types/ would help.
- **Sparse comments** — Many files have little or no JSDoc or inline explanation for non-obvious logic (e.g. offline replay, round progress math). New contributors may need to infer intent.

**Verdict:** Good typing and docs; readability is hurt by a few very large components and duplicated/inline types. **Score: 6/10**

---

## 6. Coupling and cohesion

### Strengths

- **Feature cohesion** — Within a feature, types, API, hooks, and validation hang together (e.g. finance). Features depend on redux and config but not on other features’ internals.
- **Low coupling of auth** — Auth is behind `features/auth/` and `useAuth`; callers do not touch localStorage or Redux user slice directly.
- **Selectors encapsulate shape** — Components use selectors (`selectTodayProgress`, `selectRoundProgress`) rather than reading raw state; shipment shape is hidden behind selectors.

### Gaps

- **Components tightly coupled to Redux and utils** — Many components import Redux actions, multiple selectors, utils (indexedDB, apiHelpers, money, invoicePreview), and config. Changing store shape or moving an API may require edits in several components.
- **Shipment slice as a hub** — Order flow, finance hooks, and sync logic all depend on the Shipment slice. The slice is a single point of change; any refactor of shipment state has wide impact.
- **Utils used as a shared dependency** — `utils/apiHelpers`, `utils/apiFinances`, etc. are used from both components and features. There is no strict “features depend on utils, components depend on features” layering, so dependency direction is mixed.

**Verdict:** Good cohesion inside features and auth; coupling is high around a few components and the Shipment slice, and utils/features boundaries are mixed. **Score: 6/10**

---

## 7. Onboarding friendliness

### Strengths

- **README** — Clear overview, why the system exists, capabilities, tech stack, folder structure, data flow, and links to docs. Local development (env, scripts) and documentation map are in one place.
- **docs/INDEX.md** — Single index of all docs with short descriptions and “How to add documentation,” plus a link to architecture conventions. New contributors can find where to document things.
- **Folder-structure and state-management** — Explain where code lives and how state is split (Redux, feature hooks, IndexedDB, auth). “When in doubt” guidance (pages vs components vs features vs redux) reduces ambiguity.
- **Technical-debt and conventions** — Honest list of completed refactors and standing rules (RTK Query, memoized selectors, doc index). New hires see what’s done and what’s expected.

### Gaps

- **No CONTRIBUTING or “first PR” guide** — Step-by-step (clone, install, env, run, where to make a small change) is not in one place. README has setup but not a “first change” flow.
- **Glossary** — Terms like “round,” “shipment,” “dayId,” “carrying” are domain-specific; a short glossary or link to product overview would help.
- **Single test example** — Only `StartShipment.test.tsx` exists as a reference. New contributors have little guidance on testing patterns (e.g. mocking Redux, hooks, or API).

**Verdict:** Strong README and doc index; onboarding would benefit from a short contributing path and a bit more domain/test guidance. **Score: 7/10**

---

## 8. Testability

### Strengths

- **Hooks and selectors** — Feature hooks and Redux selectors are pure or dependency-injectable; they can be unit-tested without mounting the full app. Memoized selectors are easy to test with a mock state.
- **Centralized API and auth** — API base and auth helpers are in a few places; mocking `API_BASE` or auth in tests is feasible.
- **Tooling** — Jest and React Testing Library are present; CRA test script is available.

### Gaps

- **Very low test coverage** — Only one component test file (`StartShipment.test.tsx`) was found. No tests for feature hooks, selectors, or critical flows (e.g. RecordOrder, offline sync, finance).
- **Large components** — RecordOrder and UpdateCustomer are hard to test in isolation; they mix many concerns and would need heavy mocking. Extracting hooks and smaller components would improve testability.
- **No testing conventions doc** — How to mock Redux, RTK Query, or IndexedDB is not documented; new tests would have to reverse-engineer from the single example.

**Verdict:** Structure is testable (hooks, selectors, clear modules), but tests are almost absent and testing patterns are undocumented. **Score: 4/10**

---

## 9. Maintainability

### Strengths

- **Documented conventions** — Technical-debt and README state how to add features (RTK Query, memoized selectors, docs in INDEX). Conventions reduce ad-hoc decisions.
- **Incremental migration path** — RTK Query is adopted for one flow; other APIs can migrate over time. Same for moving utils API modules into features. No big-bang refactor required.
- **Stable stack** — React 18, TypeScript, Redux Toolkit, React Router v6, CRA. No churn; upgrades are manageable.
- **Error boundary** — Authenticated shell is wrapped; failures are contained and user gets refresh/login options instead of a white screen.

### Gaps

- **Risk concentrated in a few files** — RecordOrder, UpdateCustomer, Shipment reducer, and IndexedDB are critical and large. Changes there are riskier and need extra care.
- **Duplicated types and logic** — Local `RootState` in RecordOrder; possible overlap between utils API and feature API. Duplication increases maintenance cost and drift.
- **Limited automated safety** — With almost no tests, regressions are caught manually. Adding tests for critical paths (order submission, sync, auth) would improve maintainability.

**Verdict:** Conventions and structure support maintainability; a few high-impact files and lack of tests increase risk. **Score: 6/10**

---

## 10. Architectural strengths (summary)

| Strength | Evidence |
|----------|----------|
| **Clear layering** | app → Layout/Router → pages → components; features and redux separated; docs describe boundaries. |
| **Feature-oriented design** | auth, finance, shipments, products, orders, customers, areas, api each have a home; new domains can be added without touching core. |
| **Modern state stack** | Redux Toolkit (createSlice, configureStore), RTK Query for caching, memoized selectors; localStorage hydration documented. |
| **Auth encapsulation** | `features/auth/` with storage, API, and useAuth; App/Layout use public API only. |
| **Single API base** | All calls via `config/api.ts`; localhost handling and env vars in one place. |
| **Router consolidation** | CommonRoutes; no duplicated route definitions. |
| **Documentation** | README, folder-structure, state-management, technical-debt, INDEX, “How to add documentation,” architecture conventions. |
| **Offline-first** | IndexedDB + sync hook; service worker in production; documented. |
| **Error resilience** | ErrorBoundary + AuthAppErrorFallback; login route excluded. |
| **Conventions** | RTK Query for new data-heavy features; createSelector for non-primitive selectors; doc index kept up to date. |

---

## 11. Architectural risks / technical debt

| Risk | Impact | Recommendation |
|------|--------|----------------|
| **Very large components** | RecordOrder (~755 LOC), UpdateCustomer (~898 LOC) mix UI, state, Redux, IndexedDB, and API. Hard to read, test, and change. | Extract subcomponents and custom hooks (e.g. order submission, customer form sections); use shared RootState from store. |
| **Utils vs features API split** | Domain API logic lives in both `utils/` (apiHelpers, apiFinances, apiShipments, etc.) and `features/*/api*.ts`. Unclear ownership and overlap. | Migrate utils API modules into corresponding features or into RTK Query; keep utils for pure helpers (money, i18n, date). |
| **Minimal test coverage** | One component test; no tests for hooks, selectors, or critical flows. Regressions likely. | Add unit tests for selectors and feature hooks first; add integration or component tests for order submission and offline sync; document testing patterns. |
| **Shipment slice size and centrality** | One large slice (250+ LOC) and many dependents; any change has broad impact. | Consider splitting into sub-slices or domains (e.g. shipment meta vs round vs customer lists); or at least document intended boundaries inside the slice. |
| **IndexedDB as a single module** | 500+ LOC, many stores; all offline/cache usage goes through it. | Document migration and versioning; consider splitting by domain (e.g. requests, customers, areas) if it keeps growing. |
| **Duplicate RootState** | RecordOrder defines its own RootState instead of importing from store. | Import `RootState` from `redux/store` everywhere; remove local redefinitions. |
| **No code-splitting** | Single bundle; no route or feature lazy loading. | Introduce `React.lazy` for heavy routes (e.g. FinanceDashboard, RecordOrder) to limit initial bundle size as the app grows. |
| **Full Redux persistence** | Entire state serialized to localStorage on every change. | Consider selective persistence, debouncing, or a persistence layer (e.g. redux-persist with allowlist) if state or update frequency grows. |

---

## 12. Summary scores

| Criterion | Score | Notes |
|-----------|-------|--------|
| Separation of concerns | 7/10 | Good layers; weak in a few large components and utils/features boundary. |
| Modularity | 7/10 | Feature and router modularity good; some large modules (IndexedDB, Shipment). |
| Scalability | 6/10 | Structure supports growth; bundle, persistence, and IndexedDB need strategy. |
| Naming consistency | 7/10 | Solid for components/hooks/Redux; duplicate types and path casing. |
| Readability | 6/10 | Good types and docs; hurt by very long files and inline types. |
| Coupling/cohesion | 6/10 | Good in features and auth; high coupling in key components and Shipment. |
| Onboarding friendliness | 7/10 | Strong README and doc index; missing contributing path and glossary. |
| Testability | 4/10 | Structure is testable; tests and testing docs almost absent. |
| Maintainability | 6/10 | Conventions help; risk in a few critical files and lack of tests. |

**Overall:** The codebase has a **solid foundation** (layers, features, Redux Toolkit, RTK Query, documentation, conventions) and is **production-capable**. The main gaps are **test coverage**, **size and responsibility of a few components**, **split between utils and features for API code**, and **centrality of the Shipment slice**. Addressing these would bring the project closer to strong industry standards without a full rewrite.
