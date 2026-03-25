# Data Fetching Inventory

This inventory scans the frontend repository for data-fetching patterns.

Current policy:

- `requestJson` is the primary app-level transport for feature APIs.
- RTK Query (`trxApi`) is used for query/caching-specific flows.
- Raw `fetch` and direct `apiClient` usage are limited to allowed infra/runtime cases.

Scope: `/src` and `/public/sw.js`.

## API Response Contract

Primary contract (requestJson):

- Success: returns the endpoint payload directly (typed generic), e.g. `T`.
- Failure: throws `ApiRequestError` with normalized `message`, `status`, and raw `body`.
- No `{ ok, data }` envelope in the requestJson-first path.

Allowed exception contracts:

- Offline replay uses `requestJson(...)` against normalized queued paths.
- RTK Query hooks: expose `{ data, error, isLoading }` from query state.

Examples (current standard):

- `const order = await requestJson<Order>(\`/api/orders/${orderId}\`, { token })`
- `const list = await requestJson<Order[]>(\`/api/orders/customer/${customerId}\`, { token })`
- `await requestJson("/api/orders", { method: "POST", jsonBody: payload, token })`

### Offline compatibility strategy

- Order submission uses `requestJson` while online for unified error handling.
- When offline, requests are queued to IndexedDB (`saveRequest`) and replayed later.
- Replay is handled in `useSyncOfflineOrders` via `requestJson(...)` after normalizing queued URLs to API paths.

## 1) Allowed raw `fetch(...)` usage (exceptions only)

No raw `fetch(...)` remains in `/src` application code.

| File path      | Type  | Method  | Endpoint                       | Usage location                   |
| -------------- | ----- | ------- | ------------------------------ | -------------------------------- |
| `public/sw.js` | fetch | runtime | request passthrough/cache flow | Service worker network strategy  |


## 2) Direct `apiClient` (`axios`) usage

### 2.1 Legacy/exception wrappers (`src/features/**`)


| File path                                | Type  | Method | Endpoint                                              | Usage location              |
| ---------------------------------------- | ----- | ------ | ----------------------------------------------------- | --------------------------- |
| `src/features/auth/api.ts`               | axios | POST   | `/api/auth/login`, `/api/auth/register`               | Auth API wrappers           |
| `src/features/customers/api.ts`          | axios | GET/POST/PUT | customers + areas endpoints                      | Customer form API wrappers  |
| `src/features/products/api.ts`           | axios | GET/PUT| `/api/adminDeterminedDefaults/*`                      | Defaults API wrappers       |
| `src/features/areas/api.ts`              | axios | GET/POST | `/api/days`, `/api/areas`, `/api/customers/area/*`  | Area UI API wrappers        |
| `src/features/finance/api.ts`            | axios | GET    | `/api/exchange-rate`                                  | Exchange-rate helper        |
| `src/features/orders/api.ts`             | axios | GET    | `/api/orders/customer/${customerId}`                  | Customer orders API         |
| `src/features/shipments/api.ts`          | axios | GET    | `/api/shipments/${shipmentId}/rounds`                 | Rounds history helper       |
| `src/features/products/apiProducts.ts`   | axios | GET    | `/api/products/company/${companyId}`                  | Product list API            |
| `src/features/products/apiProducts.ts`   | axios | DELETE | `/api/products/${productId}`                          | Product delete API          |
| `src/features/products/apiProducts.ts`   | axios | POST   | `/api/products`                                       | Product create API          |
| `src/features/products/apiProducts.ts`   | axios | PUT    | `/api/products/${productId}`                          | Product update API          |
| `src/features/orders/apiOrders.ts`       | axios | GET    | `/api/orders/company/${companyId}`                    | Company orders API          |
| `src/features/areas/apiAreas.ts`         | axios | GET    | `/api/areas/company`                                  | Areas by company API        |
| `src/features/areas/apiAreas.ts`         | axios | POST   | `/api/areas/days/${dayId}`                            | Areas by day API            |
| `src/features/areas/apiAreas.ts`         | axios | GET    | `/api/customers/area/${areaId}`                       | Customers by area API       |
| `src/features/areas/apiAreas.ts`         | axios | POST   | `/api/areas/${areaId}/reorder?companyId=${companyId}` | Area reorder API            |
| `src/features/finance/apiFinance.ts`     | axios | GET    | `/api/expenses`                                       | Expense list API            |
| `src/features/finance/apiFinance.ts`     | axios | DELETE | `/api/expenses/${expenseId}`                          | Expense delete API          |
| `src/features/finance/apiFinance.ts`     | axios | GET    | `/api/extraProfits`                                   | Profit list API             |
| `src/features/finance/apiFinance.ts`     | axios | DELETE | `/api/extraProfits/${profitId}`                       | Profit delete API           |
| `src/features/finance/apiFinance.ts`     | axios | POST   | `/api/expenses`                                       | Expense create API          |
| `src/features/finance/apiFinance.ts`     | axios | POST   | `/api/extraProfits`                                   | Profit create API           |
| `src/features/finance/apiFinance.ts`     | axios | PUT    | `/api/expenses/${expenseId}`                          | Expense update API          |
| `src/features/finance/apiFinance.ts`     | axios | PUT    | `/api/extraProfits/${profitId}`                       | Profit update API           |


