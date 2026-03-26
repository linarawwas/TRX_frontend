# Addresses (customers by area) — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/Addresses/Addresses.tsx`, `Addresses.css`, `hooks/useAddressesAreaCustomers.ts` (extracted). Uses `features/areas/apiAreas` (`fetchCustomersByArea`, `reorderCustomersInArea`), `sortCustomersBySequence`.

**Date:** 2026-03-26

## 1. Component hierarchy

```
Addresses
├── ToastContainer
├── Header: title, search, reorder toggle
├── Loading | Error | Empty | List of customer cards
│   └── Each card: Link to /updateCustomer/:id OR reorder controls (DnD + up/down)
└── Fixed apply/cancel bar when reorderMode
```

## 2. Data flow

| Concern | Path |
|--------|------|
| **List load** | `fetchCustomersByArea(token, areaId)` → `sortCustomersBySequence` → local `customers` + `orderIds`. |
| **Reorder persist** | `reorderCustomersInArea(token, areaId, companyId, orderIds, { force, startAt })` on Apply; toasts on success/failure. |
| **Auth / scope** | `selectUserToken`, `selectUserCompanyId`; `areaId` from `useParams`. |

## 3. `requestRaw`

- **Not used** — `apiAreas` uses `rtkResult` / shared transport.

## 4. Risks to preserve

- **Cancel reorder** — Current behavior resets `orderIds` from `customers.map` (same as before); no snapshot restore unless product changes.
- **DnD** — `filtered` indices map to visible rows; `orderIds` / `customers` updated together.
- **Links** — `/updateCustomer/${id}` when not in reorder mode.
- **Search** — Filters `filtered` by name; reorder operates on visible subset for drag indices.

## 5. UI notes (pre-change)

- Single-file fetch + large component; opportunity to extract hook and add retry for load errors.
- Shell alignment with other TRX pages (gradient + surface).
