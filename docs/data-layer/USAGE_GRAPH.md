# Usage Graph

Component/page/hook to API dependency graph using unified RTK Query transport.

## Transport Layers

- `trxApi` (`src/features/api/trxApi.ts`) is the canonical network layer.
- `runUnifiedRequest` (`src/features/api/rtkRequest.ts`) is the wrapper used by feature API modules.
- Feature APIs provide domain-level functions consumed by hooks and components.

## Pages

| Component/Page | API dependency |
|---|---|
| `src/pages/SharedPages/Login/LoginForm.tsx` | `loginUser` -> auth endpoints via RTK Query |
| `src/pages/AdminPages/ProductsList/Products.tsx` | product domain hooks + product feature APIs |
| `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx` | finance hooks + finance feature APIs |
| `src/pages/SharedPages/Shipment/ShipmentsList.tsx` | `useLazyListShipmentsRangeQuery` from RTK Query |

## Components

| Component | API dependency |
|---|---|
| `src/components/Auth/Register.tsx` | auth feature API wrappers |
| `src/components/Customers/AddCustomers/AddCustomers.tsx` | customer feature APIs |
| `src/components/Areas/AddArea/AddArea.tsx` | area feature APIs |
| `src/components/Shipments/RoundsHistory/RoundsHistory.tsx` | shipment feature API wrapper |
| `src/components/Products/DefaultProduct.tsx` | product/default feature API wrappers |
| `src/components/Products/UpdateDefaultProduct.tsx` | product/default feature API wrappers |

## Domain Hooks Layer

| Domain Hook | Responsibility | Consumers |
|---|---|---|
| `useOrdersByCustomer` | load customer orders | `CustomerOrders` |
| `useCompanyAreas` | load area options | customer creation/discount flows |
| `useActiveAreaCustomers` | load active area customers | `AddCustomer` |
| `useCreateCustomerWithSequence` | create customers with sequence | `AddCustomer` |
| `useUploadCustomersWithOrders` | bulk upload customer orders | `AddCustomerInitials` |
| `useUpdateCustomerDiscount` | customer discount updates | `AddDiscount` |
| `useAreaCustomers` | customers by area query | `AddDiscount`, `AreaSequencePicker` |
| `useReorderAreaCustomers` | area reorder mutation | `AreaSequencePicker` |
| `useTodayShipmentTotals` | shipments range totals | dashboard/home |
| `useStartShipmentController` | shipment start + preload flow | start shipment dialog |
| `useSyncOfflineOrders` | replay queued offline requests (via RTK transport wrapper) | app bootstrap |

## API Response Semantics

- Success responses return typed payloads.
- Failures throw `UnifiedRequestError`.
- Compatibility wrappers may map to `{ ok, data }` where existing UI depends on that shape.
