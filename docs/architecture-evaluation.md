# TRX Frontend — Architecture Evaluation

Senior-level evaluation of the codebase against industry standards. Intended for maintainers and new contributors.

---

## Red flags for senior review

If a senior frontend developer were to review this repository, these are the things that would most likely **alarm them** or stand out as **red flags** in a first pass:

| Red flag | What they see | Why it matters |
|----------|----------------|----------------|
| **Improving but still selective automated coverage** | The repo now has passing tests for selectors, shipment reducer, offline sync, auth storage/API/hook flows, finance mutation hooks, the `RecordOrder` / `UpdateCustomer` controller hooks, new page-level wiring tests for both decomposed containers, `StartShipment`, and a first Playwright E2E layer for the highest-risk journeys, plus `docs/testing.md`. | This is now a credible regression net around the highest-risk flows, but it is still selective. Remaining gaps are mainly multi-screen integration coverage and a few deeper edge branches rather than complete absence of tests. |
| **Oversized smart components** | This was visible in `UpdateCustomer.tsx` (~898 LOC) and `RecordOrder.tsx` (~755 LOC). Controller extraction is done, and the large render sections are now split into presentational files, but there are still other heavy files in the app and these flows still deserve careful review because they remain business-critical. | This red flag is materially smaller than before: page composition is clearer and testing is easier. The remaining concern is not “monolithic JSX everywhere” but “critical flows still concentrated in a few important files and hooks.” |
| **Phase 1 type shortcuts were real debt** | `RecordOrder.tsx` previously duplicated `RootState`; `Shipment/reducer.ts` used `any`; `redux/store.ts` relied on `@ts-expect-error` for middleware typing. These were removed in the Phase 1 pass. | Important signal: the repo had core typing shortcuts in central state code. They are now fixed, but this was valid architectural debt and similar shortcuts should be watched for going forward. |
| **API ownership is improved but not fully finished** | Finance API ownership now lives under `features/finance`, and the `orders-today` read flow was moved into `trxApi`, but other API-oriented utilities still exist in `utils/` (`apiHelpers.ts`, `apiShipments.ts`, `distributorApi.ts`, etc.). | The rule is clearer now, but incremental migration still remains for the rest of the overlapping utility APIs. |
| **Console usage is reduced but not eliminated** | A shared `src/utils/logger.ts` now handles startup/offline/shipment-start status logging and keeps `debug`/`info` quiet in production by default, but some raw console usage remains elsewhere. | This is no longer an uncontrolled pattern in the highest-noise paths, but the cleanup is still partial across the wider codebase. |
| **First-pass code-splitting only** | The heaviest non-core admin/shared routes now lazy-load, but the shell and many routes remain eager by design. | This is a good first pass, not the end state. Bundle discipline still depends on measuring growth and expanding lazy loading only where it pays off. |
| **Shipment slice as a hub** | `Shipment` still centralizes meta, totals, previous snapshot data, customer buckets, and round baselines, but Phase 3.2 now documents those regions explicitly, adds boundary selectors, and strengthens reducer coverage around them. | The risk is lower than before because the slice is easier to reason about without changing store shape, but it is still a central dependency and a future split would require care. |
| **Large IndexedDB surface area** | `utils/indexedDB.ts` is still a single 500+ LOC module, even though schema/versioning guidance is now documented and maintainers have a clearer migration policy. | The risk is lower than before, but offline storage still has a broad blast radius and deserves extra care when schema changes land. |

**Summary:** The most alarming points are now **selective rather than absent test coverage**, **remaining oversized components/render trees**, **split/duplicated API layer**, and **centralized offline/storage infrastructure**. The earlier Redux typing issues, lack of browser E2E coverage, and lack of route-level lazy loading are no longer top red flags.

---

## Order of operations for fixing issues

Fixing things in the right order reduces rework and risk: later steps rely on the safety and clarity from earlier ones. Below is a recommended sequence.

### Phase 1 — Safety net and type correctness

**Status:** Completed on 2026-03-13.

**Goal:** Make refactors safe and remove type shortcuts so the rest of the work doesn’t introduce hidden bugs.

