# Usage Graph

Component/page/hook to API dependency graph (static code mapping).
Primary transport is `requestJson` (plus RTK Query where applicable); `apiClient` entries are legacy/exception paths.

## Pages

| Component/Page | API dependency |
|---|---|
| `src/pages/SharedPages/Login/LoginForm.tsx` | `POST /api/auth/login` (direct `fetch`) |
| `src/pages/AdminPages/ProductsList/Products.tsx` | via `useProducts` -> `/api/products/company/${companyId}`, `/api/products/${productId}` and direct `updateProduct` -> `/api/products/${productId}` |
| `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx` | `useFinanceCategories` -> `/api/finance-categories`; `useDailySummary` -> `/api/finances/summary/daily`; `useMonthlySummary` -> `/api/finances/summary/monthly`; `useFinanceEntries` -> `/api/finances?...`; mutations via `createFinance/updateFinance/deleteFinance` |
| `src/pages/EmployeePages/EmployeeHomePage/EmployeeHomePage.tsx` | no direct transport (composes children) |

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
| `src/components/Shipments/RoundsHistory/RoundsHistory.tsx` | `fetchShipmentRounds` -> `GET /api/shipments/${shipmentId}/rounds` (`apiClient`) |
| `src/components/Products/DefaultProduct.tsx` | `GET /api/adminDeterminedDefaults/company/${companyId}` |
| `src/components/Products/UpdateDefaultProduct.tsx` | `PUT /api/adminDeterminedDefaults/defaultProduct` |

## Feature Hooks (direct or delegated)

| Hook | API dependency |
|---|---|
| `src/features/orders/hooks/useRecordOrderController.ts` | direct `POST /api/orders`; delegated `fetchAndCacheCustomerInvoice` -> `/api/customers/reciept/${customerId}` |
| `src/hooks/useSyncOfflineOrders.ts` | dynamic replay `fetch(request.url, request.options)` |
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
| `src/features/orders/hooks/useOrdersByCustomer.ts` | `fetchCustomerOrders` -> `GET /api/orders/customer/${customerId}` (`apiClient`) |
| `src/features/customers/hooks/useUpdateCustomerController.ts` | customer APIs (`/api/customers/...`) + areas API (`/api/areas/company`) + active customers by area |
| `src/features/distributors/hooks/useCompanyDistributorData.ts` | distributors APIs + customers company + orders company + products company |

## API Layer Nodes

| API module | Downstream transport |
|---|---|
| `src/features/api/trxApi.ts` | RTK Query `fetchBaseQuery` with `baseUrl: API_BASE` + bearer token; single source of truth for `/api/shipments/range` |
| `src/features/api/http.ts` | `requestJson`/`requestRaw` transport + shared auth/error normalization |
| `src/features/*/api*.ts` | requestJson-first API modules; some legacy `apiClient` wrappers remain |

## Runtime Network Node

| Runtime file | Network behavior |
|---|---|
| `public/sw.js` | fetch passthrough + cache behavior for request lifecycle |

