# Customers list (`Customers.tsx`)

**Files:** `src/pages/SharedPages/viewCustomers/Customers.tsx`, `Customers.css`

## Purpose

Browse active and inactive customers, search, add a customer, and open update-customer per row.

## Layout classes

Dual classes keep legacy hooks (`customers-body`, `accordion-header`, …) while `vc-*` + `.customers-body.vc-shell` apply the enterprise shell.

## Behavior

- Refetch when `token`, `showInsertOne`, or `loadCustomers` changes; `dispatch(clearCustomerId())` on each run.
- RTK Query / API cache is not controlled from this file.

## Extending

Add API behavior in `apiCustomers`; keep toolbar and list semantics in this page unless extracting a shared “customer directory” layout later.
