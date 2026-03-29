# Customers list page — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/viewCustomers/` page module (`CustomersPage.tsx`, `Customers.css`, `hooks/`, `state/`, `services/`, `adapters/`, `components/`). Cross-imports: `redux/Order/action` (`clearCustomerId`), `selectUserToken` via `state/`, `features/customers/apiCustomers` (via `companyCustomersRead.service`), `AddCustomer`, `t()`.

**Date:** 2026-03-27

## 1. Component hierarchy

```
CustomersPage (default: CustomersErrorBoundary)
└── CustomersPageContent (useCustomersViewModel)
    └── CustomersShell
        ├── header: title, add toggle + AddCustomer, search
        ├── loading: CustomersListSkeleton
        ├── error: message + retry
        └── accordion (when !loading && !error && !showInsertOne)
            ├── active section (collapsible list → Link /updateCustomer/:id)
            └── inactive section (same + status chip)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Auth** | Redux `selectUserToken` |
| **List load** | `fetchCustomersByCompany(token)` → `rtkResult` in `apiCustomers` (not `requestRaw`) |
| **Order context** | `dispatch(clearCustomerId())` on mount / when deps change |
| **Add customer** | `AddCustomer` embedded; parent refetches when `showInsertOne` changes |

## 3. State management

- **Local:** lists, `loading`, `error`, `showInsertOne`, `searchTerm`, accordion open flags.
- **Redux:** read token; dispatch `clearCustomerId` only.

## 4. Async and offline

- **Transport:** `rtkResult` in shared layer; no custom queue in this file.
- **Cancellation:** `AbortController` in `useEffect` cleanup (post-refactor).

## 5. `requestRaw`

- **Not used** here; `fetchCustomersByCompany` uses `rtkResult`.

## 6. Risks to preserve

- i18n keys: `customers.*`, `common.*`, `addresses.customer.status.inactive`.
- Routes: `/updateCustomer/${_id}`.
- Accordion counts: `filtered/total` badges.
- **Edge case:** Pre-refactor, `!token` left `loading` true; refactor sets `loading` false and clears lists.

## 7. Post-refactor

- `Customer` type from `apiCustomers`; `loadCustomers` + `AbortController`; `createLogger`; inline error + `t("updateCustomer.retry")`; error boundary reusing `updateCustomer.errorBoundary.*` strings; semantic shell + premium CSS (`vc-*`, Tajawal, TRX emerald).

See [frontend doc: customers list](../frontend/customers-list.md).
