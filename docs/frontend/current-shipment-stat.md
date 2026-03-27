# Current shipment stat (`CurrentShipmentStat.tsx`)

**Location:** `src/pages/AdminPages/AdminHomePage/CurrentShipmentStats/`

Admin card showing **today’s** aggregated shipment KPIs (carrying, delivered, returned, payments, expenses, extra profits, net LBP/USD).

## Data

- `useTodayShipmentTotals(token, companyId)` — RTK Query range query for the current calendar day.
- `computeNetTotals` — net USD/LBP from payments + extra profits − expenses.

## UI

- **Loading:** `CurrentShipmentStatSkeleton` (shimmer; `prefers-reduced-motion` safe).
- **Error:** Message + retry calls hook `refetch()`.
- **Success:** Definition list–style rows; net totals visually emphasized.

## Extending

- For another day, extend the hook call with a `Date` argument (hook already supports optional `date`).
- Prefer new copy via i18n if this block is reused outside admin.
