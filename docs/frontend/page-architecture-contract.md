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
