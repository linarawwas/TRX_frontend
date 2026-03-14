# Testing guide

This project currently focuses on **high-value, low-friction tests** first:

- **Redux selectors** — Pure logic, memoization behavior, and derived values.
- **Feature hooks** — Business behavior that is easy to regress but cheap to test with mocks.
- **Mocked browser E2E** — High-risk cross-layer journeys using Playwright with intercepted APIs and seeded browser storage.

## What exists now

- `src/redux/selectors/selectors.test.ts`
  - Covers memoization and derived state for user, order, and shipment selectors.
- `src/features/shipments/hooks/useTodayShipmentTotals.test.ts`
  - Covers aggregation and error handling for the RTK Query-backed shipment totals hook.
- `src/features/finance/hooks/useAddExpense.test.ts`
  - Covers validation and successful submission behavior for a finance mutation hook.
- `src/features/finance/hooks/useAddProfit.test.ts`
  - Covers validation and successful submission behavior for profit mutations.
- `src/redux/Shipment/reducer.test.ts`
  - Covers shipment boundary regions: metadata/date updates, round setup/clearing, customer bucket mutations, snapshot/reset behavior, exact restore behavior, and falsy-value edge cases.
- `src/redux/selectors/selectors.test.ts`
  - Covers memoization and derived behavior for user, order, and shipment selectors, including shipment meta, live totals, previous snapshot, and round progress selectors.
- `src/hooks/useSyncOfflineOrders.test.tsx`
  - Covers offline replay success, invalid URLs, the offline guard, and retry-after-network-error behavior.
- `src/features/auth/authApi.test.ts`
  - Covers `/me` sync success and failure behavior.
- `src/features/auth/authStorage.test.ts`
  - Covers auth persistence, hydration, and clearing behavior.
- `src/features/auth/useAuth.test.ts`
  - Covers auth state exposure, bootstrap, and logout callbacks.
- `src/components/Orders/RecordOrder/useRecordOrderController.test.ts`
  - Covers input clamping, successful submission, offline queueing, failure-safe submit behavior, WhatsApp redirect, and remaining-quantity submission.
- `src/components/Orders/RecordOrder/RecordOrder.test.tsx`
  - Covers page-level wiring for steppers, submit delegation, LBP interactions, and over-target modal actions.
- `src/components/Customers/UpdateCustomer/useUpdateCustomerController.test.ts`
  - Covers change confirmation, successful update flow, restore conflicts and success paths, deactivate flow, delete guards, successful hard delete, and external-order handoff.
- `src/components/Customers/UpdateCustomer/UpdateCustomer.test.tsx`
  - Covers page-level wiring for edit confirmation flow, area/placement form branch, inactive restore UI, and admin-only destructive controls.
- `src/components/EmployeeComponents/StartShipment/StartShipment.test.tsx`
  - Existing component-level regression test for shipment start behavior.
- `tests/e2e/auth-shell.spec.ts`
  - Covers employee/admin auth bootstrap, seeded session state, `/api/users/me`, and correct router shell loading.
- `tests/e2e/start-shipment.spec.ts`
  - Covers new-day shipment start, shipment creation, preload-state completion, and `/areas/:dayId` landing.
- `tests/e2e/offline-order-replay.spec.ts`
  - Covers offline order queueing in IndexedDB and replay after returning online.
- `tests/e2e/finance-flow.spec.ts`
  - Covers admin finance entry creation and daily summary refresh.
- `tests/e2e/orders-today.spec.ts`
  - Covers the RTK Query-backed orders-today report with mocked shipments/orders data.
- `tests/e2e/update-customer.spec.ts`
  - Covers the critical update-customer edit, confirm-save, and success-refresh path.

## How to run tests

```bash
npm test -- --watch=false
```

Run the browser E2E suite:

```bash
npx playwright install chromium
npm run test:e2e
```

Useful variants:

```bash
npm run test:e2e:headed
npm run test:e2e:debug
```

To run a specific test file:

```bash
npm test -- --watch=false src/redux/selectors/selectors.test.ts
```

## Testing conventions

1. **Start with pure logic**
   - Prefer selectors, reducers, utilities, and feature hooks before large UI components.

2. **Mock boundaries, not internals**
   - Mock `react-redux`, RTK Query hooks, `toast`, and API clients.
   - Keep the unit under test real; mock only external dependencies.

3. **Test behavior, not implementation details**
   - Assert returned data, dispatched actions, validation outcomes, and user-visible messages.
   - Avoid testing local variable names or internal hook structure.

4. **Use renderHook for hooks**
   - For feature hooks, prefer `renderHook` from `@testing-library/react`.

5. **Add tests when touching critical flows**
   - If you modify order submission, offline sync, shipment totals, or auth bootstrap, add or update tests in the same change.

6. **Keep E2E deterministic**
   - Seed `localStorage` / Redux state instead of logging in through a real backend.
   - Intercept API calls in Playwright and return fixed payloads for the journey under test.
   - Use IndexedDB helpers for offline queue and cached invoice/product setup.

## E2E architecture notes

- `playwright.config.ts`
  - Runs the suite against `http://localhost:3000` and reuses an already-running CRA server when available.
- `tests/e2e/support/app.ts`
  - Seeds auth and Redux-backed `localStorage`, and provides shared page bootstrap helpers.
- `tests/e2e/support/idb.ts`
  - Seeds and reads IndexedDB stores used by offline sync and invoice/product caching.
- `tests/e2e/support/network.ts`
  - Centralizes API route interception and JSON request/response helpers.

The current E2E layer is intentionally **mocked**, not backend-integrated. Its job is to catch regressions in routing, auth bootstrap, Redux persistence, IndexedDB usage, and critical user workflows without depending on a live API.

## Recommended next tests

- `src/hooks/useSyncOfflineOrders.ts` deduping behavior when `online` fires repeatedly during an in-progress sync
- Login form submission coverage against the mocked auth endpoint if that flow becomes more complex
- Shipment consumer integration around selector boundaries if the slice is later split into sub-slices
