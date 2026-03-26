# Customers for area — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/CustomersForArea/` (page, hooks, components, segmentation, types).

**Date:** 2026-03-26

## 1. Component hierarchy

```
CustomersForArea (page)
├── CustomersForAreaConnectivityBar (device online/offline)
├── CustomersForAreaPendingBanner (when pending shipment orders exist)
├── Title + search
├── Loading: CustomersForAreaSkeleton
├── Error + retry
└── Sections (accordion ×2 + active list)
    └── CustomersForAreaCustomerCard (per row)
CustomersForAreaScrollTop (fixed, when window scrollY > threshold)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Customer list** | **IndexedDB only** — `getCustomersFromDB(areaId)` via `useCustomersForAreaCache`. No HTTP on this screen; list must be preloaded when shipment/areas are prepared. |
| **Segmentation** | Pure function `segmentCustomersForArea` + `useSegmentCustomersForArea` — merges cached rows with Redux shipment selectors: `selectCustomersWithFilledOrders`, `selectCustomersWithEmptyOrders`, `selectCustomersWithPendingOrders`. |
| **Navigation** | `goToRecordOrder` → `setCustomerId` / `setCustomerName` / `setCustomerPhoneNb` → `/recordOrderforCustomer` with `state.isExternal` from route. |
| **Session** | Accordion collapse per `areaId` via `sessionStorage` (`customersForAreaSessionKeys`). |

## 3. State management

- **Redux (read):** Shipment selectors for bucket membership; **not** loading customers from API here.
- **Redux (write):** Order slice customer fields set on navigate; **cleared** on each `useCustomersForAreaCache` reload (intended hygiene).
- **Local:** `searchTerm`, accordion collapsed state.

## 4. Async and offline

- **No network calls** in this feature. “Offline” UX is **device connectivity** (`useNavigatorOnline`) + copy that explains local data; list read can still fail if IndexedDB throws.
- **Retry:** User-triggered `reload()` re-reads IndexedDB.

## 5. `requestRaw` / RTK Query

- **Grep:** No `requestRaw` or `requestJson` in `CustomersForArea/`.
- **RTK Query migration** is **not applicable** to the list loader; data is cache-only. Any future HTTP prefetch would be a separate flow (e.g. shipment bootstrap), not a drop-in here.

## 6. UI / architecture notes (pre-change)

- Layout already uses `cfa-*` tokens and sections; opportunity to align **visual language** with other TRX shells (e.g. gradient page, elevated surface card) without changing behavior.
- `console.error` on IndexedDB failure — candidate for **dev-safe logger** (`createLogger`).

## 7. Risks to preserve

- Do not change segmentation precedence: **pending wins** over filled/empty for an id (`segmentCustomersForArea`).
- Preserve `sessionStorage` keys and defaults for accordion state.
- Preserve `routeState?.isExternal` on navigate to record order.

## 8. Follow-up (optional)

- Error boundary around page (non-blocking).
- Unit tests for `segmentCustomersForArea` (pure logic).
