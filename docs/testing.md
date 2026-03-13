# Testing guide

This project currently focuses on **high-value, low-friction tests** first:

- **Redux selectors** — Pure logic, memoization behavior, and derived values.
- **Feature hooks** — Business behavior that is easy to regress but cheap to test with mocks.

## What exists now

- `src/redux/selectors/selectors.test.ts`
  - Covers memoization and derived state for user, order, and shipment selectors.
- `src/features/shipments/hooks/useTodayShipmentTotals.test.ts`
  - Covers aggregation and error handling for the RTK Query-backed shipment totals hook.
- `src/features/finance/hooks/useAddExpense.test.ts`
  - Covers validation and successful submission behavior for a finance mutation hook.
- `src/components/EmployeeComponents/StartShipment/StartShipment.test.tsx`
  - Existing component-level regression test for shipment start behavior.

## How to run tests

```bash
npm test -- --watch=false
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

## Recommended next tests

- Shipment reducer behavior (`src/redux/Shipment/reducer.ts`)
- Offline sync (`src/hooks/useSyncOfflineOrders.ts`)
- `useAddProfit`
- `useAuth`
- Extracted controller hooks for `RecordOrder` and `UpdateCustomer`