| Step | Action | Why this order |
|------|--------|----------------|
| 1.1 | **Add a minimal test suite** — Completed with selector tests (`src/redux/selectors/selectors.test.ts`), hook tests for `useTodayShipmentTotals` and `useAddExpense`, and a new [testing guide](testing.md). | Without tests, refactoring large components or Redux is dangerous. Selectors and hooks were the fastest way to get a safety net and they now protect later work. |
| 1.2 | **Fix Redux types** — Completed by removing `any` from `Shipment/reducer.ts`, typing customer-order payloads as ids, and keeping `RootState` centralized in `redux/store`. | Type safety in the core store now catches drift when shipment/order code changes. |
| 1.3 | **Resolve the store `@ts-expect-error`** — Completed by aligning `redux` with the Toolkit stack (`redux@^5.0.1`) so `configureStore` middleware typing compiles cleanly without suppression. | Removes a visible “we silenced the compiler” red flag and leaves the store configuration explicit and type-safe. |

**Outcome:** Tests exist for the most stable, high-value code; Redux and RecordOrder use a single, typed source of truth. You can refactor with less fear.

---

### Phase 2 — Clear boundaries (no big structural refactors yet)

**Status:** Completed on 2026-03-13.

**Goal:** Decide where new code lives and clean up noise so future work follows a single pattern.

| Step | Action | Why this order |
|------|--------|----------------|
| 2.1 | **Consolidate API ownership** — Completed by moving finance server-state calls from `src/utils/apiFinances.ts` into `src/features/finance/apiFinance.ts`, deleting the old util module, and migrating the `orders-today` read flow from `src/utils/apiToday.ts` into `src/features/api/trxApi.ts`. | There is now a concrete code pattern for both destinations: feature-local API modules for domain logic and RTK Query for shared read-heavy flows. |
| 2.2 | **Tame console usage** — Completed for the highest-noise paths by introducing `src/utils/logger.ts` and applying it to `useSyncOfflineOrders.ts`, `StartShipment.tsx`, `main.tsx`, and IndexedDB logging helpers. | Production-path status logging is now controlled in the startup/offline flows that were previously the noisiest, without requiring a large refactor. |

**Outcome:** New features have a clear API home; production logs are under control.

---

### Phase 3 — Reduce blast radius (make big components and slice manageable)

**Status:** Phase 3.1 completed on 2026-03-14. Phase 3.2 boundary-hardening pass completed on 2026-03-14.

**Goal:** Shrink the largest components and clarify the Shipment slice so changes are local and testable.

| Step | Action | Why this order |
|------|--------|----------------|
| 3.1 | **Break down the largest components** — Completed for **RecordOrder** and **UpdateCustomer**. Their controller hooks now own behavior, the page files are mostly composition, and focused presentational subcomponents handle steppers, LBP input, modal trees, hero/actions, edit forms, and invoice panels. New page-level tests cover the main UI wiring. | This reduced the render blast radius without moving business logic back into the UI. Future changes can target smaller files and keep behavior coverage in hook tests plus view wiring tests. |
| 3.2 | **Shipment slice** — Completed as a safe first pass without changing store shape. The reducer/types now describe internal regions explicitly, boundary selectors cover meta/totals/customer buckets/previous snapshot access, and reducer tests are organized around those regions and falsy-value restore behavior. | This reduces the blast radius now while keeping a later sub-slice split optional. The safer next step is to continue migrating remaining raw readers behind selectors before deciding whether a true store split is worth the churn. |

**Outcome:** Critical flows live in smaller, testable units; Shipment changes are safer and more localized.

---

### Phase 4 — Scale and performance (when needed)

**Goal:** Address bundle size and IndexedDB growth when they become real constraints.

| Step | Action | Why this order |
|------|--------|----------------|
| 4.1 | **Code-splitting** — Completed as a balanced first pass. `AdminRouter` and `CommonRoutes` now lazy-load the heaviest non-core admin/shared screens behind a shared suspense fallback, while login/bootstrap and the employee start path remain eager. | This captured real startup wins without destabilizing the app shell or modal-driven shipment flow. |
| 4.2 | **IndexedDB** — Completed as documentation-first hardening. `src/utils/readme.md` now defines version bump rules, upgrade style, additive vs breaking schema policy, and a maintainer checklist tied to `tests/e2e/support/idb.ts`. | This lowers the risk of future offline-schema regressions before any larger IndexedDB refactor or split is attempted. |

**Outcome:** Load time and offline layer are ready for growth without a single huge module bearing all the weight.

---

### Summary table

