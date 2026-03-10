## Technical debt & architectural risks

This document tracks known architectural issues and planned improvements. It is intentionally honest and focused on impact.

### Quick wins

1. **API base configuration is duplicated**
   - **Completed on:** 2026-03-10
   - **What changed:** Centralized all frontend API calls on the normalized `API_BASE` exported from `src/config/api.ts`, removed direct uses of `REACT_APP_API_BASE_URL` in feature APIs.
   - **Notes:** New code should always import `API_BASE` (or a small helper built on it) instead of reading environment variables or hardcoding hostnames.

2. **Router duplication**
   - **Completed on:** 2026-03-10
   - **What changed:** Extracted a `CommonRoutes` component (`src/Router/CommonRoutes.tsx`) that defines all routes shared between admin and employee experiences, and refactored both `AdminRouter` and `EmployeeRouter` to delegate to it. Removed duplicated route definitions inside `EmployeeRouter` so each path is now declared exactly once.
   - **Notes:** New shared routes should be added to `CommonRoutes` and kept role-specific routes inside the respective router components.

3. **IndexedDB docs out of date**
   - **Completed on:** 2026-03-10
   - **What changed:** Rewrote `src/utils/readme.md` to accurately document the current `indexedDB.ts` module, including `DB_VERSION = 15`, all active object stores (requests, customers, areas, invoices, products, discounts, exchange rates, etc.), and the public helper APIs.
   - **Notes:** Any future changes to `src/utils/indexedDB.ts` (new stores or helpers) should be reflected in `src/utils/readme.md` and, if user-visible, cross-referenced from `docs/state-management.md`.

### Medium-term refactors

1. **Auth/session scattered across components**
   - **Completed on:** 2026-03-10
   - **What changed:**
     - Introduced `src/features/auth/` with:
       - `authStorage.ts` to centralize reading/writing auth‑related `localStorage` keys (`token`, `companyId`, `isAdmin`, `username`) and hydrating the `UserInfo` Redux slice (`hydrateAuthFromStorage`, `persistAuthToStorage`, `clearAuth`).
       - `authApi.ts` with `fetchMeAndSync(token, dispatch)` wrapping `/api/users/me`, syncing `companyId`, `isAdmin`, and `username` into both Redux and `localStorage`.
       - `useAuth.ts` providing a `useAuth()` hook that exposes the current auth state plus helpers like `bootstrapFromStorage` and `logout`.
     - Updated `App.tsx` to derive `isAuthenticated` from the token returned by `hydrateAuthFromStorage(dispatch)` instead of manually reading `localStorage` and dispatching user actions inline.
     - Updated `Layout.tsx` to read `token`/`isAdmin` from Redux and call `fetchMeAndSync(token, dispatch)` instead of manually calling `/api/users/me` and mutating `localStorage` in place.
   - **Notes:** Future auth flows (login/logout, token refresh) should build on the `src/features/auth/` helpers and `useAuth` hook rather than dispatching `UserInfo` actions or touching `localStorage` directly.

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

