# Customer statement — refactor baseline (scoped)

**Scope:** `src/components/Customers/CustomerStatement/*` (page shell, payment sheet host, ledger utils, data hook). **Out of scope:** `AddPaymentForm` (shared order module) except as embedded child.

**Date:** 2026-03-27

## 1. Component hierarchy

```
CustomerStatement (default export, error boundary)
└── CustomerStatementInner
    ├── useCustomerStatement(customerId, token)
    ├── Ledger UI (table + summary) from buildStatementLedger(...)
    ├── CustomerStatementPaymentSheet (optional)
    │   └── AddPaymentForm (when order selected)
    └── ToastContainer
```

## 2. Data flow (API → UI)

| Step | Mechanism |
|------|-----------|
| Initial load | `fetchCustomerStatement(token, customerId)` in `useCustomerStatement` — wraps existing `fetchCustomerById` + `rtkResult` for `/api/orders/customer/:id/with-initial` (see `apiCustomers.ts`). |
| After payment | `AddPaymentForm` → `addPaymentToOrder` (orders API); on success, `refreshOrdersAfterPayment` → `fetchOrdersByCustomer` to replace `orders` in state (same as legacy page). |
| Redux | `token` only via `useSelector((s: RootState) => s.user.token)`. |

## 3. State management

- **Local:** `loading`, `loadError`, `customer`, `orders`, `opening`, sheet visibility, `targetOrderId`.
- **No Redux** for statement payload.
- **Ledger:** Derived with `useMemo` + pure `buildStatementLedger(orders, opening)` in `customerStatementLedger.ts`.

## 4. Async and offline

- Behavior unchanged: failures surface via `toast` + inline `loadError` + retry (`reload`).
- **No change** to `rtkResult` / queue semantics inside `fetchCustomerStatement` or `fetchOrdersByCustomer`.

## 5. `requestRaw`

- **None** in the CustomerStatement folder; transport remains in feature APIs.

## 6. Risks preserved / fixes

- **Paid USD normalization** is centralized in `computePaidUsdForOrder` (must stay aligned with historical statement rows and payment refresh shape).
- **Refresh** still casts `fetchOrdersByCustomer` results to `LedgerOrderInput[]` (legacy parity with pre-refactor page).
- **Loading bug (legacy):** missing `customerId` / `token` no longer leaves `loading === true` indefinitely; user sees an Arabic `loadError` and can retry when token appears.

## 7. Extension

- New columns: extend `StatementLedgerRow` + table markup + footer colspan rules.
- i18n: replace inline Arabic strings in `useCustomerStatement` / error boundary with `t()` keys when the app standardizes this route.

**See also:** [customer-statement.md](../frontend/customer-statement.md).
