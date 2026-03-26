# Customers for area

**Route:** `/customers/:areaId`  
**Source:** [CustomersForArea.tsx](../../src/pages/SharedPages/CustomersForArea/CustomersForArea.tsx)

## Purpose

Lists **cached customers** for one **area**, grouped by **shipment order state** (pending sync vs completed filled/empty vs not yet visited). Tapping a customer **sets order slice fields** and navigates to **record order**.

## Data (behavior contract)

- **IndexedDB:** `getCustomersFromDB(areaId)` — no REST calls on this screen.
- **Redux (shipment):** `selectCustomersWithFilledOrders`, `selectCustomersWithEmptyOrders`, `selectCustomersWithPendingOrders` — drive segmentation.
- **Redux (order):** On cache load, **clear** customer id/name/phone; on row tap **set** id/name/phone, then `navigate("/recordOrderforCustomer", { state: { isExternal } })`.

## Components (extracted)

| Piece | Role |
|-------|------|
| `CustomersForAreaConnectivityBar` | Device online/offline (`useNavigatorOnline`) |
| `CustomersForAreaPendingBanner` | When any customer is in “pending order” bucket — count + online/offline copy |
| `CustomersForAreaCustomerCard` | Memoized tappable row (`pending` / `filled` / `empty` / `default`) |
| `CustomersForAreaSkeleton` | Loading |
| `CustomersForAreaScrollTop` | FAB scroll-to-top |

## Hooks

| Hook | Role |
|------|------|
| `useCustomersForAreaCache` | IDB load + clear order fields + `reload` |
| `useSegmentCustomersForArea` | Memoized `segmentCustomersForArea(...)` |
| `useScrollTopVisibility` | Scroll listener for FAB |

## Design notes

- **Connectivity** is always visible; **pending-order** banner is additional when relevant (different meanings).
- **Retry** on IndexedDB read failure; **scroll-top** uses a dedicated `aria-label` (`customersForArea.scrollTop`).
- Accordion collapse state is **per `areaId`** in `sessionStorage`; state **resyncs when `areaId` changes**.
