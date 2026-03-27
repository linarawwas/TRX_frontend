# Update customer — hero & actions toolbar (mobile UX)

## Business / functional role

- **`ucx-hero` (`<header>`)** — Top summary for the loaded customer:
  - **Left:** Avatar initial(s), **page title** (`h1`, id `ucx-customer-heading`), phone/address subtitle.
  - **Right (when data exists):** Active/inactive **status chip**, **deactivate** or **restore** (+ optional sequence form), **hard delete** (admin-gated).
- **`ucx-actionsRow` (`<nav>`)** — High-frequency tasks below the hero:
  - **External order** (non-admin, active customer only).
  - **Statement / payment** navigation.
  - **Toggle edit form** (`aria-expanded` on the button).

Markup lives in `UpdateCustomerHeader.tsx`; styles in `UpdateCustomer.css`. The page shell is `UpdateCustomer.tsx`.

## Mobile-oriented design decisions

| Practice | Implementation |
|----------|----------------|
| **Touch targets (≥44×44pt)** | From `max-width: 640px`, hero secondary buttons and actions-row buttons use `min-height: 44px`, full width in a column layout, `touch-action: manipulation`, and a light tap highlight. |
| **Stacked flows** | Hero right column and `ucx-actionsRow` switch to **column + stretch** so controls are not cramped in a wrapped row. |
| **Long text** | `ucx-title` / `ucx-sub` use `overflow-wrap: anywhere` and responsive `font-size` so long names and addresses do not overflow horizontally. |
| **Restore form** | `ucx-restoreInline` becomes a **single-column grid** on small screens; sequence input keeps an explicit `label` / `id` pair for keyboard and screen-reader users. |
| **Safe area** | `padding-top: env(safe-area-inset-top)` on `.ucx-hero` gives a little clearance under device notches when the surface is edge-near. |
| **Slightly smaller avatar** | At `≤520px`, avatar is 52px to free horizontal space for the title block (aligned with narrow tab breakpoint). |
| **Landmarks** | `header[aria-label]` and `nav[aria-label]` use `updateCustomer.header.heroAriaLabel` and `updateCustomer.header.actionsNavAriaLabel`. |

## Extension

- New hero actions: add buttons inside `ucx-hero__right` or `ucx-actionsRow` and reuse `.ucx-btn`; on mobile, rules under `@media (max-width: 640px)` target `.ucx-hero__right .ucx-btn` and `.ucx-actionsRow .ucx-btn` for consistent height.

See [update-customer.md](./update-customer.md) and [update-customer-tabs-mobile.md](./update-customer-tabs-mobile.md).
