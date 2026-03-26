# Record order for customer — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/RecordOrderForCustomer/`, `src/components/Orders/RecordOrder/`, and `src/features/orders/hooks/useRecordOrderController.ts` (read-only for this slice unless coordinated).

**Date:** 2026-03-26

## 1. Component hierarchy

```
RecordOrderForCustomer (page)
├── Back row (navigate -1)
├── DiscountCard (when customerData?.hasDiscount)
└── RecordOrder
    ├── Stepper / form / checkout (internal)
    └── useRecordOrderController (hook)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Discount for banner** | IndexedDB `getCustomerDiscountFromDB(customerId)` — **not** HTTP in this page. Written elsewhere (`saveCustomerDiscountToDB` / sync flows). |
| **Products, cart, submit** | `useRecordOrderController` → Redux (`selectProducts`, `selectUserCompany`, shipment slice, etc.) → `requestJson` / offline queue inside controller — **not** `requestRaw` in `RecordOrder` components. |
| **Navigation** | `useNavigate`, `location.state` (`isExternal`). |

## 3. State management

- **Global:** Redux for catalog, company, user, shipment, offline queue (via controller).
- **Local page:** React `useState` for discount payload passed to `RecordOrder` as `customerData`.
- **No RTK Query** on this page today; migration of transport is centralized in `useRecordOrderController`, not in `RecordOrderForCustomer.tsx`.

## 4. Async and offline

- **Offline submit / replay:** Implemented in `useRecordOrderController` (`actuallySubmit`, queue, `navigate(-1)` once from `handleSubmit` — avoid double-back).
- **Discount:** Cache-only read; no network retry on this page. Failure = log + optional non-blocking error UI.

## 5. `requestRaw` usage

- **Grep:** No `requestRaw` in `RecordOrder` or `RecordOrderForCustomer`. Replacing `requestRaw` here is **not applicable**; any HTTP migration belongs at the controller / API layer.

## 6. UI inconsistencies (pre-refactor)

- Page shell used `record-order-for-customer-container` with partial layout tokens; discount strip and back control needed alignment with app spacing scale.
- `DiscountCard` used hardcoded Arabic strings instead of `t()`.

## 7. Risks to preserve

- Do not change submit payload shape, offline queue semantics, or navigation timing without tests.
- Discount `customerData` feeds checkout math in `useRecordOrderController` (`hasDiscount`, `valueAfterDiscount`).

## 8. Follow-up (later phases)

- Optional Error Boundary at page boundary.
- Broader RTK Query adoption only if product owners align with controller-level migration.

---

## Phase 1 (implemented) — page shell + discount cache hook

- **`useCustomerDiscountFromCache`:** Single place for IndexedDB discount load, toasts, and `createLogger` errors; exposes `loading` for UI skeleton.
- **`RecordOrderForCustomer`:** Layout classes `rofc-page` / `rofc-inner`, `dir`/`lang` on the shell; passes `rateLBP` into `DiscountCard`; removed dead imports.
- **i18n:** `recordOrderForCustomer.*` keys for cache toasts and `DiscountCard` copy (Arabic preserved).
- **No change** to `useRecordOrderController` submit/offline behavior in this phase.

---

**See also:** [Customers for area — baseline](./refactor-baseline-customers-for-area.md) (`CustomersForArea` feature: IndexedDB-only list, segmentation, no `requestRaw`).

**See also:** [Employee home — baseline](./refactor-baseline-employee-home.md) (`EmployeeHomePage`: Redux snapshots, IndexedDB pending count, `StartShipment` modal).

**See also:** [Today / Round snapshots — baseline](./refactor-baseline-snapshots.md) (`TodaySnapshot`, `RoundSnapshot`, `ProgressSnapshot`, `RoundsHistory`).

**See also:** [Areas for day — baseline](./refactor-baseline-areas-for-day.md) (`AreasForDay`: IndexedDB-only areas list, order `areaId` wiring).

**See also:** [Areas (company list) — baseline](./refactor-baseline-areas.md) (`/areas` Addresses hub: `fetchAreasByCompany`, `AddArea`).

**See also:** [Addresses (customers by area) — baseline](./refactor-baseline-addresses.md) (`/addresses/:areaId`, reorder, `fetchCustomersByArea`).
