# Update customer (`/updateCustomer/:customerId`)

Edit customer profile, view balance/invoices, adjust area sequence, assign distributor, deactivate/restore/hard-delete (admin).

## Data

- **Controller:** `useUpdateCustomerController` — loads customer, areas, placement peers; owns modals and tab state.
- **APIs:** `apiCustomers` (`rtkResult`), `fetchAreasByCompany`, IndexedDB invoice cache.

## UX

- **Tabs:** البيانات (info), الرصيد (invoices), الترتيب (area, when area present).
- **Loading:** Page skeleton until customer fetch completes; `CustomerInfo` may still show inline loader when nested loading is used elsewhere.

## Extension

- Add strings under `updateCustomer.*` in `utils/i18n.ts`.
- Prefer new side effects in the hook, not in `UpdateCustomer.tsx`.

See [architecture baseline](../architecture/refactor-baseline-update-customer.md).

**Constituents map:** [refactor-baseline-update-customer-constituents.md](../architecture/refactor-baseline-update-customer-constituents.md).
