# Data Fetching Problems and Architectural Analysis

This document reflects the current runtime code and marks each major problem as:

- **Resolved**
- **Partially Resolved**
- **Open**

## 1) Duplicate Endpoint Ownership

### 1.1 `/api/shipments/range` duplicated across layers

- **Severity:** Low
- **Status:** **Resolved**
- **Current reality:** Canonical ownership is RTK Query (`trxApi.listShipmentsRange`).
- **Reference:** `src/features/api/trxApi.ts`

### 1.2 `/api/orders/customer/${customerId}` appears in two feature APIs

- **Severity:** Medium
- **Status:** **Open**
- **Issue:** endpoint exists in both `src/features/orders/api.ts` and `src/features/orders/apiOrders.ts`.
- **Why it matters:** two wrappers for one contract can drift in defaults and consumer expectations.

### 1.3 `/api/areas/${areaId}/reorder?companyId=${companyId}` duplicated

- **Severity:** Medium
- **Status:** **Open**
- **Issue:** reorder exists in both `src/features/areas/api.ts` and `src/features/areas/apiAreas.ts`.

## 2) Transport and Contract Consistency

### 2.1 Legacy transport helpers (`apiClient`, `requestRaw`, `requestJson`)

- **Severity:** Low
- **Status:** **Resolved**
- **Current reality:** transport is unified on RTK-based wrappers; legacy helpers are removed from runtime code paths.

### 2.2 API response contract inconsistency (requested domains)

- **Severity:** Low
- **Status:** **Resolved**
- **Scope:** auth, customers, orders, areas, shipments now use `ApiResult<T> = { data, error }`.
- **References:**
  - `src/features/auth/api.ts`
  - `src/features/customers/api.ts`
  - `src/features/orders/apiOrders.ts`
  - `src/features/areas/api.ts`
  - `src/features/shipments/apiShipments.ts`

### 2.3 Cross-feature contract consistency outside requested scope

- **Severity:** Medium
- **Status:** **Open**
- **Issue:** not all remaining feature modules are migrated to `ApiResult<T>` yet (e.g. distributors still uses throw-based `rtkJson`).
- **Reference:** `src/features/distributors/apiDistributors.ts`

## 3) Hardcoded URLs vs Config

### 3.1 API host hardcoding

- **Severity:** Low
- **Status:** **Resolved**
- **Current reality:** production API calls rely on configured base URL and relative paths.

### 3.2 `API_BASE` localhost fallback

- **Severity:** Low
- **Status:** **Open (by design)**
- **Issue:** fallback remains `http://localhost:5000` when env vars are missing.
- **Reference:** `src/config/api.ts`

### 3.3 Non-API external hardcoded URL

- **Severity:** Low
- **Status:** **Open (intentional)**
- **Issue:** WhatsApp integration uses hardcoded `https://wa.me`.
- **Reference:** `src/features/orders/hooks/useRecordOrderController.ts`

## 4) Abstraction Boundaries (UI vs Domain)

### 4.1 Direct feature API orchestration in components/pages

- **Severity:** Medium
- **Status:** **Partially Resolved**
- **Issue:** several screens still orchestrate API calls in component/page files instead of dedicated domain controllers.
- **Representative references:**
  - `src/components/Areas/AddArea/AddArea.tsx`
  - `src/components/Auth/Register.tsx`
  - `src/components/Products/DefaultProduct.tsx`
  - `src/components/Products/UpdateDefaultProduct.tsx`
  - `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx`

## 5) Error / Loading Behavior Uniformity

### 5.1 Loading and error UX semantics differ per screen

- **Severity:** Medium
- **Status:** **Open**
- **Issue:** although wrapper contract is consistent, UI-level handling patterns (toasts, retries, fallback messages, loading lifecycles) still vary by feature/screen.

## 6) Summary Risk Profile

- **High:** none currently confirmed in data transport/contract layer.
- **Medium:** duplicate endpoint wrappers, UI/domain boundary inconsistencies, loading/error UX variance.
- **Low:** config fallback (`API_BASE` localhost) and intentional external URL (`wa.me`).

