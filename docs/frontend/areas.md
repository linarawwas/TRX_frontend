# Areas (company list)

## Scope

- Page: `src/pages/SharedPages/Areas/Areas.tsx`
- Data: `useAreasCompanyList` → `fetchAreasByCompany` (`features/areas/apiAreas`, via `rtkTransport`)
- UI: `AreasConnectivityBar`, `AreasErrorPanel`, grid links to `/addresses/:areaId`, `AddArea` when toggled

## Data flow

1. **`selectUserToken`** gates fetch; hook refetches when **`formVisible`** changes (refresh after adding an area).
2. **No token** — hook clears list, error, and **ends loading** (avoids infinite spinner).
3. **Error** — `AreasErrorPanel` calls **`reload()`** (same fetch path).

## Shell layout

- **`areas-page--shell`** — Page gradient + **`areas-page__glow`**
- **`areas-page__inner`** — Max-width column
- **`areas-page__surface`** — White card + emerald accent strip; header + content inside
- **Connectivity** — Rendered **above** the surface (full width of inner column)

## Extending

- Copy: `addresses.areas.*`, `addresses.empty`, `addresses.areas.offlineHint`, `addresses.areas.retry`

## Migration notes (2026-03)

- Wired **`useAreasCompanyList`**, **`AreasConnectivityBar`**, **`AreasErrorPanel`** (were previously unused).
- Removed unused **Carousel** imports from `Areas.tsx`.
- **`createLogger("areas-company-list")`** on fetch failure; no-token handling sets loading false.
- Enterprise CSS aligned with other TRX shells.

See: `docs/architecture/refactor-baseline-areas.md`.
