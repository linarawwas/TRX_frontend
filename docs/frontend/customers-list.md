# Customers list (`viewCustomers` page module)

**Files:** `src/pages/SharedPages/viewCustomers/` — `CustomersPage.tsx`, `Customers.css`, `index.tsx`, `hooks/`, `state/`, `services/companyCustomersRead.service.ts`, `adapters/companyCustomersAdapter.ts`, `utils/customersPageSearch.ts`, `types/`, `components/CustomersShell.tsx`, `__tests__/`.

## Purpose

Browse active and inactive customers, search, add a customer, and open update-customer per row.

## Layout classes

Dual classes keep legacy hooks (`customers-body`, `accordion-header`, …) while `vc-*` + `.customers-body.vc-shell` apply the enterprise shell.

## Behavior

- While the list is loading, `CustomersListSkeleton` mirrors the accordion + card layout (shimmer; respects `prefers-reduced-motion`).
- Refetch when `showInsertOne` or `loadCustomers` changes (via `useCustomersViewModel`); `dispatch(clearCustomerId())` on each run.
- HTTP goes through `readCompanyCustomersSnapshot` → `fetchCustomersByCompany`; normalization in `adaptCompanyCustomersApiResult`.

## Extending

Add API behavior in `apiCustomers` or extend the page `services/` / `adapters/`; keep the shell presentational.
