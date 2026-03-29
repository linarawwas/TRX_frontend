# Employee home

## Scope

- **Route entry:** `src/pages/EmployeePages/EmployeeHomePage/index.tsx` (re-exports default)
- **Composition:** `EmployeeHomePage.tsx` → `useEmployeeHomeViewModel` → `EmployeeHomeShell`
- **Presentational:** `components/` (`EmployeeHomeShell`, status bar, header, empty state, skeleton, action dock, footer)
- **Shared:** `TodaySnapshot`, `RoundSnapshot` (Redux KPIs), `StartShipment` (modal via dock)

## Architecture (contract)

| Layer | Files |
|-------|--------|
| Types | `types/employeeHome.types.ts` — `EmployeeHomeViewModel` |
| State | `state/employeeHomeState.ts` — username + `selectShipmentMeta` |
| Services | `services/pendingQueueRead.service.ts` — `readPendingQueueSnapshot()` (DAL-ready) |
| Adapters | `adapters/pendingQueueAdapter.ts` — queue length normalization |
| Hooks | `useEmployeeHomeViewModel.ts`, `useEmployeeHomeSyncQueue.ts` |
| Features | `features/index.ts` — re-exports types; extend for workflows later |

See **[page architecture contract](./page-architecture-contract.md)** and **[migration guide](./migration-page-contract.md)**.

## Data flow

1. **User** — `selectEmployeeHomeUsername`; until truthy, skeleton in loading surface.
2. **Shipment** — `selectEmployeeHomeShipmentContext` (`shipmentId`, `dayId`): no shipment → empty state + “start shipment”; else `TodaySnapshot` + area link when `dayId` is set.
3. **Offline queue** — `useEmployeeHomeSyncQueue` → `readPendingQueueSnapshot()` → IndexedDB via `getPendingRequests()`; refreshes on mount and `window` `online`; UI shows `emp.home.syncError` when `syncError` is set.
4. **Connectivity** — `useNavigatorOnline()` (shared hook; browser events only).
5. **Modal** — Local `shipmentModalOpen` in view model; `EmployeeActionDock` controls `body` overflow and hosts `StartShipment`.

## Shell layout

Unchanged: `employee-home--shell`, `employee-home__glow`, `employee-home__inner`, `employee-home__surface`, sticky dock.

## Extending

- Copy: `emp.*` keys in `src/utils/i18n.ts`.
- Preserve empty-state → `openStartShipment` wiring and dock modal control.
- New I/O: add a **service** + optional **adapter**, then extend the view model hook — not the shell.

## Historical note

- The shared hook `src/hooks/usePendingRequestCount.ts` remains for other callers; Employee Home uses the page-local sync queue hook backed by `readPendingQueueSnapshot` to satisfy the services boundary.

See: `docs/architecture/refactor-baseline-employee-home.md`.
