# Data Fetching Inventory

This inventory scans the frontend repository for data-fetching patterns.

Current policy:

- RTK Query (`trxApi`) is the only network transport layer.
- Feature modules call the RTK transport mutation via `rtkResult`.
- Raw `fetch` is limited to runtime/service-worker behavior.

Scope: `/src` and `/public/sw.js`.

## Status Alignment

This document uses the same status vocabulary as `docs/data-layer/PROBLEMS.md`:

- **Resolved**
- **Partially Resolved**
- **Open**

Current alignment snapshot:

- **Resolved:** transport unification to RTK wrappers and `ApiResult<T>` contract across auth/customers/orders/areas/shipments.
- **Partially Resolved:** UI/domain boundary separation (many screens are cleaner, some still orchestrate API in component/page files).
- **Open:** duplicate endpoint wrappers in some features and cross-feature contract migration outside requested scope (notably distributors).

## API Response Contract

Primary contract (RTK transport):

- `ApiResult<T> = { data: T | null; error: string | null }`.
- Every auth/customers/orders/areas/shipments API wrapper returns `ApiResult<T>` (no throws, no `{ ok, data }`).

Allowed exception contracts:

- Offline replay uses `rtkResult(...)` against normalized queued paths.
- RTK Query hooks: expose `{ data, error, isLoading }` from query state.

Examples (current standard):

- `const result = await fetchOrderById(token, orderId) // { data, error }`
- `if (result.error) { toast.error(result.error); return; }`
- `const orders = result.data || []`

Error handling guidelines:

- Never throw from domain API wrappers; return `error` string instead.
- Keep fallback messages domain-specific (user-facing when possible).
- On consumer side, gate all reads with `if (result.error || !result.data)` before accessing payload.

### Offline compatibility strategy

- Order submission uses `rtkResult` while online for unified error handling.
- When offline, requests are queued to IndexedDB (`saveRequest`) and replayed later.
- Replay is handled in `useSyncOfflineOrders` via `rtkResult(...)` after normalizing queued URLs to API paths.

Offline replay behavior details:

- Retry strategy: on network/runtime error, replay schedules a retry after 10 seconds; API status failures are surfaced and left in queue for later attempts.
- Queueing mechanism: requests are stored in IndexedDB with `{ id, url, options }` and removed only after successful replay.
- Payload structure: replay uses the exact stored `options.body` JSON payload (or raw body fallback) and preserves method/headers.
- Response handling: success removes queued item and updates pending-order Redux state; failure keeps queued item to avoid data loss.

## 1) Allowed raw `fetch(...)` usage (exceptions only)

No raw `fetch(...)` remains in `/src` application code.

| File path      | Type  | Method  | Endpoint                       | Usage location                   |
| -------------- | ----- | ------- | ------------------------------ | -------------------------------- |
| `public/sw.js` | fetch | runtime | request passthrough/cache flow | Service worker network strategy  |


## 2) RTK Query transport layer usage

`src/features/api/trxApi.ts` defines:

- feature query endpoints (e.g. shipments range/date queries)
- `transport` mutation endpoint used by `src/features/api/rtkTransport.ts`

`rtkTransport` is the unified gateway used by feature API modules:

- `rtkResult` for unified `{ data, error }` results

## 3) RTK Query endpoints

Defined in `src/features/api/trxApi.ts`:


| Endpoint key            | Method | URL                                                          | Consumers                                                  |
| ----------------------- | ------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `listShipmentsRange`    | POST   | `/api/shipments/range`                                       | `useTodayShipmentTotals`                                   |
| `shipmentsOrdersByDate` | GET    | `/api/shipments/orders/by-date?includeExternal=...&date=...` | pages/components using `useLazyShipmentsOrdersByDateQuery` |
| `transport`             | dynamic| dynamic                                                      | all feature API modules via `rtkResult`                   |


## 4) `API_BASE` usage inventory

`API_BASE` is sourced from `src/config/api.ts` and appears in transport infrastructure:

- `src/features/api/trxApi.ts` (RTK Query baseUrl)

## 5) Custom hooks performing API calls

### 6.1 Hooks with direct transport calls


