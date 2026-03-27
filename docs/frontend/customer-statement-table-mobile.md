# Customer statement — ledger on mobile (hybrid table + cards)

## Product decision (senior mobile UX)

For **dense financial ledgers**, the optimal pattern is usually **not** a single solution for every viewport:

1. **Phones (≤719px):** **إجمالي الطلبات** (subtotal) **first** — matches business need to see totals before drilling in. **Order rows are newest-first** (same sort as the desktop table). The **card list is inside `<details>`**, **collapsed by default** so the screen stays compact; expanding shows one card per order (hero remaining USD, invoice link, field grid).
2. **Tablet / desktop (≥720px):** **Full 8-column table** inside `st-table-wrap` — comparison across columns and alignment with **print** output.
3. **Print:** **Table only**; card layout hidden.

Same source of truth: `buildStatementLedger()` in `customerStatementLedger.ts`. **`StatementLedgerMobile`** is presentational only.

## Desktop table region (`st-table-wrap`)

| Element | Role |
|---------|------|
| **`st-table-region`** | Wraps scroll hint + table on wide viewports only (whole block has `st-ledger-table-desktop`). |
| **`st-table-wrap`** | Horizontal scroll when the table is shown; `role="region"`, `aria-label`, sticky `thead`, etc. (no `tabIndex` — satisfies `jsx-a11y/no-noninteractive-tabindex`; focus moves via row links). |

On narrow screens the **desktop block is `display: none`**; users interact with **cards** instead, so the horizontal scroll hint is not needed on mobile.

## Mobile root (`st-ledger-mobile-root`)

| Practice | Implementation |
|----------|----------------|
| **Progressive disclosure** | Hero strip = remaining USD; other amounts in compact `dl` grid. |
| **Business priority** | Outstanding balance per row is **largest / tinted** (due vs credit). |
| **Actions** | **تفاصيل الفاتورة** as a full touch target. |
| **Parity** | **إجمالي الطلبات** card = same numbers as table `<tfoot>`. |
| **Empty** | i18n empty message only on mobile (desktop still shows empty tbody). |
| **a11y** | `role="region"` on card list; `h2` + `aria-label` on subtotal; list `ul`/`li` for order cards. |

## Extension

- **Toggle “جدول / بطاقات”** on mobile: add `localStorage` + class on `body` or container; default stays **cards** on ≤719px.
- **Virtualize** the `ul` if row count grows very large (separate from layout choice).

See [customer-statement.md](./customer-statement.md).
