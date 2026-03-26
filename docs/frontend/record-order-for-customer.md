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

## Migration notes (2026-03)

- Replaced inline discount `useEffect` with `useCustomerDiscountFromCache` for clearer loading/error boundaries and dev-safe logging.
- Page shell uses `.rofc-page` / `.rofc-inner` with an 8px-based layout and a non-blocking discount loading skeleton.
- Removed unused imports (`CustomerInvoices`, `saveCustomerDiscountToDB`, `selectUserToken`) from the page.

See also: `docs/architecture/refactor-baseline.md`.
