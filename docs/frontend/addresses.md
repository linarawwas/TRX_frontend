# Addresses (`/addresses/:areaId`)

Lists customers in an area with search, optional drag-and-drop reorder, and persistence via `reorderCustomersInArea`.

## Data

- **Load:** `fetchCustomersByArea` → `sortCustomersBySequence` → local `customers` and `orderIds` (see `useAddressesAreaCustomers`).
- **Save order:** `reorderCustomersInArea` with `force: true`, `startAt: 1`.

## UX

- **List:** Name, address, status pill; **phone is not shown** on this screen. **Sequence** appears as a **side pin** (server order in browse mode; **draft position 1…n** while reordering).
- **Reorder mode:** Instruction banner, DnD (non-touch), compact up/down column; fixed apply/cancel bar at bottom.
- **Navigation:** Card links to `/updateCustomer/:id` when not in reorder mode.

## Architecture notes

- API layer uses `rtkResult` (`apiAreas`); no `requestRaw` on this page.
- Dev-safe logging: `createLogger("addresses-area-customers")` on fetch/reorder failures.

See [refactor baseline (Addresses)](../architecture/refactor-baseline-addresses.md).