| Phase | Focus | Typical duration |
|-------|--------|-------------------|
| **1** | Tests (selectors, 1–2 hooks), Redux types, store ts-error | 1–2 sprints |
| **2** | API ownership rule + one migration, console cleanup | ~1 sprint |
| **3** | Extract hooks/subcomponents from RecordOrder & UpdateCustomer; Shipment slice tests or split | 2–3 sprints |
| **4** | Balanced route lazy-loading and IndexedDB migration guidance | Completed |

**Rule of thumb:** Do Phase 1 before any large refactor. Do Phase 3.1 (large components) before investing in Shipment slice splits. Do Phase 4 when metrics or pain justify it, not as the first priority.

---

## 1. Separation of concerns

### Strengths

- **Clear layer boundaries** — App bootstrap (`app/`), layout/routing (`Layout/`, `Router/`), pages, components, features, redux, and infrastructure are separated. Documentation (folder-structure, state-management) states where new code belongs.
- **Feature modules** — Domain logic lives in `src/features/` (auth, finance, shipments, products, orders, customers, areas, api). Features own types, API clients, hooks, and sometimes selectors/validation, so UI is not mixed with data-fetching details.
- **Redux for cross-cutting state only** — User, Order, Shipment, and Defaults are global; feature hooks own server state and derived data (e.g. `useTodayShipmentTotals`, `useAddExpense`).
- **Single API base** — All HTTP calls go through `src/config/api.ts`; no scattered env reads or hardcoded hosts.

### Gaps

- **Utils vs features** — The split is smaller than before: `apiToday.ts` and `apiFinances.ts` have been removed in favor of `trxApi` and `features/finance/apiFinance.ts`, but `src/utils/` still contains API-oriented modules such as `apiHelpers.ts`, `apiShipments.ts`, and `distributorApi.ts`. Ownership is clearer, but the migration is not finished.
- **Large components still exist elsewhere** — `RecordOrder.tsx` and `UpdateCustomer.tsx` have been reduced into composer-style files, but the broader app still contains some large, cross-layer components and utility hubs that deserve the same treatment over time.
- **Mixed UI orchestration in critical flows** — The heaviest logic has moved into hooks, but the remaining critical flows still depend on several collaborators (Redux, IndexedDB, API helpers, toasts, navigation), so changes should continue to be made with tests in place.

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
- **Shipment slice size** — The Shipment Redux slice still holds many concerns, but its internal boundaries are now explicit and there is a selector facade over the main regions. A future split is possible, but no longer the only way to make the code safer.

**Verdict:** Modular at the feature and router level; some modules (IndexedDB, Shipment, a few components) are large and could be split. **Score: 7/10**

---

## 3. Scalability

### Strengths

- **Feature-first growth** — New capabilities can be added as new feature folders and routes without touching core app structure. Conventions (RTK Query for data, memoized selectors, docs in INDEX) support consistent scaling.
- **RTK Query** — Caching and request lifecycle are centralized in `trxApi`; adding endpoints and hooks is straightforward. Migration path from ad-hoc axios to RTK Query is documented.
- **Role-based routing** — Admin vs Employee routes are separated; adding a new role would mean a new router and layout branch, which is contained.

### Gaps

- **Selective code-splitting only** — The highest-value non-core admin/shared routes now lazy-load through `AdminRouter` and `CommonRoutes`, and `FinanceDashboard` is already lazy-loaded inside `AdminHomePage`. The app shell, login/bootstrap, and other routes remain eager by design. As the app grows, more route or modal-level splitting may still be needed, but the project no longer has zero bundle-splitting strategy.
- **LocalStorage persistence** — Full Redux state is serialized to localStorage on every change. For large state or frequent updates this can become a performance and storage concern; no strategy for selective or debounced persistence is documented.
- **Single IndexedDB abstraction** — All offline/cache usage goes through one module and DB version. Scaling to many stores or versions would require care to avoid bottlenecks and migration complexity.

**Verdict:** Structure and conventions support scaling; initial bundle pressure is now improved, but persistence strategy and IndexedDB growth still need attention as the app grows. **Score: 7/10**

---

## 4. Naming consistency

### Strengths

