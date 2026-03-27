# Update customer header — refactor baseline (scoped)

**Scope:** `src/components/Customers/UpdateCustomer/UpdateCustomerHeader.tsx` only (presentation + props). Parent page: `UpdateCustomer.tsx` + `useUpdateCustomerController`.

**Date:** 2026-03-27

## 1. Component hierarchy

```
UpdateCustomer (page)
└── useUpdateCustomerController
    └── UpdateCustomerHeader (stateless)
        ├── HeroIdentity (avatar, h1, subtitle)
        ├── HeroRight (optional, when customerData)
        │   ├── StatusChip
        │   ├── deactivate | restore + RestoreSequenceForm
        │   └── hard delete
        └── PrimaryToolbar (nav.ucx-actionsRow)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Customer payload** | Controller loads via `useUpdateCustomerController` → `customerData` passed as props. Header does **not** call APIs. |
| **Mutations** | All `on*` handlers are controller callbacks (deactivate, restore, delete modal, statement navigation, edit toggle, record order). |

## 3. State management

- **None inside the header.** `editOpen`, `restoreSequence`, `showRestoreOptions`, `isMutating`, etc. are props only.
- **No Redux / RTK Query** in this file by design.

## 4. Async and offline

- **Not applicable** at this layer. Offline/retry semantics live in `useUpdateCustomerController` and shared API utilities.

## 5. `requestRaw` / transport

- **None** in `UpdateCustomerHeader.tsx`.

## 6. Risks to preserve

- **Active vs inactive:** `isActive` must remain **truthy/falsy** aligned with previous JSX (`Boolean(customer.isActive)` for chip, deactivate vs restore, and external-order visibility).
- **Admin gate:** Hard delete disabled + tooltip when `!isAdmin`.
- **Stable ids:** `ucx-customer-heading`, restore sequence input id for label association.

## 7. Extension

- Add props and wire through `HeroRight` or `PrimaryToolbar`; keep subcomponents colocated in the same file until a second consumer appears.

**See also:** [Update customer — baseline](./refactor-baseline-update-customer.md), [Update customer — UI constituents](./refactor-baseline-update-customer-constituents.md), [Hero & toolbar (mobile)](../frontend/update-customer-hero-actions-mobile.md).
