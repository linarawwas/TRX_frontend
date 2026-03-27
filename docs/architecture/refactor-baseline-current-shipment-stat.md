# Current shipment stat (admin) — refactor baseline (Phase 0)

**Scope:** `src/pages/AdminPages/AdminHomePage/CurrentShipmentStats/CurrentShipmentStat.tsx`, colocated `CurrentShipmentStat.css` (post-refactor). Parent: `AdminHomePage.tsx`.

**Date:** 2026-03-27

## 1. Component hierarchy

```
CurrentShipmentStat (default: error boundary)
└── CurrentShipmentStatInner
    ├── title
    ├── loading → skeleton
    ├── error → message + refetch (post-refactor; hook already exposed error/refetch)
    └── success → stat grid + net totals (computeNetTotals)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Auth / tenant** | Redux `state.user.token`, `state.user.companyId` |
| **Fetch** | `useTodayShipmentTotals(token, companyId)` → `useListShipmentsRangeQuery` (RTK Query `POST /api/shipments/range`, same calendar day for from/to) |
| **Aggregation** | Hook sums `data.shipments[]` into `ShipmentTotals` |
| **Net USD/LBP** | `computeNetTotals(totals)` pure helper |

## 3. State management

- **RTK Query:** cache + loading/error inside hook.
- **Local:** none required beyond hook return values.

## 4. Async and offline

- Inherits RTK Query / `fetchBaseQuery` offline behavior; no custom queue in this component.
- Pre-refactor: `error` and `refetch` from hook were unused (no error UI).

## 5. `requestRaw`

- **Not used**; transport is RTK Query.

## 6. Risks to preserve

- Number formatting: LBP-style fields `toLocaleString("en-US")`, USD `toFixed(2)`.
- Arabic labels and title string unchanged.
- Same hook arguments (`token`, `companyId`, default “today” date).
- `computeNetTotals` formula unchanged.

## 7. Post-refactor

- Dedicated CSS (removed ineffective `ShipmentsList.css` import for undefined class names).
- Skeleton while loading; error panel + `refetch`; `createLogger` on error; error boundary; semantic `<section>` / `<dl>`; TRX-style card shell.

See [frontend doc: current shipment stat](../frontend/current-shipment-stat.md).
