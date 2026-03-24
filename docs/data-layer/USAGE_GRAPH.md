# Usage Graph

Component/page/hook to API dependency graph (static code mapping).

## Pages

| Component/Page | API dependency |
|---|---|
| `src/pages/SharedPages/Login/LoginForm.tsx` | `POST /api/auth/login` (direct `fetch`) |
| `src/pages/AdminPages/ProductsList/Products.tsx` | via `useProducts` -> `/api/products/company/${companyId}`, `/api/products/${productId}` and direct `updateProduct` -> `/api/products/${productId}` |
| `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx` | `useFinanceCategories` -> `/api/finance-categories`; `useDailySummary` -> `/api/finances/summary/daily`; `useMonthlySummary` -> `/api/finances/summary/monthly`; `useFinanceEntries` -> `/api/finances?...`; mutations via `createFinance/updateFinance/deleteFinance` |
| `src/pages/EmployeePages/EmployeeHomePage/EmployeeHomePage.tsx` | no direct transport (composes children) |

## Components (direct transport in component file)

| Component | API dependency |
|---|---|
| `src/components/Auth/Register.tsx` | `POST /api/auth/register` |
| `src/components/Customers/AddCustomers/AddCustomers.tsx` | `POST /api/customers/many` |
| `src/components/Customers/AddCustomer/AddCustomer.tsx` | `GET /api/areas/company`, `GET /api/customers/area/${id}/active`, `POST /api/customers/create-with-sequence` |
| `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx` | `GET /api/areas/company`, `POST /api/customers/uploadCustomersWithOrders` |
| `src/components/Areas/AddArea/AddArea.tsx` | `GET /api/days`, `POST /api/areas` |
| `src/components/AddDiscount/AddDiscount.tsx` | `GET /api/areas/company`, `GET /api/exchange-rate`, `GET /api/customers/area/${id}`, `PUT /api/customers/${id}` |
| `src/components/AreaSequencePicker/AreaSequencePicker.tsx` | `GET /api/customers/area/${id}`, `POST /api/areas/${id}/reorder?companyId=${companyId}` |
| `src/components/Shipments/RoundsHistory/RoundsHistory.tsx` | `GET /api/shipments/${shipmentId}/rounds` |
| `src/components/Customers/CustomerOrders/CustomerOrders.tsx` | `GET /api/orders/customer/${customerId}` |
| `src/components/Products/DefaultProduct.tsx` | `GET /api/adminDeterminedDefaults/company/${companyId}` |
| `src/components/Products/UpdateDefaultProduct.tsx` | `PUT /api/adminDeterminedDefaults/defaultProduct` |

## Feature Hooks (direct or delegated)

| Hook | API dependency |
|---|---|
| `src/features/orders/hooks/useRecordOrderController.ts` | direct `POST /api/orders`; delegated `fetchAndCacheCustomerInvoice` -> `/api/customers/reciept/${customerId}` |
| `src/hooks/useSyncOfflineOrders.ts` | dynamic replay `fetch(request.url, request.options)` |
| `src/features/shipments/hooks/useStartShipmentController.tsx` | `fetchDayByWeekday` -> `/api/days/name/${weekday}`; `createRoundOrShipment` -> `/api/shipments`; `preloadShipmentData` -> `/api/shipments/preload/${dayId}` |
| `src/features/shipments/hooks/useTodayShipmentTotals.ts` | RTK Query `POST /api/shipments/range` |
| `src/features/finance/hooks/useFinanceEntries.ts` | `listFinances` -> `/api/finances?...` |
| `src/features/finance/hooks/useDailySummary.ts` | `dailySummary` -> `/api/finances/summary/daily` |
| `src/features/finance/hooks/useMonthlySummary.ts` | `monthlySummary` -> `/api/finances/summary/monthly` |
| `src/features/finance/hooks/useFinanceCategories.ts` | `listCategories` -> `/api/finance-categories` |
| `src/features/finance/hooks/useAddExpense.ts` | `createExpense` -> `POST /api/expenses` |
| `src/features/finance/hooks/useAddProfit.ts` | `createExtraProfit` -> `POST /api/extraProfits` |
| `src/features/products/hooks/useProducts.ts` | `listCompanyProducts` -> `GET /api/products/company/${companyId}`; `deleteProductById` -> `DELETE /api/products/${productId}` |
| `src/features/products/hooks/useAddProduct.ts` | `createProduct` -> `POST /api/products` |
| `src/features/customers/hooks/useUpdateCustomerController.ts` | customer APIs (`/api/customers/...`) + areas API (`/api/areas/company`) + active customers by area |
| `src/features/distributors/hooks/useCompanyDistributorData.ts` | distributors APIs + customers company + orders company + products company |

## API Layer Nodes

| API module | Downstream transport |
|---|---|
| `src/features/api/trxApi.ts` | RTK Query `fetchBaseQuery` with `baseUrl: API_BASE` + bearer token |
| `src/features/api/http.ts` | `fetch(apiUrl(path), ...)` + axios config helpers (`baseURL: API_BASE`) |
| `src/features/*/api*.ts` | mostly `axios` and `requestJson` wrappers over `/api/...` |

## Runtime Network Node

| Runtime file | Network behavior |
|---|---|
| `public/sw.js` | fetch passthrough + cache behavior for request lifecycle |

