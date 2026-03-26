# Areas for day — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/AreasForDay/` (page, hooks, components, constants).

**Date:** 2026-03-26

## 1. Component hierarchy

```
AreasForDay
├── AreasForDayStatusBar (device online/offline + offline hint)
├── header (title with weekday from i18n + ARABIC_DAY_NAME_MAP)
├── main
│   ├── AreasForDaySkeleton | error+retry | list of AreasForDayAreaCard | empty
└── AreasForDayBackLink → /areas
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Areas + day name** | **IndexedDB only** — `useAreasForDayData` calls `getAreasByDayFromDB(dayId)` and `getDayFromDB(dayId)`. No HTTP on this screen. |
| **Order context** | On each load: `clearAreaId()`; before navigating to customers: `setAreaId(areaId)` from card click. |
| **Weekday title** | `dayNameRaw` from cached day row → `ARABIC_DAY_NAME_MAP` for English → Arabic; fallback `addresses.areasForDay.unknownDay`. |

## 3. Async and offline

- **No network** — list is cache-only; empty list is valid when offline if cache not primed.
- **Retry** — User `reload()` re-reads IndexedDB after error.

## 4. `requestRaw` / RTK Query

- **Grep:** No `requestRaw` in `AreasForDay/`. RTK Query migration for this list is **N/A**; preload happens elsewhere.

## 5. Risks to preserve

- `clearAreaId` at start of each load in `useAreasForDayData`.
- `onBeforeNavigate` → `setAreaId` before route transition on area card.
- `dayId` from `useParams` — missing `dayId` shows unknown day and empty areas.

## 6. UI notes (pre-change)

- Flat page layout; opportunity to align shell with `CustomersForArea` / `cfa-*` / `rofc-*` (gradient, elevated surface).
- `console.error` on IndexedDB failure — candidate for `createLogger`.
