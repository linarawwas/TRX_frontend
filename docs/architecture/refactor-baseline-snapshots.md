# Today / Round snapshots — refactor baseline (Phase 0)

**Scope:** `src/components/AsideMenu/Right/TodaySnapshot.tsx`, `RoundSnapshot.tsx`, shared `TodaySnapshot.css`, `src/components/snapshots/ProgressSnapshot.tsx`, `src/components/Shipments/RoundsHistory/*`.

**Date:** 2026-03-26

## 1. Component hierarchy

```
TodaySnapshot
├── useSelector(selectTodayProgress, selectShipmentMeta)
├── computeProgress / formatMoneyPair
├── ProgressSnapshot (collapsible KPI + progress bar)
│   └── children: RoundsHistory (if shipmentId) — **HTTP** via fetchShipmentRounds
└── Styles: TodaySnapshot.css (imported by ProgressSnapshot)

RoundSnapshot
├── useSelector(selectRoundProgress)
├── Early exit: muted card + emp.round.empty
└── ProgressSnapshot (+ optional target-lock foot)
```

## 2. Data flow

| Concern | Path |
|--------|------|
| **Today KPIs** | Redux `selectTodayProgress` — no fetch in `TodaySnapshot`. |
| **Round KPIs** | Redux `selectRoundProgress`. |
| **Rounds list** | `RoundsHistory`: `fetchShipmentRounds(token, shipmentId)` from `features/shipments/api` when `shipmentId` + `token` present; local state `rounds`, `loading`, `error`. |

## 3. Async / offline

- **RoundsHistory** is the only network surface in this tree; aborts on unmount via `AbortController`.
- Snapshot numbers are Redux-driven (offline-capable if store is hydrated elsewhere).

## 4. `requestRaw` / RTK Query

- **Grep:** No `requestRaw` in these files. API goes through `fetchShipmentRounds` (module abstraction). RTK Query migration would be a coordinated change in `features/shipments/api`, not forced in snapshot components for this pass.

## 5. Risks to preserve

- `ProgressSnapshot` `id` must match `aria-controls` / panel `id`.
- `kpiScope` drives label copy (today vs round).
- `RoundSnapshot` empty gate: `!sequence || targetRound <= 0`.
- `TodaySnapshot` default collapsed `open=false`; `RoundSnapshot` default `open=true`.

## 6. UI notes (pre-change)

- Shared CSS used `:root` tokens and mixed margin on `.snap-card`; RoundsHistory had hardcoded Arabic strings.
- Opportunity: align visuals with TRX emerald shells; move Rounds copy to i18n.