### 2.2 UI components with direct `apiClient` calls


| File path                                                    | Type  | Method | Endpoint                                                       | Usage location            |
| ------------------------------------------------------------ | ----- | ------ | -------------------------------------------------------------- | ------------------------- |
| `src/components/Products/DefaultProduct.tsx`                 | axios | GET    | `${API_BASE}/api/adminDeterminedDefaults/company/${companyId}` | Default product read UI   |
| `src/components/Products/UpdateDefaultProduct.tsx`           | axios | PUT    | `${API_BASE}/api/adminDeterminedDefaults/defaultProduct`       | Default product update UI |


## 3) Primary transport (`requestJson`) usage

`requestJson` is implemented in `src/features/api/http.ts` and is the canonical normalized transport (headers + parsing + error shaping) used by:

- `src/features/customers/apiCustomers.ts`
- `src/features/distributors/apiDistributors.ts`
- `src/features/orders/apiOrders.ts`
- `src/features/shipments/apiShipments.ts`
- `src/features/finance/apiFinance.ts`

It centralizes:

- base URL resolution via `apiUrl()`
- standardized auth header injection
- centralized JSON parse and error normalization

## 4) RTK Query endpoints

Defined in `src/features/api/trxApi.ts`:


| Endpoint key            | Method | URL                                                          | Consumers                                                  |
| ----------------------- | ------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `listShipmentsRange`    | POST   | `/api/shipments/range`                                       | `useTodayShipmentTotals`                                   |
| `shipmentsOrdersByDate` | GET    | `/api/shipments/orders/by-date?includeExternal=...&date=...` | pages/components using `useLazyShipmentsOrdersByDateQuery` |


## 5) `API_BASE` usage inventory

`API_BASE` is sourced from `src/config/api.ts` and appears in transport infrastructure:

- `src/api/client.ts` (`apiClient` baseURL)
- `src/features/api/http.ts` (`requestJson` baseURL + `apiUrl`)
- `src/features/api/trxApi.ts` (RTK Query baseUrl)

## 6) Custom hooks performing API calls

### 6.1 Hooks with direct transport calls


| Hook file                                               | Type       | Method  | Endpoint                 | Usage location    |
| ------------------------------------------------------- | ---------- | ------- | ------------------------ | ----------------- |
| `src/features/orders/hooks/useRecordOrderController.ts` | hook+requestJson | POST | `/api/orders` | Record order flow |
| `src/hooks/useSyncOfflineOrders.ts`                     | hook+requestJson | dynamic | queued `request.url`     | Offline replay    |


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