| Hook file                                               | Type       | Method  | Endpoint                 | Usage location    |
| ------------------------------------------------------- | ---------- | ------- | ------------------------ | ----------------- |
| `src/features/orders/hooks/useRecordOrderController.ts` | hook+rtkResult | POST | `/api/orders` | Record order flow |
| `src/hooks/useSyncOfflineOrders.ts`                     | hook+rtkResult | dynamic | queued `request.url`     | Offline replay    |


### 6.2 Hooks delegating to feature API modules / RTK Query


| Hook file                                                      | Type               | Endpoint(s) via API layer                                                          | Usage location        |
| -------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- | --------------------- |
| `src/features/shipments/hooks/useStartShipmentController.tsx`  | hook->feature API  | `/api/days/name/${weekday}`, `/api/shipments`, `/api/shipments/preload/${dayId}`   | Start shipment modal  |
| `src/features/shipments/hooks/useTodayShipmentTotals.ts`       | hook->RTK Query    | `/api/shipments/range` (canonical `trxApi.listShipmentsRange`)                    | Dashboard totals      |
| `src/pages/SharedPages/Shipment/ShipmentsList.tsx`             | page->RTK Query    | `/api/shipments/range` via `useLazyListShipmentsRangeQuery`                        | Shipment list filtering |
| `src/features/orders/hooks/useOrdersByCustomer.ts`             | hook->feature API  | `/api/orders/customer/${customerId}` via `fetchCustomerOrders`                      | Customer orders view  |
| `src/features/customers/hooks/useCompanyAreas.ts`              | hook->feature API  | `/api/areas/company`                                                                  | Areas bootstrap in customer flows |
| `src/features/customers/hooks/useActiveAreaCustomers.ts`       | hook->feature API  | `/api/customers/area/${areaId}/active`                                                | Active customer placement list |
| `src/features/customers/hooks/useCreateCustomerWithSequence.ts`| hook->feature API  | `/api/customers/create-with-sequence`                                                 | Add customer submit |
| `src/features/customers/hooks/useUploadCustomersWithOrders.ts` | hook->feature API  | `/api/customers/uploadCustomersWithOrders`                                            | Bulk initials upload |
| `src/features/customers/hooks/useUpdateCustomerDiscount.ts`    | hook->feature API  | `/api/customers/${customerId}`                                                        | Discount update submit |
| `src/features/areas/hooks/useAreaCustomers.ts`                 | hook->feature API  | `/api/customers/area/${areaId}`                                                       | Area customer listing |
| `src/features/areas/hooks/useReorderAreaCustomers.ts`          | hook->feature API  | `/api/areas/${areaId}/reorder?companyId=${companyId}`                                | Area sequence reorder |
| `src/features/finance/hooks/useFinanceEntries.ts`              | hook->feature API  | `/api/finances?...`                                                                | Finance dashboard     |
| `src/features/finance/hooks/useDailySummary.ts`                | hook->feature API  | `/api/finances/summary/daily`                                                      | Finance dashboard     |
| `src/features/finance/hooks/useMonthlySummary.ts`              | hook->feature API  | `/api/finances/summary/monthly`                                                    | Finance dashboard     |
| `src/features/finance/hooks/useFinanceCategories.ts`           | hook->feature API  | `/api/finance-categories`                                                          | Finance dashboard     |
| `src/features/finance/hooks/useAddExpense.ts`                  | hook->feature API  | `/api/expenses`                                                                    | Expense creation flow |
| `src/features/finance/hooks/useAddProfit.ts`                   | hook->feature API  | `/api/extraProfits`                                                                | Profit creation flow  |
| `src/features/products/hooks/useProducts.ts`                   | hook->feature API  | `/api/products/company/${companyId}`, `/api/products/${productId}`                 | Products page         |
| `src/features/products/hooks/useAddProduct.ts`                 | hook->feature API  | `/api/products`                                                                    | Add product flow      |
| `src/features/customers/hooks/useUpdateCustomerController.ts`  | hook->feature APIs | `/api/customers/...`, `/api/areas/company`, `/api/customers/area/${areaId}/active` | Update customer page  |
| `src/features/distributors/hooks/useCompanyDistributorData.ts` | hook->feature APIs | distributors + customers + orders + products API endpoints                         | Distributors pages    |


