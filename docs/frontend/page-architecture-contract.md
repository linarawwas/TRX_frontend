# Page folder architecture contract (TRX)

**Reference implementation:** `src/pages/EmployeePages/EmployeeHomePage/`  
**Status:** Interim — aligns with offline-first TRX and future DAL without locking API shapes prematurely.

## Standard layout

Each feature page SHOULD organize code like this (names may match domain):

```
PageName/
  ├── index.tsx                 # Optional thin re-export (route imports folder)
  ├── PageName.tsx              # Composition only: hook → shell (minimal JSX)
  ├── PageName.css              # Page-scoped styles
  ├── components/               # Presentational UI only (props in, DOM out)
  ├── hooks/                    # Page-specific hooks (orchestration, subscriptions)
  ├── state/                    # Redux / selector bindings (no components)
  ├── services/                 # I/O boundaries (DAL-ready; no JSX)
  ├── adapters/                 # Normalize raw transport/storage → view types
  ├── utils/                    # Pure helpers (guards, formatters)
  ├── types/                    # TypeScript types for the page domain
  ├── constants/                # Static config, log scopes, magic strings
  ├── features/                 # Optional named workflows when hooks grow large
  ├── test-utils/               # Fixtures & store factories (NOT `*.test.*` — see below)
  └── __tests__/                # Only `*.test.ts` / `*.test.tsx` (Jest picks up all .ts/.tsx here)
```

## Testing contract

| Layer | What to test | How |
|-------|----------------|-----|
| **adapters** | Normalization, edge cases | Unit tests, no mocks |
| **utils / guards** | Pure logic | Unit tests |
| **services** | Success + error paths | Mock `fetch` / IndexedDB / module boundary at **one** level |
| **state** | Selectors | Immutable `RootState` fixtures (`test-utils/` recommended) |
| **hooks** | View model / subscriptions | `renderHook`, `waitFor`, scoped mocks |
| **components (shell)** | Major UI branches | RTL + `MemoryRouter` when `Link` is used |
| **PageName.tsx** | Optional smoke | Usually covered by shell + hook tests |

**Fixture location:** Put `makeXRootState` and similar helpers in **`test-utils/`** beside the page, **not** loose `__tests__/helper.ts`, because Create React App’s Jest config may execute every `*.ts` under `__tests__/` as a suite.

**Coverage goal:** Every **I/O boundary** (service) and every **user-visible branch** of the shell should have at least one test; pure layers should be fully covered.

## Commit contract

Work on page modules and related docs **must** be committed with **clear, comprehensive** messages—aligned with `Frontend_contract.md` Part 8 and the blueprint.

| Rule | Detail |
|------|--------|
| **Format** | Conventional Commits: `type(scope): imperative subject` (`feat`, `fix`, `refactor`, `docs`, `test`, …). Scope = page slug or area (`employee-home`, `view-customers`, `router`, `docs`). |
| **Subject** | One line, ~72 characters, imperative, no trailing period. |
| **Body** | For non-trivial changes: blank line, then bullets for **what** (concrete files/areas), **why**, **risk/validation** (offline, routes), optional **follow-ups**. |
| **Granularity** | Prefer **one logical change per commit**; split documentation, code moves, and tests when the diff is large. |
| **Forbidden** | Vague subjects (“update”, “fix stuff”, “WIP”) or huge unrelated mixes in a single commit. |
| **Completion** | Do not treat work as finished while meaningful changes remain **uncommitted**; agents should commit or supply ready-to-paste messages per commit. |

See **[frontend project blueprint §5](../architecture/frontend-project-blueprint.md#5-commit-conventions-page--architecture-work)** for examples and overlap with repo-wide rules.

## Layer rules

| Layer | Responsibility | Must not |
|-------|------------------|----------|
| **components** | Layout, a11y, styling, child composition | Call `fetch`, touch IndexedDB, embed business rules |
| **hooks** | Wire services + state + local UI state into a view model | Render markup (except tiny dev-only) |
| **state** | Selectors, optional thin Redux thunks scoped to page | Import presentational components |
| **services** | Async/sync ports to data: DAL, IndexedDB wrappers, RTK endpoints | Contain React hooks or JSX |
| **adapters** | Map API/storage DTOs → stable UI shapes | Perform network I/O |
| **PageName.tsx** | `const vm = useX(); return <Shell {...vm} />` | Inline data fetching |
| **features** | Cross-cutting orchestration when a hook exceeds clarity | Replace hooks entirely without reason |

## DAL readiness

- Services expose **small, named functions** (e.g. `readPendingQueueSnapshot`) that can be swapped for `dal.*` later.
- Adapters keep **components ignorant** of wire format (`adaptPendingRequestsToCount`).
- **Redux** remains legitimate global source for shipment/auth until DAL subsumes those reads; bind through `state/` selectors.

## Employee Home mapping

| Concern | Location |
|---------|-----------|
| View model | `hooks/useEmployeeHomeViewModel.ts` |
| Offline queue read | `services/pendingQueueRead.service.ts` + `adapters/pendingQueueAdapter.ts` |
| Redux user + shipment meta | `state/employeeHomeState.ts` |
| Shell markup | `components/EmployeeHomeShell.tsx` |
| Route entry | `index.tsx` + `EmployeeRouter` imports the folder |

Shared widgets (`TodaySnapshot`, `RoundSnapshot`, `StartShipment`) stay in their existing packages; the page only composes them.

## Related

- [Migration guide](./migration-page-contract.md)
- [Employee home feature doc](./employee-home.md)
- [Project structure blueprint (tests, commits, docs)](../architecture/frontend-project-blueprint.md)
