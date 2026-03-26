# RecordOrderForCustomer

Page shell for `/recordOrderforCustomer`: offline strip, back control, IndexedDB discount loading/error UI, and [`RecordOrder`](../../../components/Orders/RecordOrder/RecordOrder.tsx).

## Files

- `RecordOrderForCustomer.tsx` — Composes shell + passes `customerData` / `isExternal` to `RecordOrder`.
- `RecordOrderForCustomer.css` — `rofc-*` layout and states (connectivity, back, skeleton, error).
- `hooks/useCustomerDiscountCache.ts` — IDB discount read + i18n toasts + `reload`.
- `customerDiscountTypes.ts` — Shape aligned with `saveCustomerDiscountToDB` / preload.
- `components/RecordOrderForCustomerConnectivityBar.tsx` — Offline-only banner (`useNavigatorOnline`).
- `components/RecordOrderForCustomerBackNav.tsx` — Back pill.
- `components/RecordOrderForCustomerDiscountSection.tsx` — Skeleton / error / `DiscountCard`.
- `DiscountCard.tsx` / `DiscountCard.css` — Discount presentation when `hasDiscount`.

## Product doc

[docs/pages/RecordOrderForCustomer.md](../../../../docs/pages/RecordOrderForCustomer.md)
