# Update customer — UI constituents baseline (Phase 0)

**Scope:** Only the render tree reachable from [`UpdateCustomer.tsx`](../../src/components/Customers/UpdateCustomer/UpdateCustomer.tsx): shell chrome, skeleton, load error, header, form, tabs, tab bodies, modals, and embedded third-party leaves (`CustomerInfo`, `AssignDistributorInline`, `UpdateCustomerInvoicesPanel` → `OpeningEditor` / `CustomerInvoices`, `AreaSequencePicker`). **Out of scope for this doc slice:** `useUpdateCustomerController` (state owner; unchanged unless wiring new UI).

**Date:** 2026-03-27

## 1. Hierarchy (constituents only)

```
UpdateCustomer
├── ToastContainer (react-toastify)
├── UpdateCustomerPageSkeleton (loading)
├── Load error panel | ErrorBoundary → main column
│   ├── UpdateCustomerHeader
│   ├── UpdateCustomerForm (editOpen)
│   ├── Tab buttons
│   └── main.ucx-grid
│       ├── CustomerInfo + AssignDistributorInline  (tab info)
│       ├── UpdateCustomerInvoicesPanel → OpeningEditor | CustomerInvoices (tab invoices)
│       └── AreaSequencePicker (tab area, if areaId object)
└── UpdateCustomerModals
```

## 2. Data flow (UI perspective)

- **Props/callbacks** all originate from `useUpdateCustomerController` in the parent; constituents are presentational except local state in `OpeningEditor`, `AreaSequencePicker` hooks, `AssignDistributorInline`, `CustomerInvoices` (IndexedDB).

## 3. `requestRaw`

- **None** in these files; network is via shared APIs / hooks in child packages.

## 4. Redux

- **AssignDistributorInline** reads `token` from Redux; remainder of this tree is props-driven from the parent hook.

## 5. Offline / sync

- **CustomerInvoices** / invoice panel: IndexedDB reads; online/offline listeners internal to that component. No change to queue semantics in this slice.

## 6. UI inconsistencies (pre this pass)

- Embedded leaves (`CustomerInfo`, `sequence-form`, `assign-dist`, `customer-receipt`) used legacy blues/grays vs TRX emerald shell on the same page.
- Load error markup lived inline in `UpdateCustomer.tsx`.
- No error boundary around the interactive subtree.

## 7. Risks to preserve

- All existing props, tab guards (`hasAreaObject`), modal open conditions, and `onApplied` / `onDone` callbacks must behave identically.
- `CustomerInfo` is also mounted on `/customerInfo` without `.ucx`; scoped CSS must use `.ucx …` selectors only.

See [update customer frontend doc](../frontend/update-customer.md).
