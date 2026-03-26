# Record order for customer

Entry page for recording a delivery order for the customer selected in Redux (`selectOrderCustomerId`).

- **Layout & discount:** `RecordOrderForCustomer.tsx`, `RecordOrderForCustomer.css`, `DiscountCard.tsx`, `DiscountCard.css`
- **IndexedDB discount:** `useCustomerDiscountFromCache.ts` (read-only cache; no HTTP here)
- **Form / submit / offline:** `src/components/Orders/RecordOrder/RecordOrder.tsx` → `useRecordOrderController`

Product documentation: `docs/frontend/record-order-for-customer.md` and `docs/architecture/refactor-baseline.md`.