- **Components** — PascalCase for components and folders (e.g. `RecordOrder`, `AdminHomePage`, `TodaySnapshot`). Aligns with React conventions.
- **Hooks** — `use*` prefix used consistently (`useAuth`, `useTodayShipmentTotals`, `useAddExpense`, `useSyncOfflineOrders`).
- **Redux** — Selectors use `select*`; actions use verb phrases (`setShipmentDelivered`, `addCustomerWithFilledOrder`). Slice names are clear (UserInfo, Order, Shipment, Defaults).
- **Features** — Feature folders and API files follow a pattern: `features/<domain>/api*.ts`, `hooks/use*.ts`.

### Gaps

- **Mixed casing in paths** — `viewCustomers` (camelCase) vs `ViewExpenses` (PascalCase) in SharedPages; `EmployeeComponents` vs `UI reusables` (space). Minor but inconsistent for newcomers.
- **API helpers** — `apiToday.ts` and `apiFinances.ts` were good examples of the old split and have now been migrated away, but `apiHelpers.ts` and other API-oriented utilities still sit in `utils/` next to non-API helpers. The naming and ownership story is improved, not fully finished.

**Verdict:** Generally consistent (components, hooks, Redux); a few duplicated types and path/casing inconsistencies. **Score: 7/10**

---

## 5. Readability

### Strengths

- **TypeScript** — Types are used across redux, features, and many components. Redux state and selectors are typed; feature hooks expose clear contracts.
- **Documentation** — README, docs/ (folder-structure, state-management, technical-debt, INDEX, “How to add documentation”), and feature-level docs (e.g. finance, AdminHomePage, FinanceDashboard) give a clear map and conventions. Architecture conventions (RTK Query, memoized selectors, doc index) are written down.
- **Stable patterns** — Feature hooks return `{ data, loading, error, refetch }`-style objects; selectors are memoized where they return objects/arrays. Repeating these patterns aids scanning.

### Gaps

- **Some high-risk flows still span multiple files** — `RecordOrder` and `UpdateCustomer` are much easier to read now, but contributors still need to understand both the page composer and its controller hook for meaningful changes.
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
- **Shipment slice as a hub** — Order flow, finance hooks, and sync logic still depend on the Shipment slice, but the main state regions are now documented and exposed through selectors. Refactors are safer than before, though broad-impact changes still need care.
- **Utils used as a shared dependency** — `utils/apiHelpers`, `utils/apiShipments`, and other utility modules are still imported from both components and features. There is no strict “features depend on utils, components depend on features” layering, so dependency direction is mixed.

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
- **Testing examples are still concentrated** — The repo now has several good examples (`StartShipment`, `RecordOrder`, `UpdateCustomer`, selector and hook tests), but higher-level integration patterns are still limited.

**Verdict:** Strong README and doc index; onboarding would benefit from a short contributing path and a bit more domain/test guidance. **Score: 7/10**

---

## 8. Testability

### Strengths

- **Hooks and selectors** — Feature hooks and Redux selectors are pure or dependency-injectable; they can be unit-tested without mounting the full app. Memoized selectors are easy to test with a mock state.
- **Centralized API and auth** — API base and auth helpers are in a few places; mocking `API_BASE` or auth in tests is feasible.
- **Tooling** — Jest, React Testing Library, and Playwright are present; the repo now has unit, component/page wiring, and mocked browser E2E coverage for the most critical journeys.

### Gaps

- **Still selective coverage** — The repo now has strong unit coverage around selectors, reducer logic, auth, offline sync, finance hooks, the `RecordOrder` / `UpdateCustomer` controller + page wiring flows, and a first mocked Playwright layer for auth bootstrap, shipment start, offline replay, finance create flow, orders-today, and update-customer. The remaining gap is broader journey coverage, not complete absence of higher-level tests.
- **Critical flows still require mocks** — The current E2E strategy is intentionally deterministic and backend-independent. That is the right first layer, but some future confidence work may still require a small number of deeper environment-backed integration paths if the app grows more complex.
- **Testing conventions are better but still not exhaustive** — `docs/testing.md` now explains the unit/component baseline and the mocked browser E2E layer, including how browser state and network interception are handled. More examples for RTK Query- and IndexedDB-heavy cases would still help future contributors.

**Verdict:** Structure is testable and now has a credible regression net across unit, component, and first-pass browser E2E coverage. The main gap is breadth, not missing test infrastructure. **Score: 7/10**

---

## 9. Maintainability

### Strengths

