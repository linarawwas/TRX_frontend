# Employee home

## Scope

- Page: `src/pages/EmployeePages/EmployeeHomePage/EmployeeHomePage.tsx`
- Local components: status bar, header, empty state, skeleton, action dock, footer
- **Shared:** `TodaySnapshot`, `RoundSnapshot` (Redux KPIs), `StartShipment` (modal via dock)

## Data flow

1. **User** — `state.user.username`; until present, skeleton in a loading surface.
2. **Shipment** — `selectShipmentMeta` (`shipmentId`, `dayId`): no shipment → empty state + “start shipment”; else `TodaySnapshot` + area link when `dayId` is set.
3. **Offline queue** — `usePendingRequestCount` → IndexedDB `getPendingRequests()`; `createLogger` on read failure; UI shows `emp.home.syncError` when `error` is set.
4. **Modal** — Local `shipmentModalOpen`; `EmployeeActionDock` sets `body` overflow and hosts `StartShipment`.

## Shell layout

- **`employee-home--shell`** — Full-height gradient + **`employee-home__glow`** (decorative).
- **`employee-home__inner`** — Centered column (max 640px).
- **`employee-home__surface`** — White card with emerald accent strip; contains status, header, and main KPI stack.
- **Dock** — Sticky bottom bar with gradient fade; primary (areas) / secondary (start shipment) actions.

## Extending

- Copy: `emp.*` keys in `src/utils/i18n.ts`.
- Do not remove empty-state → `openStartShipment` wiring; it must match dock modal control.

## Migration notes (2026-03)

- **Logging:** `usePendingRequestCount` logs IndexedDB failures via `createLogger("pending-request-count")`.
- **UI:** Shell aligned with `CustomersForArea` / `RecordOrderForCustomer` (gradient page, elevated surface, emerald actions).
- **Types:** `RootState` imported as type-only in `EmployeeHomePage.tsx`.

See: `docs/architecture/refactor-baseline-employee-home.md`.
