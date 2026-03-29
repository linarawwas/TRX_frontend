# TRX frontend — project structure blueprint

**Purpose:** Generalize the [Employee Home page contract](../frontend/page-architecture-contract.md) into a **whole-repo map**: where code lives, how to test it, how to document it, and how to commit changes.

**Reference implementation:** `src/pages/EmployeePages/EmployeeHomePage/`

---

## 1. Repository map (`src/`)

| Area | Role | Testing |
|------|------|---------|
| **`src/app/`** | React root, `App.tsx`, providers | Smoke / E2E |
| **`src/Router/`** | Route tables, lazy imports | Light unit or E2E |
| **`src/Layout/`** | Authenticated chrome | RTL snapshot optional |
| **`src/pages/`** | Route-level modules | Page `__tests__/` + E2E for flows |
| **`src/components/`** | Shared / domain UI building blocks | Colocated `*.test.tsx` or `__tests__/` |
| **`src/features/`** | Domain APIs, controller hooks, feature utils | Hook + API unit tests |
| **`src/redux/`** | Global store, slices, shared selectors | Reducer + selector tests |
| **`src/hooks/`** | Cross-cutting React hooks (when not page-owned) | `*.test.ts(x)` |
| **`src/utils/`** | Generic infra (IndexedDB helpers, i18n, logger) | Pure fn tests |
| **`src/config/`** | Env, API base | Config tests rare |
| **`src/features/api/`** | RTK Query `trxApi` | Endpoint mocks / integration |
| **`tests/e2e/`** | Playwright | Critical user journeys |

**Rule of thumb:** If a screen owns orchestration and DAL boundaries, prefer a **page module** (`pages/.../PageName/`) with `services/`, `hooks/`, and `__tests__/`. If logic is shared across screens, keep it in **`features/`** and keep the page thin.

---

## 2. Page module contract (full folder)

Apply under `src/pages/<Area>/<PageName>/` when the page has non-trivial data and state:

```
PageName/
  ├── index.tsx                 # Default export for router (optional)
  ├── PageName.tsx              # Composition: view-model hook → shell
  ├── PageName.css
  ├── components/               # Presentational only (incl. *Shell.tsx)
  ├── hooks/                    # Page view model + subscriptions
  ├── state/                    # Redux selector bindings for this page
  ├── services/                 # DAL-ready I/O (no JSX)
  ├── adapters/                 # Wire format → UI types
  ├── utils/                    # Pure guards / formatters
  ├── types/
  ├── constants/
  ├── features/                 # Optional workflows / public type exports
  ├── test-utils/               # Shared fixtures (NOT named *.test.* — Jest would pick them up)
  └── __tests__/                # *.test.ts(x) only
```

**Thin route wrappers** (e.g. `pages/AdminPages/Distributors/DistributorsPage.tsx` re-exporting a component) stay minimal until the feature migrates into a full page module.

---

## 3. Testing strategy (required layers)

| Priority | Target | Examples |
|----------|--------|----------|
| **P0** | Pure **adapters** + **utils** + **guards** | `pendingQueueAdapter`, `employeeHomeGuards` |
| **P1** | **Services** (mock storage / HTTP at boundary) | `readPendingQueueSnapshot` with mocked `getPendingRequests` |
| **P2** | **Selectors** (`state/`) | `selectEmployeeHomeUsername` |
| **P3** | **Hooks** (`renderHook` + mocks) | `useEmployeeHomeSyncQueue`, `useEmployeeHomeViewModel` |
| **P4** | **Shell** (`@testing-library/react` + `MemoryRouter` if needed) | `EmployeeHomeShell` branches |
| **P5** | **E2E** | Login → employee home → start shipment |

**Do not** put non-test modules inside `__tests__/` with extensions `.ts`/`.tsx` that Jest treats as suites (Create React App matches `__tests__/**/*`). Use **`test-utils/`** for factories.

**Environment note:** If `npm test` fails with `ERR_REQUIRE_ESM` / `http-proxy-agent` / `jsdom`, fix the Jest/Node dependency chain (see `package.json` overrides and CRA issues). Tests are still the **source of truth** for intent; run them once the runner is green.

---

## 4. Documentation checklist (per page or feature)

1. **`docs/frontend/<feature>.md`** or **`docs/pages/<Page>.md`** — data flow, extension points.
2. **`docs/architecture/refactor-baseline-<slug>.md`** — Phase-0 map before large refactors.
3. **`docs/INDEX.md`** — add row linking new canonical docs.
4. **Colocated `readme.md`** under the page folder — quick pointer to docs above.

Cross-link **[page architecture contract](../frontend/page-architecture-contract.md)** and this blueprint when introducing a new page module.

---

## 5. Commit conventions (page / architecture work)

Commits are part of the **contract**: they must be **comprehensive** (reviewer can understand the diff from the message) and **clear** (accurate type/scope/subject). This matches **`Frontend_contract.md` Part 8** and the [page architecture commit contract](../frontend/page-architecture-contract.md#commit-contract).

### 5.1 Subject line

- **Conventional Commits:** `type(scope): imperative description`
- **Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci` (see Conventional Commits spec).
- **Scope:** Prefer a **page slug** (`employee-home`, `view-customers`) or **subsystem** (`router`, `redux`, `docs`, `frontend`).
- **Style:** Imperative mood (“add”, “extract”, “align”), **~50–72 characters**, **no trailing period**.

Examples:

- `feat(employee-home): add pending queue service tests`
- `docs(frontend): add project structure blueprint`
- `test(employee-home): cover view model and shell`
- `refactor(pages): align view customers with page contract`

### 5.2 Body (required for non-trivial changes)

After a blank line below the subject, include bullets or short paragraphs for:

1. **What** — Concrete areas (e.g. “new `services/companyCustomersRead.service.ts`, `CustomersShell`, router import path”).
2. **Why** — Contract compliance, bug, performance, DAL boundary, etc.
3. **Risk / how to verify** — Offline behavior, critical routes, manual QA notes.
4. **Follow-ups** — Only if intentionally deferred.

Avoid bodies that only repeat the subject or say “various improvements.”

### 5.3 Granularity

- **One logical change per commit** when practical—for example: (1) documentation and contract text, (2) structural code move, (3) tests.
- Avoid mixing **unrelated** pages, unrelated refactors, or large doc rewrites with production logic in a single commit unless the change is intentionally atomic and small.

### 5.4 Breaking changes

If the change breaks callers or public routes, add a footer: **`BREAKING CHANGE:`** plus migration notes.

### 5.5 Completion criterion

Meaningful work is **not** considered complete if it remains only in the working tree: **commit** with messages that satisfy this section, or (in agent workflows) provide **copy-paste-ready** messages for each commit in apply order.

---

## 6. Alignment with DAL (future)

- **Services** today wrap IndexedDB / `rtkJson` / feature APIs; tomorrow swap bodies for `dal.*` calls **without** changing hook or adapter signatures where possible.
- **Adapters** absorb DTO changes so **components** stay stable.
- **Redux** remains valid until DAL owns session/shipment; **state/** is the single place to swap selector sources later.

---

## 7. Related documents

| Doc | Use |
|-----|-----|
| [page-architecture-contract.md](../frontend/page-architecture-contract.md) | Layer rules + Employee Home mapping |
| [migration-page-contract.md](../frontend/migration-page-contract.md) | Steps to migrate other pages |
| [frontend-architecture.md](../frontend-architecture.md) | Data access + folder responsibilities |
| [folder-structure.md](../folder-structure.md) | High-level `src/` tour |