- **Documented conventions** — Technical-debt and README state how to add features (RTK Query, memoized selectors, docs in INDEX). Conventions reduce ad-hoc decisions.
- **Incremental migration path** — RTK Query is adopted for one flow; other APIs can migrate over time. Same for moving utils API modules into features. No big-bang refactor required.
- **Stable stack** — React 18, TypeScript, Redux Toolkit, React Router v6, CRA. No churn; upgrades are manageable.
- **Error boundary** — Authenticated shell is wrapped; failures are contained and user gets refresh/login options instead of a white screen.

### Gaps

- **Risk concentrated in a few modules** — The risk in `RecordOrder` and `UpdateCustomer` has gone down after decomposition, but `Shipment` state and IndexedDB remain central pieces where changes still have broad impact.
- **Duplicated ownership patterns** — Possible overlap between utils API and feature API still exists. Duplication increases maintenance cost and drift.
- **Automated safety is still selective** — Critical-path coverage is now materially better, including mocked browser E2E, but maintainability still depends on continuing to add tests when new high-impact flows are introduced.

**Verdict:** Conventions and structure support maintainability much better than before; the main remaining risk is concentration in a few high-impact flows and central offline/state modules, not missing project hygiene. **Score: 7/10**

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
| **Critical flow complexity** | `RecordOrder` and `UpdateCustomer` are now decomposed, but their controller hooks and collaborating infrastructure still make them important, high-impact flows. | Keep adding targeted integration coverage and apply the same decomposition pattern to other heavy UI containers when touched. |
| **Utils vs features API split** | Domain API logic still lives in both `utils/` (apiHelpers, apiShipments, distributorApi, etc.) and `features/*/api*.ts`, even though finance and `orders-today` were migrated in Phase 2. | Continue migrating the remaining utils API modules into corresponding features or into RTK Query; keep utils for pure helpers (money, i18n, date). |
| **Selective test coverage** | High-value unit, component/page wiring, and first-pass Playwright journey tests now exist, but they still focus on the most business-critical flows rather than broad app-wide coverage. | Keep the current fast baseline, extend browser coverage to the next highest-risk journeys, and add deeper environment-backed integration only where mocks stop being sufficient. |
| **Shipment slice size and centrality** | One large slice and many dependents; any change still has broad impact, even after Phase 3.2 boundary hardening. | Keep moving remaining raw readers behind selectors. Split into sub-slices only if ongoing changes show that the documented regions are still too coupled. |
| **IndexedDB as a single module** | 500+ LOC, many stores; all offline/cache usage goes through it. | Document migration and versioning; consider splitting by domain (e.g. requests, customers, areas) if it keeps growing. |
| **Partial code-splitting only** | The first balanced route-level lazy-loading pass is done, but not every heavy screen is deferred and the main shell remains eager. | Measure bundle output periodically and expand lazy loading only where startup or navigation metrics justify the extra complexity. |
| **Full Redux persistence** | Entire state serialized to localStorage on every change. | Consider selective persistence, debouncing, or a persistence layer (e.g. redux-persist with allowlist) if state or update frequency grows. |

---

## 12. Summary scores

| Criterion | Score | Notes |
|-----------|-------|--------|
| Separation of concerns | 7/10 | Good layers; weak in a few large components and utils/features boundary. |
| Modularity | 7/10 | Feature and router modularity good; some large modules (IndexedDB, Shipment). |
| Scalability | 7/10 | Structure supports growth; initial lazy loading is in place, but persistence and IndexedDB still need strategy. |
| Naming consistency | 7/10 | Solid for components/hooks/Redux; duplicate types and path casing. |
| Readability | 6/10 | Good types and docs; hurt by very long files and inline types. |
| Coupling/cohesion | 6/10 | Good in features and auth; high coupling in key components and Shipment. |
| Onboarding friendliness | 7/10 | Strong README and doc index; missing contributing path and glossary. |
| Testability | 7/10 | Structure is testable and now backed by unit, component, and critical mocked E2E coverage. |
| Maintainability | 7/10 | Conventions and coverage help more now; risk remains in a few critical flows and central offline/state modules. |

**Overall:** The codebase has a **solid and improving foundation** (layers, features, Redux Toolkit, RTK Query, documentation, conventions, critical-path browser E2E, and first-pass route lazy loading) and is **production-capable**. The main gaps are now **coverage breadth rather than total absence**, **size and responsibility of a few components and central offline modules**, **split between utils and features for API code**, and **centrality of the Shipment slice**. Addressing those would move the project materially closer to strong industry standards without a rewrite.
