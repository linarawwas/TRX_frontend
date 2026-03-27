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

## Architecture (component)

- **Stateless shell:** No hooks that fetch or mutate; `customerId` only keys the fragment so React remounts the header subtree when switching records.
- **Composition:** `HeroIdentity`, `StatusChip`, `RestoreSequenceForm`, `HeroRight`, `PrimaryToolbar` are `memo`’d internals (same module) to keep renders predictable; behavior is unchanged from the pre-split JSX.
- **Types:** `UpdateCustomerHeaderCustomer` is `Pick<CustomerDetail, "name" | "phone" | "address" | "isActive">` so props stay aligned with API types without duplicating ad-hoc shapes.
- **Baseline doc:** [refactor-baseline-update-customer-header.md](../architecture/refactor-baseline-update-customer-header.md).

## Visual system (desktop + mobile)

| Element | Intent |
|--------|--------|
| **`.ucx-hero`** | Contained “surface” (gradient, hairline border, inset highlight) so the hero reads as one premium block, not floating text. |
| **`.ucx-avatar`** | Brand-adjacent mint–violet gradient, white ring, deeper emerald shadow for depth without clutter. |
| **`.ucx-chip`** | Subtle vertical gradient + border tint for active/inactive states. |
| **`.ucx-actionsRow`** | Toolbar strip (muted fill, radius, shadow) grouping primary actions separately from lifecycle controls in the hero. |
| **Subtitle** | Phone/address as `.ucx-hero__meta` with a neutral separator (`·`); removed emoji for calmer enterprise tone. |
| **Motion** | Short `transition` on hero shadow; `prefers-reduced-motion` disables hero transition and button press nudge. |

## Mobile-oriented design decisions

| Practice | Implementation |
|----------|----------------|
| **Touch targets (≥44×44pt)** | From `max-width: 640px`, hero secondary buttons and actions-row buttons use `min-height: 44px`, full width in a column layout, `touch-action: manipulation`, and a light tap highlight. |
| **Stacked flows** | Hero right column and `ucx-actionsRow` switch to **column + stretch** so controls are not cramped in a wrapped row. |
| **Long text** | `ucx-title` / `ucx-sub` use `overflow-wrap: anywhere` and responsive `font-size` so long names and addresses do not overflow horizontally. |
| **Restore form** | `ucx-restoreInline` becomes a **single-column grid** on small screens; sequence input keeps an explicit `label` / `id` pair for keyboard and screen-reader users. |
| **Safe area** | Hero uses `padding: calc(10px + env(safe-area-inset-top, 0px)) …` so notch clearance is preserved inside the new padded surface. |
| **Slightly smaller avatar** | At `≤520px`, avatar is 52px to free horizontal space for the title block (aligned with narrow tab breakpoint). |
| **Landmarks** | `header[aria-label]` and `nav[aria-label]` use `updateCustomer.header.heroAriaLabel` and `updateCustomer.header.actionsNavAriaLabel`. |

## Extension

- New hero actions: add buttons inside `ucx-hero__right` or `ucx-actionsRow` and reuse `.ucx-btn`; on mobile, rules under `@media (max-width: 640px)` target `.ucx-hero__right .ucx-btn` and `.ucx-actionsRow .ucx-btn` for consistent height.

See [update-customer.md](./update-customer.md) and [update-customer-tabs-mobile.md](./update-customer-tabs-mobile.md).
