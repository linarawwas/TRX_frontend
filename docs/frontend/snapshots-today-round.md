# Today / Round KPI snapshots

## Scope

- **Wrappers:** `TodaySnapshot.tsx`, `RoundSnapshot.tsx` — Redux selectors + `ProgressSnapshot`.
- **Shared UI:** `ProgressSnapshot.tsx`, `TodaySnapshot.css` (imported by `ProgressSnapshot`).
- **Embedded:** `RoundsHistory` (today panel only) — `fetchShipmentRounds` when `shipmentId` + token exist.

## Data flow

- **Today:** `selectTodayProgress`, `selectShipmentMeta` → progress bar + KPI strip; optional `RoundsHistory` child.
- **Round:** `selectRoundProgress` → same `ProgressSnapshot` props; empty state when no active round.
- **Rounds list:** HTTP via `features/shipments/api` (not RTK Query in this slice).

## Visual system

- **`snap-card--enterprise`** — Elevated card, emerald top accent, refined typography and KPI grid.
- **`snap-card--muted snap-card--enterprise`** — Empty round state.
- **`RoundsHistory`** — Nested card under today panel; chips and totals aligned with TRX emerald styling.

## i18n

Keys under `emp.snap.roundsHistory*` for rounds list copy; `emp.snap.roundsHistoryTitle` for the section title passed from `TodaySnapshot`.

## Migration notes (2026-03)

- Rounds history strings moved from hardcoded Arabic to `t()`; `createLogger("rounds-history")` on fetch failure.
- Selectors typed with `RootState` instead of `any`.

See: `docs/architecture/refactor-baseline-snapshots.md`.
