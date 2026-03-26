# Addresses (`/addresses/:areaId`)

Lists customers in an area with search, optional drag-and-drop reorder, and persistence via `reorderCustomersInArea`.

## Data

- **Load:** `fetchCustomersByArea` → `sortCustomersBySequence` → local `customers` and `orderIds` (see `useAddressesAreaCustomers`).
- **Save order:** `reorderCustomersInArea` with `force: true`, `startAt: 1`.

## UX

- **Reorder mode:** Toggle enables DnD (non-touch) and up/down controls; fixed apply/cancel bar at bottom.
- **Navigation:** Card links to `/updateCustomer/:id` when not in reorder mode.

## Architecture notes

- API layer uses `rtkResult` (`apiAreas`); no `requestRaw` on this page.
- Dev-safe logging: `createLogger("addresses-area-customers")` on fetch/reorder failures.

See [refactor baseline (Addresses)](../architecture/refactor-baseline-addresses.md).
