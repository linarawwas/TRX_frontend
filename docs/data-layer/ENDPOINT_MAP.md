# Endpoint Map

Endpoint-to-usage mapping across frontend transport layers (`fetch`, `axios`, RTK Query, `requestJson`).

## Auth

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/auth/login` | POST | `src/pages/SharedPages/Login/LoginForm.tsx` |
| `/api/auth/register` | POST | `src/components/Auth/Register.tsx` |

## Shipments / Rounds / Start Shipment

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/shipments/range` | POST | `src/features/api/trxApi.ts` (`listShipmentsRange`); consumed by `src/features/shipments/hooks/useTodayShipmentTotals.ts` and `src/pages/SharedPages/Shipment/ShipmentsList.tsx` |
| `/api/shipments/orders/by-date` | GET | `src/features/api/trxApi.ts` (`shipmentsOrdersByDate`) |
| `/api/shipments` | POST | `src/features/shipments/apiShipments.ts` (`createRoundOrShipment`) |
| `/api/shipments/preload/${dayId}` | GET | `src/features/shipments/apiShipments.ts` (`preloadShipmentData`) |
| `/api/shipments/${shipmentId}/rounds` | GET | `src/components/Shipments/RoundsHistory/RoundsHistory.tsx` |
| `/api/days/name/${weekday}` | GET | `src/features/shipments/apiShipments.ts` (`fetchDayByWeekday`) |

## Orders

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/orders` | POST | `src/features/orders/hooks/useRecordOrderController.ts` |
| `/api/orders/${orderId}` | GET, PATCH, DELETE | `src/features/orders/apiOrders.ts` |
| `/api/orders/addPayment/${orderId}` | PUT | `src/features/orders/apiOrders.ts` |
| `/api/orders/company/${companyId}` | GET | `src/features/orders/apiOrders.ts` |
| `/api/orders/customer/${customerId}` | GET | `src/features/orders/api.ts` (`fetchCustomerOrders`), `src/features/orders/apiOrders.ts` (`fetchOrdersByCustomer`), `src/features/orders/hooks/useOrdersByCustomer.ts` |
| `/api/orders/customer/${customerId}/with-initial` | GET | `src/features/orders/apiOrders.ts`, `src/features/customers/apiCustomers.ts` |

## Customers

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/customers/company` | GET | `src/features/customers/apiCustomers.ts` |
| `/api/customers/${customerId}` | GET, PATCH, PUT | `src/features/customers/apiCustomers.ts`, `src/components/AddDiscount/AddDiscount.tsx` |
| `/api/customers/${customerId}/deactivate` | PATCH | `src/features/customers/apiCustomers.ts` |
| `/api/customers/${customerId}/restore` | PATCH | `src/features/customers/apiCustomers.ts` |
| `/api/customers/${customerId}/hard` | DELETE | `src/features/customers/apiCustomers.ts` |
| `/api/customers/${customerId}/opening` | PATCH | `src/features/customers/apiCustomers.ts` |
| `/api/customers/reciept/${customerId}` | GET | `src/features/customers/apiCustomers.ts` |
| `/api/customers/area/${areaId}` | GET | `src/features/areas/apiAreas.ts`, `src/components/AddDiscount/AddDiscount.tsx`, `src/components/AreaSequencePicker/AreaSequencePicker.tsx` |
| `/api/customers/area/${areaId}/active` | GET | `src/features/customers/apiCustomers.ts`, `src/components/Customers/AddCustomer/AddCustomer.tsx` |
| `/api/customers/create-with-sequence` | POST | `src/components/Customers/AddCustomer/AddCustomer.tsx` |
| `/api/customers/many` | POST | `src/components/Customers/AddCustomers/AddCustomers.tsx` |
| `/api/customers/uploadCustomersWithOrders` | POST | `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx` |

## Areas / Days / Sequence

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/areas/company` | GET | `src/features/areas/apiAreas.ts`, `src/components/Customers/AddCustomer/AddCustomer.tsx`, `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx`, `src/components/AddDiscount/AddDiscount.tsx` |
| `/api/areas/days/${dayId}` | POST | `src/features/areas/apiAreas.ts` |
| `/api/areas` | POST | `src/components/Areas/AddArea/AddArea.tsx` |
| `/api/areas/${areaId}/reorder?companyId=${companyId}` | POST | `src/features/areas/apiAreas.ts`, `src/components/AreaSequencePicker/AreaSequencePicker.tsx` |
| `/api/days` | GET | `src/components/Areas/AddArea/AddArea.tsx` |

## Products / Defaults

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/products/company/${companyId}` | GET | `src/features/products/apiProducts.ts` |
| `/api/products` | POST | `src/features/products/apiProducts.ts` |
| `/api/products/${productId}` | PUT, DELETE | `src/features/products/apiProducts.ts` |
| `/api/adminDeterminedDefaults/company/${companyId}` | GET | `src/components/Products/DefaultProduct.tsx` |
| `/api/adminDeterminedDefaults/defaultProduct` | PUT | `src/components/Products/UpdateDefaultProduct.tsx` |

## Finance

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/expenses` | GET, POST | `src/features/finance/apiFinance.ts` |
| `/api/expenses/${expenseId}` | PUT, DELETE | `src/features/finance/apiFinance.ts` |
| `/api/extraProfits` | GET, POST | `src/features/finance/apiFinance.ts` |
| `/api/extraProfits/${profitId}` | PUT, DELETE | `src/features/finance/apiFinance.ts` |
| `/api/finances` | POST | `src/features/finance/apiFinance.ts` |
| `/api/finances/${id}` | PATCH, DELETE | `src/features/finance/apiFinance.ts` |
| `/api/finances/summary/daily` | GET | `src/features/finance/apiFinance.ts` |
| `/api/finances/summary/monthly` | GET | `src/features/finance/apiFinance.ts` |
| `/api/finances?from=...&to=...` | GET | `src/features/finance/apiFinance.ts` |
| `/api/finance-categories` | GET | `src/features/finance/apiFinance.ts` |

## Distributors

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/distributors` | GET, POST | `src/features/distributors/apiDistributors.ts` |
| `/api/distributors/${id}` | PATCH, DELETE | `src/features/distributors/apiDistributors.ts` |
| `/api/distributors/summary` | GET | `src/features/distributors/apiDistributors.ts` |
| `/api/distributors/${id}/customers` | GET | `src/features/distributors/apiDistributors.ts` |
| `/api/distributors/${id}/detail` | GET | `src/features/distributors/apiDistributors.ts` |
| `/api/distributors/customers/${customerId}/assign` | PATCH | `src/features/distributors/apiDistributors.ts` |
| `/api/distributors/customers/${customerId}/unassign` | PATCH | `src/features/distributors/apiDistributors.ts` |

## Exchange Rate

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/exchange-rate` | GET | `src/components/AddDiscount/AddDiscount.tsx` |

## Dynamic / Runtime URLs

| Endpoint pattern | Method(s) | Used in |
|---|---:|---|
| `request.url` from IndexedDB queue | dynamic | `src/hooks/useSyncOfflineOrders.ts` |
| `apiUrl(path)` from `requestJson` | configurable | `src/features/api/http.ts` |
| Service Worker passthrough request | runtime | `public/sw.js` |

