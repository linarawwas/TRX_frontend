# Data Fetching Inventory

This inventory scans the frontend repository for data-fetching patterns:

- `fetch(...)`
- `axios`
- `API_BASE`
- custom hooks that perform API calls (directly or via feature API modules)

Scope: `/src` and `/public/sw.js`.

## 1) Direct `fetch(...)` in components/pages/hooks/runtime

| File path | Type | Method | Endpoint | Usage location |
|---|---|---:|---|---|
| `src/pages/SharedPages/Login/LoginForm.tsx` | fetch | POST | `${API_BASE}/api/auth/login` | Login form submit |
| `src/components/Auth/Register.tsx` | fetch | POST | `${API_BASE}/api/auth/register` | Register form submit |
| `src/components/Customers/AddCustomers/AddCustomers.tsx` | fetch | POST | `${API_BASE}/api/customers/many` | Bulk customer upload UI |
| `src/components/Customers/AddCustomer/AddCustomer.tsx` | fetch | GET | `${API_BASE}/api/areas/company` | Add-customer form bootstrap |
| `src/components/Customers/AddCustomer/AddCustomer.tsx` | fetch | GET | `${API_BASE}/api/customers/area/${currentAreaId}/active` | Placement list bootstrap |
| `src/components/Customers/AddCustomer/AddCustomer.tsx` | fetch | POST | `${API_BASE}/api/customers/create-with-sequence` | Add-customer submit |
| `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx` | fetch | GET | `${API_BASE}/api/areas/company` | Area list for upload form |
| `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx` | fetch | POST | `${API_BASE}/api/customers/uploadCustomersWithOrders` | Customers+orders upload submit |
| `src/components/Areas/AddArea/AddArea.tsx` | fetch | GET | `${API_BASE}/api/days` | Add-area form bootstrap |
| `src/components/Areas/AddArea/AddArea.tsx` | fetch | POST | `${API_BASE}/api/areas` | Add-area submit |
| `src/components/AddDiscount/AddDiscount.tsx` | fetch | GET | `${API_BASE}/api/areas/company` | Discount form area list |
| `src/components/AddDiscount/AddDiscount.tsx` | fetch | GET | `${API_BASE}/api/exchange-rate` | Discount form exchange-rate read |
| `src/components/AddDiscount/AddDiscount.tsx` | fetch | GET | `${API_BASE}/api/customers/area/${formData.areaId}` | Discount form customer list |
| `src/components/AddDiscount/AddDiscount.tsx` | fetch | PUT | `${API_BASE}/api/customers/${formData.customerId}` | Discount update submit |
| `src/components/AreaSequencePicker/AreaSequencePicker.tsx` | fetch | GET | `${API_BASE}/api/customers/area/${areaId}` | Sequence picker customer list |
| `src/components/AreaSequencePicker/AreaSequencePicker.tsx` | fetch | POST | `${API_BASE}/api/areas/${areaId}/reorder?companyId=${companyId}` | Sequence reorder apply |
| `src/components/Shipments/RoundsHistory/RoundsHistory.tsx` | fetch | GET | `${API_BASE}/api/shipments/${shipmentId}/rounds` | Rounds timeline |
| `src/features/orders/hooks/useRecordOrderController.ts` | fetch | POST | `${API_BASE}/api/orders` | Record order submit (online path) |
| `src/hooks/useSyncOfflineOrders.ts` | fetch | dynamic | `request.url` (queued offline requests) | Offline replay sync hook |
| `src/features/api/http.ts` | fetch | configurable | `apiUrl(path)` | Shared transport layer for `requestJson` |
| `public/sw.js` | fetch | runtime | request passthrough/cache flow | Service worker network strategy |

## 2) Direct `axios` usage

### 2.1 Feature API modules (`src/features/**`)

| File path | Type | Method | Endpoint | Usage location |
|---|---|---:|---|---|
| `src/features/shipments/apiShipments.ts` | axios | POST | `/api/shipments/range` | Shipment range query helper |
| `src/features/products/apiProducts.ts` | axios | GET | `/api/products/company/${companyId}` | Product list API |
| `src/features/products/apiProducts.ts` | axios | DELETE | `/api/products/${productId}` | Product delete API |
| `src/features/products/apiProducts.ts` | axios | POST | `/api/products` | Product create API |
| `src/features/products/apiProducts.ts` | axios | PUT | `/api/products/${productId}` | Product update API |
| `src/features/orders/apiOrders.ts` | axios | GET | `/api/orders/company/${companyId}` | Company orders API |
| `src/features/areas/apiAreas.ts` | axios | GET | `/api/areas/company` | Areas by company API |
| `src/features/areas/apiAreas.ts` | axios | POST | `/api/areas/days/${dayId}` | Areas by day API |
| `src/features/areas/apiAreas.ts` | axios | GET | `/api/customers/area/${areaId}` | Customers by area API |
| `src/features/areas/apiAreas.ts` | axios | POST | `/api/areas/${areaId}/reorder?companyId=${companyId}` | Area reorder API |
| `src/features/finance/apiFinance.ts` | axios | GET | `/api/expenses` | Expense list API |
| `src/features/finance/apiFinance.ts` | axios | DELETE | `/api/expenses/${expenseId}` | Expense delete API |
| `src/features/finance/apiFinance.ts` | axios | GET | `/api/extraProfits` | Profit list API |
| `src/features/finance/apiFinance.ts` | axios | DELETE | `/api/extraProfits/${profitId}` | Profit delete API |
| `src/features/finance/apiFinance.ts` | axios | POST | `/api/expenses` | Expense create API |
| `src/features/finance/apiFinance.ts` | axios | POST | `/api/extraProfits` | Profit create API |
| `src/features/finance/apiFinance.ts` | axios | PUT | `/api/expenses/${expenseId}` | Expense update API |
| `src/features/finance/apiFinance.ts` | axios | PUT | `/api/extraProfits/${profitId}` | Profit update API |

