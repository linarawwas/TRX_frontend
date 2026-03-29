# Usage Graph

Component/page/hook to API dependency graph (static code mapping).
Primary transport is RTK Query (`trxApi`) via feature endpoints and shared `rtkResult` wrappers.

## API Response Contract

- `ApiResult<T>`: wrappers return `{ data: T | null, error: string | null }`.
- RTK Query: read `{ data, error, isLoading }` from query hooks.
- Legacy `{ ok, data }` envelopes are removed from auth/customers/orders/areas/shipments wrappers.

### Offline compatibility strategy

- Online writes use `rtkResult` for consistent error handling.
- Offline writes are queued and replayed with `rtkResult` in `useSyncOfflineOrders` after queued URL normalization.
- Replay removes queue entries only after success and keeps failed entries for future retries.

## Pages

| Component/Page | API dependency |
|---|---|
| `src/pages/SharedPages/Login/LoginForm.tsx` | `loginUser` -> `POST /api/auth/login` (`ApiResult`) |
| `src/pages/AdminPages/ProductsList/Products.tsx` | via `useProducts` -> `/api/products/company/${companyId}`, `/api/products/${productId}` and direct `updateProduct` -> `/api/products/${productId}` |
| `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx` | `useFinanceCategories` -> `/api/finance-categories`; `useDailySummary` -> `/api/finances/summary/daily`; `useMonthlySummary` -> `/api/finances/summary/monthly`; `useFinanceEntries` -> `/api/finances?...`; mutations via `createFinance/updateFinance/deleteFinance` |
| `src/pages/EmployeePages/EmployeeHomePage/` | no HTTP in page shell; offline queue via `services/pendingQueueRead.service.ts` → IndexedDB `getPendingRequests`; KPIs in child snapshots (Redux) |

## Components (domain dependency from component file)

| Component | API dependency |
|---|---|
| `src/components/Auth/Register.tsx` | auth feature API helper -> `POST /api/auth/register` |
| `src/components/Customers/AddCustomers/AddCustomers.tsx` | customers feature API helper -> `POST /api/customers/many` |
| `src/components/Customers/AddCustomer/AddCustomer.tsx` | customers/areas feature API helpers for area bootstrap + create customer |
| `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx` | customers feature API helper for upload flow |
| `src/components/Areas/AddArea/AddArea.tsx` | areas feature API helpers for day bootstrap + area creation |
| `src/components/AddDiscount/AddDiscount.tsx` | discount/customer/area API helpers |
| `src/components/AreaSequencePicker/AreaSequencePicker.tsx` | area customers + reorder helpers |
| `src/components/Shipments/RoundsHistory/RoundsHistory.tsx` | `fetchShipmentRounds` -> `GET /api/shipments/${shipmentId}/rounds` (`ApiResult`) |
| `src/components/Products/DefaultProduct.tsx` | `GET /api/adminDeterminedDefaults/company/${companyId}` |
| `src/components/Products/UpdateDefaultProduct.tsx` | `PUT /api/adminDeterminedDefaults/defaultProduct` |

## Feature Hooks (direct or delegated)

| Hook | API dependency |
|---|---|
| `src/features/orders/hooks/useRecordOrderController.ts` | `rtkResult` `POST /api/orders`; delegated `fetchAndCacheCustomerInvoice` -> `/api/customers/reciept/${customerId}` |
| `src/hooks/useSyncOfflineOrders.ts` | dynamic replay via `rtkResult(normalizedPath, replayOptions)` |
| `src/features/shipments/hooks/useStartShipmentController.tsx` | `fetchDayByWeekday` -> `/api/days/name/${weekday}`; `createRoundOrShipment` -> `/api/shipments`; `preloadShipmentData` -> `/api/shipments/preload/${dayId}` |
| `src/features/shipments/hooks/useTodayShipmentTotals.ts` | RTK Query `POST /api/shipments/range` (canonical owner: `trxApi.listShipmentsRange`) |
| `src/pages/SharedPages/Shipment/ShipmentsList.tsx` | `useLazyListShipmentsRangeQuery` -> RTK Query `POST /api/shipments/range` |
| `src/features/finance/hooks/useFinanceEntries.ts` | `listFinances` -> `/api/finances?...` |
| `src/features/finance/hooks/useDailySummary.ts` | `dailySummary` -> `/api/finances/summary/daily` |
| `src/features/finance/hooks/useMonthlySummary.ts` | `monthlySummary` -> `/api/finances/summary/monthly` |
| `src/features/finance/hooks/useFinanceCategories.ts` | `listCategories` -> `/api/finance-categories` |
| `src/features/finance/hooks/useAddExpense.ts` | `createExpense` -> `POST /api/expenses` |
| `src/features/finance/hooks/useAddProfit.ts` | `createExtraProfit` -> `POST /api/extraProfits` |
| `src/features/products/hooks/useProducts.ts` | `listCompanyProducts` -> `GET /api/products/company/${companyId}`; `deleteProductById` -> `DELETE /api/products/${productId}` |
| `src/features/products/hooks/useAddProduct.ts` | `createProduct` -> `POST /api/products` |
| `src/features/orders/hooks/useOrdersByCustomer.ts` | `fetchCustomerOrders` -> `GET /api/orders/customer/${customerId}` (`ApiResult`) |
| `src/features/customers/hooks/useUpdateCustomerController.ts` | customer APIs (`/api/customers/...`) + areas API (`/api/areas/company`) + active customers by area |
| `src/features/distributors/hooks/useCompanyDistributorData.ts` | distributors APIs + customers company + orders company + products company |

## Domain Hooks Layer

| Domain Hook | Primary responsibility | Consumers |
|---|---|---|
| `src/features/customers/hooks/useCompanyAreas.ts` | load company areas once and share area options state | `AddCustomer`, `AddCustomerInitials`, `AddDiscount` |
| `src/features/customers/hooks/useActiveAreaCustomers.ts` | fetch active placement list for selected area | `AddCustomer` |
| `src/features/customers/hooks/useCreateCustomerWithSequence.ts` | submit create-customer payload with sequence placement | `AddCustomer` |
| `src/features/customers/hooks/useUploadCustomersWithOrders.ts` | upload customer initials/orders batch | `AddCustomerInitials` |
| `src/features/customers/hooks/useUpdateCustomerDiscount.ts` | apply discount updates for selected customer | `AddDiscount` |
| `src/features/customers/hooks/useUpdateCustomerController.ts` | orchestrate update-customer page data/mutations | `UpdateCustomer` |
| `src/features/orders/hooks/useOrdersByCustomer.ts` | load customer order history for UI rendering | `CustomerOrders` |
| `src/features/areas/hooks/useAreaCustomers.ts` | shared customers-by-area query state | `AddDiscount`, `AreaSequencePicker` |
| `src/features/areas/hooks/useReorderAreaCustomers.ts` | submit area sequence reorder mutations | `AreaSequencePicker` |

## API Layer Nodes

| API module | Downstream transport |
|---|---|
| `src/features/api/trxApi.ts` | RTK Query `fetchBaseQuery` with `baseUrl: API_BASE` + bearer token; single source of truth for `/api/shipments/range` |
| `src/features/api/rtkTransport.ts` | shared wrappers over `trxApi.transport` (`rtkResult`) |
| `src/features/*/api*.ts` | RTK-transport feature modules (no direct client transport calls) |

## Runtime Network Node

| Runtime file | Network behavior |
|---|---|
| `public/sw.js` | fetch passthrough + cache behavior for request lifecycle |

