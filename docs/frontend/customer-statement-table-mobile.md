# Customer statement — ledger table & `st-table-wrap` (mobile UX)

## Business / functional role

The statement **ledger** is an eight-column table: **date**, **order link** (open invoice), **delivered**, **returned**, **net bottles per row**, **checkout USD**, **paid USD**, **remaining balance USD**, plus a **footer** with column totals and bottle subtotals.

On a phone, eight numeric/text columns cannot fit without becoming unreadable. **`st-table-wrap`** is therefore the **horizontal scroll viewport**: the table keeps a **`min-width`** (~640px) so columns stay legible, while the wrapper provides **`overflow-x: auto`** and momentum scrolling on iOS.

**`st-table-region`** groups that scroll port with a **short hint** shown only on narrow screens so users know to pan horizontally.

## Current design (after mobile pass)

| Practice | Implementation |
|----------|----------------|
| **Scroll without layout break** | `.st-table-wrap { overflow-x: auto; min-width` on `.st-table }` — same model as before, with stronger mobile polish. |
| **Discoverability** | `.st-table-scroll-hint` visible for `max-width: 720px`, `aria-hidden` (redundant with spoken `aria-label` on the region). |
| **Screen readers** | `role="region"`, `tabIndex={0}`, `aria-label` from `customerStatement.table.regionAriaLabel` (i18n). |
| **Focus** | `:focus-visible` ring on the scroll region for keyboard users. |
| **Touch** | `-webkit-overflow-scrolling: touch`, `overscroll-behavior-x: contain` (reduces scroll chaining into the page). |
| **Edge affordance** | Inset box-shadow on the wrap hints that more columns exist off-screen. |
| **Tap targets** | For `max-width: 640px`, `.st-order-link` uses `min-height/min-width: 44px`, `touch-action: manipulation`, tap highlight. |
| **Density** | Slightly tighter cell padding and font size on small screens. |
| **Sticky header** | `thead th` stays `position: sticky; top: 0` inside the scroll container; `z-index` + bottom shadow for separation while scrolling. |
| **Print** | Hint hidden; wrap loses inset shadow/border so the printed ledger is flat and fully visible. |
| **Motion** | `scroll-behavior: smooth` disabled under `prefers-reduced-motion: reduce`. |

## Extension

- **Card/list layout** for phones (one row → one card) would be a larger product change; keep ledger math in `customerStatementLedger.ts` and map `rows` to a new presentational component if added.
- New columns: adjust `min-width` on `.st-table` and footer `colSpan` to stay aligned.

See [customer-statement.md](./customer-statement.md).
