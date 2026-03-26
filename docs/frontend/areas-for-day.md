# Areas for day

## Scope

- Page: `src/pages/SharedPages/AreasForDay/AreasForDay.tsx`
- Data: `useAreasForDayData` → `getAreasByDayFromDB`, `getDayFromDB` (IndexedDB); `clearAreaId` on load; `setAreaId` on card click
- Components: status bar, skeleton, area cards, back link to `/areas`

## Data flow

1. **`dayId`** from `useParams`.
2. **Load** — Parallel read of areas for day + day row; weekday title via `ARABIC_DAY_NAME_MAP` + i18n fallbacks.
3. **Navigate** — `AreasForDayAreaCard` → `onBeforeNavigate` → Redux `setAreaId` → `/customers/:areaId`.

## Shell layout

- **`areas-for-day-page--shell`** — Full-viewport gradient + **`areas-for-day-page__glow`**.
- **`areas-for-day-page__inner`** — Centered column (max 640px).
- **`areas-for-day-page__surface`** — White card with emerald accent strip; status, title, and main list live inside.
- **Back link** — Placed below the surface (outline-style), links to `/areas`.

## Extending

- Copy: `addresses.areasForDay.*` and `emp.status.*` in `src/utils/i18n.ts`.
- Preload areas/days in shipment bootstrap so this screen is populated offline.

## Migration notes (2026-03)

- **Logging:** `useAreasForDayData` uses `createLogger("areas-for-day-data")` on IndexedDB errors (replaces `console.error`).
- **UI:** Aligned with TRX enterprise shells (`CustomersForArea`, `RecordOrderForCustomer`).

See: `docs/architecture/refactor-baseline-areas-for-day.md`.
