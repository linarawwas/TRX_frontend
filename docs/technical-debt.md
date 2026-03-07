## Technical debt & architectural risks

This document tracks known architectural issues and planned improvements. It is intentionally honest and focused on impact.

### Quick wins

1. **API base configuration is duplicated**
   - **Current state:** Some modules use `API_BASE` from `src/config/api.ts`, others use `REACT_APP_API_BASE_URL || API_BASE`, and a few still hardcode `http://localhost:5000`.
   - **Risk:** Harder to deploy to multiple environments; subtle bugs when changing API URLs.
   - **Direction:** Standardize on a single helper (e.g. `getApiBase()`) and remove hardcoded URLs.

2. **Router duplication**
   - **Current state:** `EmployeeRouter` contains duplicated routes; several paths overlap between `AdminRouter` and `EmployeeRouter`.
   - **Risk:** Inconsistent behavior, higher maintenance cost when updating a route.
   - **Direction:** Extract a small shared route config for common routes; remove duplicates within `EmployeeRouter`.

3. **IndexedDB docs out of date**
   - **Current state:** `src/utils/readme.md` describes an older DB schema and version.
   - **Risk:** Confuses contributors; makes debugging offline behavior harder.
   - **Direction:** Update or replace that doc to match `indexedDB.ts` (current stores and `DB_VERSION`).

### Medium-term refactors

1. **Auth/session scattered across components**
   - **Current state:** `App.tsx` and `Layout.tsx` both read/write `localStorage` and dispatch user actions; `/api/users/me` call is hardcoded in `Layout`.
   - **Risk:** Harder to change auth flows or add features like refresh tokens.
   - **Direction:** Create `src/features/auth/` with:
     - Typed `AuthState` and slice.
     - A `useAuth` hook exposing login/logout, user profile, and role.
     - Centralized `localStorage` and `/me` handling.

2. **Redux is classic, not Toolkit**
   - **Current state:** Manual action types and reducers across `UserInfo`, `Order`, `Shipment`, and `Defaults`.
   - **Risk:** Boilerplate, harder to evolve, easier to introduce subtle bugs.
   - **Direction:** Gradually migrate slices to Redux Toolkit (`createSlice`), starting with `UserInfo` and `Order`.

3. **Forms and validation are not standardized**
   - **Current state:** Some forms are config‑driven (`AddExpenses`, `AddProfits`, `AddProducts`), but validation is mostly ad‑hoc.
   - **Risk:** Inconsistent UX and error handling across forms.
   - **Direction:** Choose a standard (e.g. `react-hook-form` + `zod`) and apply it to new forms first, then migrate older ones opportunistically.

### Longer-term architecture improvements

1. **Data fetching and caching abstraction**
   - **Current state:** Mix of custom hooks and direct `axios`/`fetch` calls.
   - **Risk:** Harder to add caching, deduplication, and automatic retries consistently.
   - **Direction:** Introduce RTK Query or a similar library for read‑heavy flows (shipments, customers, areas, finance summaries).

2. **Error boundaries and error surfaces**
   - **Current state:** `ErrorBoundary` component exists but is not wired around major route trees.
   - **Risk:** Uncaught render errors can still crash the entire app.
   - **Direction:** Wrap top‑level routers (or even each feature section) in `ErrorBoundary` components with user‑friendly fallbacks.

3. **Documentation consolidation**
   - **Current state:** Rich docs exist under `docs/` and `src/**/docs`, but there is no single index.
   - **Risk:** Hard for newcomers to discover all documentation.
   - **Direction:** Maintain a short `docs/INDEX.md` (or rely on the Documentation map in the README) and keep it updated when new docs are added.

Each time a refactor lands, update this file to move items from “planned” to “done” or to refine the direction.

