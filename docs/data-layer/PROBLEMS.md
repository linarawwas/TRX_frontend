# Data Fetching Problems and Architectural Analysis

This analysis is derived from:

- `docs/data-layer/INVENTORY.md`
- `docs/data-layer/ENDPOINT_MAP.md`
- `docs/data-layer/USAGE_GRAPH.md`

It highlights current architectural problems without changing behavior.

## 1) Duplicate Endpoint Usage

### 1.1 Same endpoint implemented in multiple layers

- **Severity: High**
- **Issue:** `POST /api/shipments/range` exists in both RTK Query and feature axios API.
- **Why it matters:** duplicated cache/fetch paths can diverge in headers, retries, error handling, and data shape assumptions.
- **References:**
  - `src/features/api/trxApi.ts` (`listShipmentsRange`)
  - `src/features/shipments/apiShipments.ts` (`fetchShipmentsByRange`)

### 1.2 Same endpoint split between feature API and component-level calls

- **Severity: Medium**
- **Issue:** `GET /api/orders/customer/${customerId}` is called both via feature API and directly inside a component.
- **Why it matters:** creates two ownership paths for the same backend contract.
- **References:**
  - `src/features/orders/apiOrders.ts` (`fetchOrdersByCustomer`)
  - `src/components/Customers/CustomerOrders/CustomerOrders.tsx` (direct axios call)

### 1.3 Reorder endpoint implemented in multiple feature APIs

- **Severity: Medium**
- **Issue:** `/api/areas/${areaId}/reorder?companyId=${companyId}` is implemented in two feature API modules.
- **Why it matters:** increases drift risk in payload format and error semantics between modules.
- **References:**
  - `src/features/areas/apiAreas.ts` (`reorderCustomersInArea`)
  - `src/features/areas/api.ts` (`reorderAreaCustomers`)

## 2) Mixed `fetch`/`axios`/RTK Query Usage

### 2.1 Transport strategy remains mixed for production API calls

- **Severity: Low**
- **Issue:** transport has been unified to RTK Query (`trxApi.transport` via `rtkJson`/`rtkEnvelope`), but some compatibility wrappers still expose different consumer contracts (`throw` vs envelope).
- **Why it matters:** consumer-level semantics still vary across legacy wrappers, even though network transport is centralized.
- **References (representative):**
  - RTK transport: `src/features/api/trxApi.ts`, `src/features/api/rtkTransport.ts`
  - envelope wrappers: `src/features/auth/api.ts`, `src/features/customers/api.ts`
  - throw-style wrappers: `src/features/customers/apiCustomers.ts`, `src/features/orders/apiOrders.ts`

### 2.2 Legacy fetch-like response wrappers still exist in business flows

- **Severity: Medium**
- **Issue:** legacy fetch-like wrapper semantics were present in business-critical flows and required full migration to unified transport.
- **Why it matters:** divergent response semantics (`ok/status/statusText/data`) can create inconsistent error paths.
- **Current status:** resolved in runtime code (replay uses `rtkJson` with normalized queued paths).

## 3) Hardcoded URLs vs `API_BASE`

### 3.1 Production API endpoints are mostly not hardcoded

- **Severity: Low**
- **Issue:** no broad hardcoded production API host usage was found in app runtime API calls; most calls use `API_BASE` or relative URLs under shared config.
- **Why it matters:** this is a positive consistency signal.

### 3.2 Fallback localhost base exists in config

- **Severity: Low**
- **Issue:** `API_BASE` defaults to `http://localhost:5000` if env vars are not set.
- **Why it matters:** safe for local development, but accidental env misconfiguration can route non-local runs to localhost.
- **References:**
  - `src/config/api.ts`

### 3.3 Non-API hardcoded external URL exists for WhatsApp integration

- **Severity: Low**
- **Issue:** `https://wa.me` is intentionally hardcoded for message redirect.
- **Why it matters:** not a data API concern, but still hardcoded network destination.
- **References:**
  - `src/features/orders/hooks/useRecordOrderController.ts`
  - `src/utils/whatsapp.ts`

## 4) Missing Abstraction (API Calls Inside Components/Pages)

### 4.1 Component-owned business HTTP in multiple screens

- **Severity: High**
- **Issue:** many components/pages still call API endpoints directly instead of using feature APIs/hooks.
- **Why it matters:** weakens separation of concerns and makes future data-layer migrations harder.
- **References:**
  - `src/components/Customers/AddCustomers/AddCustomers.tsx`
  - `src/components/Areas/AddArea/AddArea.tsx`
  - `src/components/Shipments/RoundsHistory/RoundsHistory.tsx`
  - `src/components/Customers/CustomerOrders/CustomerOrders.tsx`
  - `src/components/Auth/Register.tsx`
  - `src/components/Products/DefaultProduct.tsx`
  - `src/components/Products/UpdateDefaultProduct.tsx`

### 4.2 Page-level orchestration still directly invokes mutation APIs

- **Severity: Medium**
- **Issue:** pages invoke API modules directly rather than domain hooks in some flows.
- **Why it matters:** reduces consistency of view-controller boundaries.
- **References:**
  - `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx` (direct `createFinance/updateFinance/deleteFinance`)

## 5) Inconsistent Error/Loading Handling

### 5.1 Inconsistent success semantics across API layers

- **Severity: High**
- **Issue:** some APIs return `{ ok, data }`, while others throw via `rtkJson`.
- **Why it matters:** failed responses can silently propagate invalid state.
- **References:**
  - `{ ok, data }` response style: `src/features/customers/api.ts`, `src/features/areas/api.ts`
  - thrown error style: `src/features/customers/apiCustomers.ts` via `rtkJson`
  - direct data style: `src/features/areas/apiAreas.ts` (`fetchAreasByCompany`, `fetchCustomersByArea`)

### 5.2 Inconsistent loading states around API calls

- **Severity: Medium**
- **Issue:** some flows have full loading lifecycle (`loading`, `finally`), others have none or partial.
- **Why it matters:** UX and retry behavior differ by screen.
- **References:**
  - structured loading: `src/components/Shipments/RoundsHistory/RoundsHistory.tsx`, `src/features/finance/hooks/useFinanceEntries.ts`
  - minimal/none: `src/components/Auth/Register.tsx`, `src/components/Customers/AddCustomers/AddCustomers.tsx`, `src/components/Products/UpdateDefaultProduct.tsx`

### 5.3 Error normalization differs by path

- **Severity: Medium**
- **Issue:** some paths use centralized `TransportError` (`rtkJson`), while others use ad-hoc toast/console handling.
- **Why it matters:** inconsistent error messages and difficult global observability.
- **References:**
  - centralized: `src/features/api/rtkTransport.ts`
  - ad-hoc: `src/components/Customers/CustomerOrders/CustomerOrders.tsx`, `src/components/Products/DefaultProduct.tsx`, `src/components/Auth/Register.tsx`

## 6) Summary Risk Profile

- **Highest-risk architectural issues (High):**
  - duplicated critical endpoint (`/api/shipments/range`) across RTK Query + axios
  - business API calls still living in UI components/hooks
  - inconsistent direct-fetch success/error handling
- **Medium-risk issues:**
  - mixed transport across features and UI
  - uneven loading/error UX semantics
  - endpoint ownership split between feature API and component direct calls
- **Low-risk issues:**
  - localhost fallback in `API_BASE`
  - non-API hardcoded external URL (`wa.me`)

