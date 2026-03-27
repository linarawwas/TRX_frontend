# Shipments list (`ShipmentsList.tsx`)

**Route:** Typically `/currentShipment` or equivalent admin/employee path.

## Behavior

- User picks **from** / **to** dates (or quick **today** / **last 7 days**), then **Show** runs `listShipmentsRange` with `companyId` + `DateObject` payloads.
- **KPI row** summarizes `computeShipmentTotals` over returned shipments.
- **Cards** repeat per shipment with `formatDMY`, `formatUSD`, `formatLBP`.

## CSS

- `ShipmentsList.css` defines `.ship-page`, filters, KPI grid, cards, datepicker tweaks, skeletons.
- **`.sls-*`** classes layer TRX typography, gradient shell, error/retry, list skeletons, focus rings.

## Extending

- New metrics: extend `ShipmentData` typing and both KPI config and card grid in one pass to avoid drift.
