# Record order for customer

## Scope

- Page: `src/pages/SharedPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx`
- Discount banner: `DiscountCard.tsx` + `DiscountCard.css`
- IndexedDB discount read: `useCustomerDiscountFromCache.ts`
- Order form and submit: `src/components/Orders/RecordOrder/RecordOrder.tsx` → `useRecordOrderController`

## Data flow

1. **Discount (banner + checkout math)**  
   Read-only load from IndexedDB via `getCustomerDiscountFromDB(customerId)`. No HTTP on this page. Toasts and logging are centralized in `useCustomerDiscountFromCache`.

2. **Orders / offline / submit**  
   Unchanged: handled in `useRecordOrderController` (Redux, queue, `requestJson`, navigation).

3. **LBP reference on discount card**  
   `selectShipmentExchangeRateLBP` is passed into `DiscountCard` so an approximate LBP per bottle can show when a rate exists.

## Extending

- Add strings under `recordOrderForCustomer.*` in `src/utils/i18n.ts`.
- Do not move submit/offline logic into the page component without a coordinated change to `useRecordOrderController` and tests.

## Viewport behavior

- The page uses **`100dvh`** with **`overflow: hidden`** on the shell and a short-lived **`overflow: hidden` on `html`/`body`** while this route is mounted, so the **browser page does not scroll**.
- The **submit** control is **`position: fixed`** at the bottom (above the safe area) so the driver can always reach it without scrolling the document.
- If content is taller than the remaining space (e.g. tall invoice block), **only** the inner `.record-order-container` scrolls; the submit bar stays pinned.

## Migration notes (2026-03)

- Replaced inline discount `useEffect` with `useCustomerDiscountFromCache` for clearer loading/error boundaries and dev-safe logging.
- Page shell uses `.rofc-page` (atmospheric gradient + soft emerald glow), `.rofc-top` (eyebrow + glass back pill), and `.rofc-surface` (elevated card with top accent bar). `RecordOrder` is visually merged into the surface via scoped overrides in `RecordOrderForCustomer.css`.
- Discount card uses layered gradient, icon badge, and stronger shadow for a premium banner.
- Removed unused imports (`CustomerInvoices`, `saveCustomerDiscountToDB`, `selectUserToken`) from the page.

See also: `docs/architecture/refactor-baseline.md`.
