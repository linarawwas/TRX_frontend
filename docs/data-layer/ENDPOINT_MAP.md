# Endpoint Map

Endpoint-to-usage mapping with unified RTK Query transport.

## Transport Rule

- Transport owner: `src/features/api/trxApi.ts`
- Feature wrapper execution path: `src/features/api/rtkRequest.ts` -> `trxApi.endpoints.unifiedApiRequest`

## Shipments

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/shipments/range` | POST | `trxApi.listShipmentsRange`; consumed by shipment totals and shipment list pages |
| `/api/shipments/orders/by-date` | GET | `trxApi.shipmentsOrdersByDate` |
| `/api/shipments` | POST | `src/features/shipments/apiShipments.ts` |
| `/api/shipments/preload/${dayId}` | GET | `src/features/shipments/apiShipments.ts` |
| `/api/shipments/${shipmentId}/rounds` | GET | `src/features/shipments/api.ts` and rounds history UI |
| `/api/days/name/${weekday}` | GET | `src/features/shipments/apiShipments.ts` |

## Orders

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/orders` | POST | order recording flow |
| `/api/orders/${orderId}` | GET, PATCH, DELETE | `src/features/orders/apiOrders.ts` |
| `/api/orders/addPayment/${orderId}` | PUT | `src/features/orders/apiOrders.ts` |
| `/api/orders/company/${companyId}` | GET | `src/features/orders/apiOrders.ts` |
| `/api/orders/customer/${customerId}` | GET | `src/features/orders/api.ts`, `src/features/orders/apiOrders.ts`, `useOrdersByCustomer` |
| `/api/orders/customer/${customerId}/with-initial` | GET | orders + customer statement flows |

## Customers

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/customers/company` | GET | customer bootstrap/data tables |
| `/api/customers/${customerId}` | GET, PATCH, PUT | customer details/updates |
| `/api/customers/${customerId}/deactivate` | PATCH | customer lifecycle |
| `/api/customers/${customerId}/restore` | PATCH | customer lifecycle |
| `/api/customers/${customerId}/hard` | DELETE | customer lifecycle |
| `/api/customers/${customerId}/opening` | PATCH | opening editor |
| `/api/customers/reciept/${customerId}` | GET | invoice cache refresh |
| `/api/customers/area/${areaId}` | GET | area-customer lists |
| `/api/customers/area/${areaId}/active` | GET | active customer placement |
| `/api/customers/create-with-sequence` | POST | create customer flow |
| `/api/customers/many` | POST | bulk customer import |
| `/api/customers/uploadCustomersWithOrders` | POST | bulk initials import |

## Areas / Days

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/areas/company` | GET | area selection/bootstrap |
| `/api/areas/days/${dayId}` | POST | areas by day |
| `/api/areas` | POST | create area |
| `/api/areas/${areaId}/reorder` + `companyId` query | POST | reorder customers |
| `/api/days` | GET | day bootstrap |

## Products / Defaults

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/products/company/${companyId}` | GET | product list |
| `/api/products` | POST | create product |
| `/api/products/${productId}` | PUT, DELETE | update/delete product |
| `/api/adminDeterminedDefaults/company/${companyId}` | GET | default product read |
| `/api/adminDeterminedDefaults/defaultProduct` | PUT | default product update |

## Finance

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/exchange-rate` | GET | exchange-rate helpers |
| `/api/expenses` | GET, POST | expense flows |
| `/api/expenses/${expenseId}` | PUT, DELETE | expense edit/delete |
| `/api/extraProfits` | GET, POST | profit flows |
| `/api/extraProfits/${profitId}` | PUT, DELETE | profit edit/delete |
| `/api/finances` | POST | finance create |
| `/api/finances/${id}` | PATCH, DELETE | finance update/delete |
| `/api/finances/summary/daily` | GET | daily summaries |
| `/api/finances/summary/monthly` | GET | monthly summaries |
| `/api/finances?from=...&to=...` | GET | finance listing |
| `/api/finance-categories` | GET | finance categories |

## Distributors

| Endpoint | Method(s) | Used in |
|---|---:|---|
| `/api/distributors` | GET, POST | list/create distributor |
| `/api/distributors/${id}` | PATCH, DELETE | update/delete distributor |
| `/api/distributors/summary` | GET | summary |
| `/api/distributors/${id}/customers` | GET | customers by distributor |
| `/api/distributors/${id}/detail` | GET | detail summary |
| `/api/distributors/customers/${customerId}/assign` | PATCH | assign |
| `/api/distributors/customers/${customerId}/unassign` | PATCH | unassign |
