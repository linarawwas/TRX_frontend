# Customers for area

## Scope

- Page: `src/pages/SharedPages/CustomersForArea/CustomersForArea.tsx`
- Data: IndexedDB via `useCustomersForAreaCache` → `getCustomersFromDB(areaId)` (no HTTP on this screen)
- Segmentation: `customersForAreaSegmentation.ts` + `useSegmentCustomersForArea` with Redux shipment selectors
- UI: `CustomersForArea.css`, connectivity bar, pending banner, accordion sections, customer cards, skeleton, scroll-top

## Data flow

1. **Load** — `getCustomersFromDB(areaId)`; on each load, order Redux customer fields are cleared (`clearCustomerId`, etc.).
2. **Buckets** — `segmentCustomersForArea` assigns each row to **pending** (if id in pending shipment set), else **completed** (filled or empty), else **active**. Search filters name/phone/address.
3. **Navigate** — Card tap → dispatch order customer fields → `/recordOrderforCustomer` with `isExternal` from `location.state`.

## UI shell

- **`.cfa-page`** — Full-viewport gradient background + optional `.cfa-page__glow` (decorative).
- **`.cfa-inner`** — Centered column (max 640px).
- **`.cfa-surface`** — Single elevated card with top emerald accent strip; holds connectivity, banners, title, search, and lists.

## Extending

- **i18n:** keys under `customersForArea.*` in `src/utils/i18n.ts`.
- **Do not** add API calls here without a coordinated preload strategy; this screen assumes IndexedDB is already populated.

## Migration notes (2026-03)

- **Logging:** `useCustomersForAreaCache` uses `createLogger("customers-for-area-cache")` for IndexedDB errors (replaces bare `console.error`).
- **Tests:** `customersForAreaSegmentation.test.ts` covers pending precedence, search, and counts.
- **Visual:** Aligned with TRX emerald/slate enterprise shell (see `RecordOrderForCustomer` / `rofc-*` patterns).

See: `docs/architecture/refactor-baseline-customers-for-area.md`.
