# Update order — refactor baseline (Phase 0 + implemented slice)

**Scope:** `src/components/Orders/UpdateOrder/UpdateOrder.tsx`, `UpdateOrder.css`. Child components **unchanged** in this effort: `OrderReceipt/`, `AddPaymentForm/`. Transport: `src/features/orders/apiOrders.ts`.

**Date:** 2026-03-26

## 1. Component hierarchy

```
UpdateOrder (default export, error boundary)
└── UpdateOrderInner
    ├── ToastContainer
    ├── header (back, title, print, edit, delete)
    ├── load error inline + retry (when !loading && loadError)
    ├── OrderReceipt (orderData, loading)
    ├── FAB → PaymentSheet + AddPaymentForm (when showSheet && orderId && orderData)
    ├── Modal: edit form (admin)
    └── Modal: delete two-step (admin)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Auth** | Redux `user.token`, `user.isAdmin`. |
| **Route** | `useParams().orderId`. |
| **Load** | `fetchOrderById(token, orderId)` → `setOrderData` / `loadError`. |
| **Edit** | `updateOrderById(token, orderId, body)` → `setOrderData` on success. |
| **Delete** | `deleteOrderById` → toast → `navigate(-1)` after delay. |
| **Payments** | `AddPaymentForm` mutates via API and calls `setOrderData` + `onSuccess` (sheet close). |

## 3. State management

- **Local only:** `orderData`, `loading`, `loadError`, sheet/edit/delete UI flags, `edit` form fields.
- **No Redux** for order entity in this component (read token/admin from store).

## 4. Async and offline

- **Transport:** `apiOrders` uses `rtkResult` (not `requestRaw`). Offline/retry semantics live in shared transport; this component does not implement its own queue.
- **Retry UX:** User-triggered `loadOrder` from inline error + toast on failure; `createLogger("update-order")` on fetch failure.

## 5. `requestRaw`

- **Not used** in `UpdateOrder.tsx` or `apiOrders` for this flow.

## 6. Risks preserved

- Admin-only edit/delete (toasts when non-admin).
- FAB disabled when `!orderId || !orderData` so `AddPaymentForm` is not mounted without data.
- Delete two-step confirmation unchanged in behavior.
- Print: relies on `.print-area` inside `OrderReceipt` / existing print CSS from shared imports.

## 7. Post-refactor (implemented in component + CSS)

- **Types:** `Order`, `Payment` from `apiOrders`; `EditFormState`; `orderData: Order | null`.
- **Helpers:** `sumPaymentsByCurrency` for USD/LBP totals in edit prefill.
- **Shell:** `uo-shell`, Tajawal, TRX emerald accents, header grid, FAB, sheet, modals (`uo-modal__*`).
- **A11y:** semantic `header` / `h1`, `role="dialog"`, `useId` for modal title linkage, focus on sheet open, Escape on backdrop pattern.
- **Resilience:** `UpdateOrderErrorBoundary` with Arabic fallback + reload; dev-safe logging via `createLogger`.

See [frontend doc: update order](../frontend/update-order.md).
