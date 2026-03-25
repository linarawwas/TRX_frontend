# Data Fetching Inventory

This inventory reflects the current frontend data-access architecture.

## Unified Transport Policy

- All network calls go through RTK Query in `src/features/api/trxApi.ts`.
- Feature APIs call the RTK Query endpoint `unifiedApiRequest` through `runUnifiedRequest` in `src/features/api/rtkRequest.ts`.
- Direct HTTP clients/helpers are removed from `src`.
- Service worker network handling in `public/sw.js` remains an allowed runtime exception.

## API Response Contract

- **Success path:** API payload is returned directly as typed data.
- **Failure path:** `runUnifiedRequest` throws `UnifiedRequestError` with:
  - `message`
  - `status`
  - `body`
- **Compatibility wrappers:** Some feature methods still return `{ ok, data }` for existing UI behavior, but their transport is RTK Query-backed.

## RTK Query Endpoints

Defined in `src/features/api/trxApi.ts`:

- `listShipmentsRange` -> `POST /api/shipments/range`
- `shipmentsOrdersByDate` -> `GET /api/shipments/orders/by-date`
- `unifiedApiRequest` -> generic typed request endpoint used by feature APIs

## Feature Modules Using RTK Query Transport

- `src/features/auth/api.ts`
- `src/features/auth/authApi.ts`
- `src/features/customers/api.ts`
- `src/features/customers/apiCustomers.ts`
- `src/features/orders/api.ts`
- `src/features/orders/apiOrders.ts`
- `src/features/orders/hooks/useRecordOrderController.ts`
- `src/features/areas/api.ts`
- `src/features/areas/apiAreas.ts`
- `src/features/products/api.ts`
- `src/features/products/apiProducts.ts`
- `src/features/finance/api.ts`
- `src/features/finance/apiFinance.ts`
- `src/features/shipments/api.ts`
- `src/features/shipments/apiShipments.ts`
- `src/features/distributors/apiDistributors.ts`
- `src/hooks/useSyncOfflineOrders.ts`

## Runtime Exception Inventory

| File | Behavior |
|---|---|
| `public/sw.js` | Runtime request interception/caching strategy |

## API Base Ownership

- API base URL is defined in `src/config/api.ts`.
- RTK Query `fetchBaseQuery` in `src/features/api/trxApi.ts` is the single source of network base configuration.

## How to Add a New Endpoint

1. Add endpoint in `trxApi` (or inject endpoint into `trxApi` from feature scope).
2. Export typed RTK Query hooks if the UI consumes endpoint state directly.
3. If a feature wrapper is needed, call `runUnifiedRequest` from that wrapper.
4. Keep payload and response mapping backward-compatible for existing UI consumers.
5. Document endpoint ownership in `ENDPOINT_MAP.md`.
