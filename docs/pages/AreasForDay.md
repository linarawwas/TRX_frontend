# Areas for Day

**Route:** `/areas/:dayId`  
**Source:** [AreasForDay.tsx](../../src/pages/SharedPages/AreasForDay/AreasForDay.tsx)

## Purpose

Lets a driver pick **which delivery area** to work in for the **current day** (`dayId`). Data comes from **IndexedDB** (`getAreasByDayFromDB`, `getDayFromDB`) so the screen works **offline** after preload.

## Behavior (must preserve)

- On load: **`clearAreaId()`** then read caches (see `useAreasForDayData`).
- On area tap: **`setAreaId(area._id)`** then navigate to `/customers/:areaId`.
- No API calls; no offline **queue** reads/writes on this page.

## Components

| File | Role |
|------|------|
| `AreasForDayStatusBar` | Online/offline + offline hint (`addresses.areasForDay.offlineHint`) |
| `AreasForDayAreaCard` | Memoized row → customer list for area |
| `AreasForDaySkeleton` | Loading placeholders |
| `AreasForDayBackLink` | Navigates to `/areas` |

## Hooks

| Hook | Role |
|------|------|
| `useAreasForDayData` | IDB load, error, `reload` for retry |
| `useNavigatorOnline` | Browser connectivity (display only) |

## Design notes (refactor)

- **Why:** Drivers need to know **connectivity** separately from **empty cache**; tap targets and hierarchy match field TRX patterns.
- **Preserved:** Redux order context, IDB keys, routes, and i18n keys for title/loading/empty/error/other areas.
- **Added:** Explicit offline strip, skeleton, retry, semantic `<ul>` list, removed invalid **button-inside-link** pattern for “other areas.”
