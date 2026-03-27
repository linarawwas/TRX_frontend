# Customer statement (`/customers/:customerId/statement`)

Arabic RTL statement: order ledger, opening balance / bottles, print layout, and add-payment flow via bottom sheet + `AddPaymentForm`.

## Files

| File | Role |
|------|------|
| `CustomerStatement.tsx` | Route UI, composes hook + ledger + sheet. |
| `useCustomerStatement.ts` | Load + retry + refresh-after-payment (no UI). |
| `customerStatementLedger.ts` | Pure `fmtUSD`, date formatting, `computePaidUsdForOrder`, `buildStatementLedger`, `buildSelectableOrderOptions`. |
| `CustomerStatementPaymentSheet.tsx` | Accessible sheet host (Escape, backdrop click, focus on panel). |
| `CustomerStatementErrorBoundary.tsx` | Catches render errors; reload CTA. |
| `CustomerStatement.css` | Shell, table, summary, FAB, sheet, print rules. |

## UX notes

- **Enterprise shell:** Tajawal, emerald-aligned FAB and accents, card/table hierarchy, sticky thead on small viewports (horizontal scroll).
- **Ledger (mobile):** [customer-statement-table-mobile.md](./customer-statement-table-mobile.md) — **cards ≤719px** (primary metric + invoice CTA + subtotal); **full table ≥720px + print** with `st-table-wrap`.
- **Loading:** Skeleton block instead of a blank page.
- **Errors:** Toast (existing) + inline banner with **إعادة المحاولة** calling `reload()`.
- **Print:** Hides chrome, FAB, sheet, toasts; keeps `.print-area` content.
- **Payments:** Duplicate success toast removed from refresh path; `AddPaymentForm` still shows its own success toast.

## Tests

- `customerStatementLedger.test.ts` — payment math and aggregation (run where Jest/jsdom ESM allows).

## Architecture baseline

[refactor-baseline-customer-statement.md](../architecture/refactor-baseline-customer-statement.md)
