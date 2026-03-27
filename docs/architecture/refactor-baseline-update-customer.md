# Update customer — refactor baseline (Phase 0)

**Scope:** `src/components/Customers/UpdateCustomer/*` (shell, form, header, invoices panel, modals, opening editor) and `src/features/customers/hooks/useUpdateCustomerController.ts`. Cross-imports: `CustomerInfo`, `CustomerInvoices`, `AreaSequencePicker`, `AssignDistributorInline`, `apiCustomers`, `apiAreas`.

**Date:** 2026-03-26

## 1. Component hierarchy

```
UpdateCustomer
├── ToastContainer
├── UpdateCustomerHeader (hero, status, actions)
├── UpdateCustomerForm (when editOpen)
├── Tab strip (info | invoices | area)
├── main.ucx-grid
│   ├── info: CustomerInfo + AssignDistributorInline
│   ├── invoices: UpdateCustomerInvoicesPanel → CustomerInvoices / OpeningEditor
│   └── area: AreaSequencePicker (when customer has areaId)
└── UpdateCustomerModals (confirm update, hard delete)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Customer load** | `fetchCustomerById` → `setCustomerData`; then `fetchAndCacheCustomerInvoice` → IndexedDB. |
| **Areas list** | `fetchAreasByCompany` → local `areas` (form area select). |
| **Placement options** | `fetchActiveCustomersByArea(targetAreaId)` → sorted list → `placementOptions`. |
| **Mutations** | `updateCustomerById`, `deactivateCustomer`, `restoreCustomer`, `hardDeleteCustomer`, `updateCustomerOpening` (OpeningEditor). |
| **Order context** | Redux `setCustomerId` / name / phone on record-order navigation. |

## 3. State management

- **Hook:** `useUpdateCustomerController` holds almost all UI + async state (`customerData`, `loading`, modals, `tab`, `updatedInfo`, etc.).
- **Redux:** `user`, `shipment`; dispatch for order flow only.

## 4. Async and offline

- **Invoice cache:** `fetchAndCacheCustomerInvoice` writes sums to IndexedDB; failures do not block showing customer (invoice panel uses `invoiceReady`).
- **No offline mutation queue** in this slice; transport is `rtkResult` / RTK Query transport.

## 5. `requestRaw`

- **Not used** in Update customer flow; `apiCustomers` / `apiAreas` use `rtkResult`.

## 6. Risks to preserve

- Confirm-update modal and `pendingChanges` payload shape before PATCH.
- Hard delete two-step admin flow and `navigate(-1)` timing.
- `AreaSequencePicker` `mode="apply"` and `onApplied={fetchCustomer}`.
- Opening editor limits and double `window.confirm` semantics.

## 7. Pre-refactor notes

- `customerData` typed as `any` in the hook; console logging for errors; many hardcoded Arabic strings in TSX and hook.
- Loading UX mixed (SpinLoader inside `CustomerInfo` vs page-level expectations).

---

## Post-refactor (implemented)

- **`fetchError` + `reload`:** Failed `fetchCustomerById` surfaces an error panel with retry; `createLogger` on fetch/placement/areas failures.
- **i18n:** `updateCustomer.*` keys for UI, modals, opening editor, and toasts (Arabic preserved where required for tests).
- **Shell:** `ucx--shell` / `ucx__surface` gradient + emerald top bar (TRX-aligned).
- **Skeleton:** `UpdateCustomerPageSkeleton` during initial load.
- **Types:** `CustomerDetail | null`, `UpdateCustomerPayload` for pending changes; `OpeningEditor` checks `updateCustomerOpening` `ApiResult` (fixes silent success on API error).
- **Tests:** Restore conflict expectation aligned with `toast.error` + backend message (`conflict`).

See [frontend doc: update customer](../frontend/update-customer.md).
