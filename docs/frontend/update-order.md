# Update order screen (`UpdateOrder`)

**Entry:** `src/components/Orders/UpdateOrder/UpdateOrder.tsx`  
**Styles:** `UpdateOrder.css` (plus `UpdateSingleRecord.css` for legacy receipt layout if used by `OrderReceipt`)

## Purpose

View a single order as an invoice-style receipt, add payments from a bottom sheet, and (for admins) edit totals/delivery fields or delete the order.

## Layout tokens

| Class | Role |
|--------|------|
| `uo-shell` | Page background gradient + Tajawal stack |
| `uo-header` | Toolbar: back, title (`h1.uo-title`), print, edit, delete |
| `uo-inline-error` / `uo-retry` | Failed load message + retry |
| `uo-fab` | Fixed action to open payment sheet |
| `sheet-*` | Bottom sheet chrome for `AddPaymentForm` |
| `uo-modal__*` | Edit and delete dialogs |
| `uo-form`, `uo-grid`, `uo-label`, `uo-input` | Edit form fields |

## Behavior notes

- **Loading:** `OrderReceipt` receives `loading`; parent sets `loading(false)` when `orderId`/`token` missing or after fetch completes.
- **Errors:** Toast + `loadError` + retry button; boundary catches render errors in the inner tree.
- **Print:** `window.print()`; global print rules hide chrome and show `.print-area` (ensure receipt subtree keeps that class).

## Extending

- Prefer extending `apiOrders` and passing stricter props into `OrderReceipt` / `AddPaymentForm` rather than duplicating fetch logic in this file.
- New toolbar actions should use `type="button"`, `uo-btn` variants, and match RTL spacing in `UpdateOrder.css`.