### 2.2 UI components with direct axios

| File path | Type | Method | Endpoint | Usage location |
|---|---|---:|---|---|
| `src/components/Products/DefaultProduct.tsx` | axios | GET | `${API_BASE}/api/adminDeterminedDefaults/company/${companyId}` | Default product read UI |
| `src/components/Products/UpdateDefaultProduct.tsx` | axios | PUT | `${API_BASE}/api/adminDeterminedDefaults/defaultProduct` | Default product update UI |
| `src/components/Customers/CustomerOrders/CustomerOrders.tsx` | axios | GET | `${API_BASE}/api/orders/customer/${customerId}` | Customer orders UI |

## 3) Shared request layer (`requestJson`) usage

`requestJson` is implemented in `src/features/api/http.ts` and used across feature APIs:

- `src/features/customers/apiCustomers.ts`
- `src/features/distributors/apiDistributors.ts`
- `src/features/orders/apiOrders.ts`
- `src/features/shipments/apiShipments.ts`
- `src/features/finance/apiFinance.ts`

It centralizes:

- base URL resolution via `apiUrl()`
- auth header injection for non-RTK requests
- JSON parse/error normalization

## 4) RTK Query endpoints

Defined in `src/features/api/trxApi.ts`:

| Endpoint key | Method | URL | Consumers |
|---|---:|---|---|
| `listShipmentsRange` | POST | `/api/shipments/range` | `useTodayShipmentTotals` |
| `shipmentsOrdersByDate` | GET | `/api/shipments/orders/by-date?includeExternal=...&date=...` | pages/components using `useLazyShipmentsOrdersByDateQuery` |

## 5) `API_BASE` usage inventory

`API_BASE` is sourced from `src/config/api.ts` and appears in:

- `src/features/api/http.ts` (axios config baseURL + `apiUrl`)
- `src/features/api/trxApi.ts` (RTK Query baseUrl)
- direct UI calls:
  - `src/pages/SharedPages/Login/LoginForm.tsx`
  - `src/components/Auth/Register.tsx`
  - `src/components/Customers/AddCustomers/AddCustomers.tsx`
  - `src/components/Customers/AddCustomer/AddCustomer.tsx`
  - `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx`
  - `src/components/Areas/AddArea/AddArea.tsx`
  - `src/components/AddDiscount/AddDiscount.tsx`
  - `src/components/AreaSequencePicker/AreaSequencePicker.tsx`
  - `src/components/Shipments/RoundsHistory/RoundsHistory.tsx`
  - `src/components/Customers/CustomerOrders/CustomerOrders.tsx`
  - `src/components/Products/DefaultProduct.tsx`
  - `src/components/Products/UpdateDefaultProduct.tsx`
  - `src/features/orders/hooks/useRecordOrderController.ts`

## 6) Custom hooks performing API calls

### 6.1 Hooks with direct transport calls

| Hook file | Type | Method | Endpoint | Usage location |
|---|---|---:|---|---|
| `src/features/orders/hooks/useRecordOrderController.ts` | hook+fetch | POST | `${API_BASE}/api/orders` | Record order flow |
| `src/hooks/useSyncOfflineOrders.ts` | hook+fetch | dynamic | queued `request.url` | Offline replay |

### 6.2 Hooks delegating to feature API modules / RTK Query

| Hook file | Type | Endpoint(s) via API layer | Usage location |
|---|---|---|---|
| `src/features/shipments/hooks/useStartShipmentController.tsx` | hook->feature API | `/api/days/name/${weekday}`, `/api/shipments`, `/api/shipments/preload/${dayId}` | Start shipment modal |
| `src/features/shipments/hooks/useTodayShipmentTotals.ts` | hook->RTK Query | `/api/shipments/range` | Dashboard totals |
| `src/features/finance/hooks/useFinanceEntries.ts` | hook->feature API | `/api/finances?...` | Finance dashboard |
| `src/features/finance/hooks/useDailySummary.ts` | hook->feature API | `/api/finances/summary/daily` | Finance dashboard |
| `src/features/finance/hooks/useMonthlySummary.ts` | hook->feature API | `/api/finances/summary/monthly` | Finance dashboard |
| `src/features/finance/hooks/useFinanceCategories.ts` | hook->feature API | `/api/finance-categories` | Finance dashboard |
| `src/features/finance/hooks/useAddExpense.ts` | hook->feature API | `/api/expenses` | Expense creation flow |
| `src/features/finance/hooks/useAddProfit.ts` | hook->feature API | `/api/extraProfits` | Profit creation flow |
| `src/features/products/hooks/useProducts.ts` | hook->feature API | `/api/products/company/${companyId}`, `/api/products/${productId}` | Products page |
| `src/features/products/hooks/useAddProduct.ts` | hook->feature API | `/api/products` | Add product flow |
| `src/features/customers/hooks/useUpdateCustomerController.ts` | hook->feature APIs | `/api/customers/...`, `/api/areas/company`, `/api/customers/area/${areaId}/active` | Update customer page |
| `src/features/distributors/hooks/useCompanyDistributorData.ts` | hook->feature APIs | distributors + customers + orders + products API endpoints | Distributors pages |

