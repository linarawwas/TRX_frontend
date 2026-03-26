# RecordOrderForCustomer

Route: `/recordOrderforCustomer`  
Entry: `src/pages/SharedPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx`

## Purpose

Thin **field shell** around `RecordOrder`: keeps navigation and **discount visibility** aligned with TRX mobile/offline expectations. **Order math, shipment submission, offline queue, and payments** stay in `useRecordOrderController` inside `RecordOrder` — do not duplicate that logic here.

## User flow

1. Driver arrives from **Customers for Area** with `customerId` / name / phone in Redux and optional `isExternal` in location state.
2. Shell shows **offline hint** when `navigator.onLine` is false (submit still queues; same semantics as before).
3. Shell loads **customer discount** from IndexedDB (`getCustomerDiscountFromDB`). While loading, a **skeleton** appears above the form. On failure, **error + retry**; on cache miss, toast + no card (same as legacy warnings).
4. `RecordOrder` receives `customerData` (`hasDiscount`, `valueAfterDiscount`) only after a successful read **and** when not in a discount error state (conservative: list price until data is known).

## Components (folder)

| Component | Role |
|-----------|------|
| `RecordOrderForCustomerConnectivityBar` | Renders when offline; `role="status"`, `aria-live="polite"`. |
| `RecordOrderForCustomerBackNav` | `navigate(-1)`; 44px min height; RTL chevron SVG. |
| `RecordOrderForCustomerDiscountSection` | Skeleton / error+retry / `DiscountCard` when `hasDiscount`. |
| `DiscountCard` | Local presentational card (USD per bottle + note). |

## Hooks

- **`useCustomerDiscountCache(customerId)`** — Loads discount from IDB; toasts on miss/error (i18n); exposes `reload` for retry.

## Styling

- BEM-like prefix `rofc-` in `RecordOrderForCustomer.css` (page shell only). `DiscountCard` keeps `DiscountCard.css`.

## Design notes (refactor)

- **Hierarchy:** connectivity → back → discount block → `RecordOrder` form.
- **Safety:** missing `customerId` shows a single alert instead of a broken form.
- **Touch:** back and retry meet minimum tap targets; safe-area padding on top strip and back row.
