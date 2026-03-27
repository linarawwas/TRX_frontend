# Update customer — tabs & main grid (mobile UX)

## Business / functional role

- **`ucx-tabs` + `role="tablist"`** — Switches one of three **mutually exclusive** views for the same customer record:
  - **البيانات (info):** Read-only profile + assign distributor.
  - **الرصيد (invoices):** Balance / receipt UI and optional admin opening edit.
  - **الترتيب (area):** In-area sequence (`AreaSequencePicker`), only when the customer has an `areaId` object.
- **`ucx-grid` (`<main>`)** — Single-column layout wrapper for the **active** tab’s content. Only one panel is mounted at a time (performance-friendly); ARIA ties each visible block to its tab via `aria-labelledby` / `aria-controls`.

State lives in `useUpdateCustomerController` (`tab`); this document only covers presentation and mobile behavior.

## Mobile-oriented design decisions

| Practice | Implementation |
|----------|----------------|
| **Touch targets (≥44×44pt)** | On viewports `≤520px`, `.ucx-tab` uses `min-height: 44px`, flex centering, and `touch-action: manipulation` to reduce double-tap zoom delay. |
| **Equal-width segments** | Same breakpoint: `flex: 1 1 0` on tabs so each target gets equal horizontal space (fewer mis-taps than uneven pills). |
| **Sticky tab bar** | `.ucx-tabs-wrap` is `position: sticky` with a frosted backdrop so users can switch sections after scrolling past the hero/edit form without scrolling back. |
| **Safe areas** | `top: env(safe-area-inset-top)` on small screens for notched devices; `padding-bottom: env(safe-area-inset-bottom)` on `.ucx-grid` for home-indicator clearance. |
| **Horizontal overflow** | `.ucx__surface` uses `overflow-x: hidden` and `overflow-y: visible` so sticky positioning is not clipped by `overflow: hidden`. |
| **Reduced motion** | `prefers-reduced-motion: reduce` disables heavy backdrop blur on the sticky strip for vestibular comfort. |
| **Accessibility** | `nav[aria-label]`, `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected`, `aria-controls`, and stable `id`s for screen readers. |

## Extension

- To add a fourth tab: extend controller `tab` union, add a button with matching `aria-*` and a conditional panel with a unique `id`.
- If sticky behavior conflicts with a future parent `overflow: hidden`, keep `overflow-y: visible` on ancestors of `.ucx-tabs-wrap` or move the tab strip outside the clipping container.

See [update-customer.md](./update-customer.md) and [constituents baseline](../architecture/refactor-baseline-update-customer-constituents.md).
