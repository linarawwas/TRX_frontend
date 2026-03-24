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

### 1.3 Reorder endpoint used via both feature API and direct component fetch

- **Severity: Medium**
- **Issue:** `/api/areas/${areaId}/reorder?companyId=${companyId}` has direct component usage plus feature API wrapper.
- **Why it matters:** increases drift risk in payload format and error semantics.
- **References:**
  - `src/features/areas/apiAreas.ts` (`reorderCustomersInArea`)
  - `src/components/AreaSequencePicker/AreaSequencePicker.tsx` (direct fetch)

## 2) Mixed `fetch`/`axios`/RTK Query Usage

### 2.1 Transport strategy is mixed for production API calls

- **Severity: High**
- **Issue:** the codebase uses:
  - direct `fetch(...)` in UI/components/hooks,
  - direct `axios` in UI/components,
  - feature APIs using both `axios` and `requestJson`,
  - RTK Query for selected endpoints only.
- **Why it matters:** inconsistent interceptors, error handling, cancellation behavior, and testability.
- **References (representative):**
  - direct fetch in UI: `src/components/AddDiscount/AddDiscount.tsx`
  - direct axios in UI: `src/components/Products/DefaultProduct.tsx`
  - feature mixed transport: `src/features/finance/apiFinance.ts`
  - RTK Query: `src/features/api/trxApi.ts`
  - shared fetch wrapper: `src/features/api/http.ts`

### 2.2 Hook-level direct transport still exists in business flows

- **Severity: High**
- **Issue:** business-critical hooks still perform raw `fetch` calls.
- **Why it matters:** bypasses centralized API abstraction and complicates retries/offline consistency.
- **References:**
  - `src/features/orders/hooks/useRecordOrderController.ts` (`POST /api/orders`)
  - `src/hooks/useSyncOfflineOrders.ts` (replays queued requests using `fetch(request.url, ...)`)

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
  - `src/components/AddDiscount/AddDiscount.tsx`
  - `src/components/Customers/AddCustomer/AddCustomer.tsx`
  - `src/components/Customers/AddCustomerInitials/AddCustomerInitials.tsx`
  - `src/components/Customers/AddCustomers/AddCustomers.tsx`
  - `src/components/Areas/AddArea/AddArea.tsx`
  - `src/components/AreaSequencePicker/AreaSequencePicker.tsx`
  - `src/components/Shipments/RoundsHistory/RoundsHistory.tsx`
  - `src/components/Customers/CustomerOrders/CustomerOrders.tsx`
  - `src/pages/SharedPages/Login/LoginForm.tsx`
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

### 5.1 Inconsistent `response.ok` handling in direct `fetch`

- **Severity: High**
- **Issue:** some fetch calls check `response.ok`, others parse blindly or assume success.
- **Why it matters:** failed responses can silently propagate invalid state.
- **References:**
  - checks present: `src/components/Customers/AddCustomer/AddCustomer.tsx`, `src/components/Shipments/RoundsHistory/RoundsHistory.tsx`
  - weak/partial checks: `src/components/AddDiscount/AddDiscount.tsx` (early `.then(res => res.json())` patterns), `src/components/Customers/AddCustomers/AddCustomers.tsx` (response object unused)

### 5.2 Inconsistent loading states around API calls

- **Severity: Medium**
- **Issue:** some flows have full loading lifecycle (`loading`, `finally`), others have none or partial.
- **Why it matters:** UX and retry behavior differ by screen.
- **References:**
  - structured loading: `src/components/Shipments/RoundsHistory/RoundsHistory.tsx`, `src/features/finance/hooks/useFinanceEntries.ts`
  - minimal/none: `src/components/Auth/Register.tsx`, `src/components/Customers/AddCustomers/AddCustomers.tsx`, `src/components/Products/UpdateDefaultProduct.tsx`

### 5.3 Error normalization differs by path

- **Severity: Medium**
- **Issue:** some paths use centralized `ApiRequestError` (`requestJson`), while others use ad-hoc toast/console handling.
- **Why it matters:** inconsistent error messages and difficult global observability.
- **References:**
  - centralized: `src/features/api/http.ts`
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

