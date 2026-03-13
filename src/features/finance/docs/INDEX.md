# Finance Feature

**Path:** `src/features/finance/`  
**Role:** Core finance functionality including types, utilities, data hooks, and selectors for income/expense tracking with multi-currency support.  
**Owner/Area:** Finance

## Overview

The Finance feature provides:
- Type-safe models for finance entries, payments, categories, and summaries
- Data fetching hooks for categories, daily summaries, monthly summaries, and entries
- Pure selector functions for computing totals and grouping data
- Formatting utilities for currency display (USD/LBP)
- Shape detection and transformation helpers for legacy/new data formats

## Feature Structure

```
src/features/finance/
├── types.ts                    # TypeScript type definitions
├── selectors.ts                # Pure computation functions
├── utils/
│   └── financeUtils.ts         # Formatting and helper functions
├── hooks/
│   ├── useFinanceCategories.ts # Categories fetching hook
│   ├── useDailySummary.ts     # Daily summary hook
│   ├── useMonthlySummary.ts   # Monthly summary hook
│   └── useFinanceEntries.ts   # Entries list hook
└── docs/
    └── INDEX.md               # This file
```

## Core Files

### Types (`types.ts`)

**Exports:**
- `Currency` - "USD" | "LBP"
- `Payment` - Payment record with amount, currency, optional paymentMethod, note, rateAtPaymentLBP, date
- `FinanceEntry` - Finance entry (income/expense) supporting both legacy (single amount) and new (payments array) shapes
- `Category` - Finance category (_id, name, kind: "income" | "expense")
- `DailySummary` - Daily aggregated summary (shipments, finance income/expense, net)
- `MonthlyRow` - Single day row in monthly summary (day, shipments, income, expense, net)

**Used by:** All hooks, components, selectors, and utilities in the finance feature.

### Utilities (`utils/financeUtils.ts`)

**Exports:**
- `CAT_AR_MAP` - Mapping of English category names to Arabic translations
- `catAr(c)` - Returns Arabic name for a category (or fallback to English)
- `fmtUSD(n)` - Formats number as USD currency string ("$X.XX")
- `fmtLBP(n)` - Formats number as LBP currency string ("X,XXX ل.ل")
- `fmtSignedUSD(n)` - Formats signed USD ("+$X.XX" or "−$X.XX")
- `fmtSignedLBP(n)` - Formats signed LBP ("+X,XXX ل.ل" or "−X,XXX ل.ل")
- `isNewFinanceShape(e)` - Returns true if entry uses new payments array format
- `getEntrySums(e)` - Extracts {usd, lbp, norm} sums from entry (handles both legacy and new shapes)

**Used by:** All view components for formatting and [FinanceDashboard](../../../pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx) for data transformation.

### Selectors (`selectors.ts`)

**Exports:**
- `computeMonthlyTotals(monthly)` - Aggregates monthly rows into totals object:
  - Returns: `{ship: {usd, lbp, norm}, inc: {usd, lbp, norm}, exp: {usd, lbp, norm}, netNorm}`
- `computeEntriesTotals(entries)` - Computes income/expense/net totals from entries array:
  - Returns: `{inc: {usd, lbp, norm}, exp: {usd, lbp, norm}, net: {usd, lbp, norm}}`
- `groupEntriesByDate(entries)` - Groups entries by date string, sorted newest first:
  - Returns: `[string, FinanceEntry[]][]` where string is YYYY-MM-DD

**Used by:** [FinanceDashboard](../../../pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx) via useMemo for derived state.

### Data Hooks

#### `useFinanceCategories(token)`
**Returns:** `{cats: Category[], loading: boolean, error: string | null, refetch: () => void}`  
**Side Effect:** Fetches categories once on mount via `listCategories(token)`  
**Used by:** [FinanceDashboard](../../../pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx) and [AddFinanceForm](../../../pages/AdminPages/FinanceDashboard/components/AddFinanceForm.tsx)

#### `useDailySummary(token, date)`
**Returns:** `{data: DailySummary | null, loading: boolean, error: string | null, refetch: () => void}`  
**Side Effect:** Fetches daily summary when `date` changes via `dailySummary(token, date)`  
**Used by:** [FinanceDashboard](../../../pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx) → [DailySummaryPanel](../../../pages/AdminPages/FinanceDashboard/components/DailySummaryPanel.tsx)

#### `useMonthlySummary(token, y, m)`
**Returns:** `{data: MonthlyRow[], loading: boolean, error: string | null, refetch: () => void}`  
**Side Effect:** Fetches monthly summary when `y` or `m` changes via `monthlySummary(token, y, m)`  
**Used by:** [FinanceDashboard](../../../pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx) → [MonthlyViewMobile](../../../pages/AdminPages/FinanceDashboard/components/MonthlyViewMobile.tsx) / [MonthlyViewTable](../../../pages/AdminPages/FinanceDashboard/components/MonthlyViewTable.tsx)

#### `useFinanceEntries(token, year, month, kind?, categoryId?, enabled)`
**Returns:** `{data: FinanceEntry[], loading: boolean, error: string | null, refetch: () => void}`  
**Side Effect:** Fetches entries when params change (only if `enabled === true`) via `listFinances(token, {...})`  
**Used by:** [FinanceDashboard](../../../pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx) → [EntriesViewMobile](../../../pages/AdminPages/FinanceDashboard/components/EntriesViewMobile.tsx) / [EntriesViewTable](../../../pages/AdminPages/FinanceDashboard/components/EntriesViewTable.tsx)

## Dependencies

### Internal (within feature)
- All hooks depend on [types.ts](types.ts)
- All hooks depend on the feature-local [apiFinance.ts](../apiFinance.ts) service functions
- Selectors depend on [financeUtils.ts](utils/financeUtils.ts) for `getEntrySums`
- Selectors depend on [types.ts](types.ts)

### External
- **API Service:** [apiFinance.ts](../apiFinance.ts) - `listCategories`, `dailySummary`, `monthlySummary`, `listFinances`, `createFinance`
- **Shared Hooks:** [useMediaQuery](../../../hooks/useMediaQuery.ts) (used by FinanceDashboard, not directly by feature)

## Usage Pattern

1. **Page Component** imports hooks, selectors, and utilities
2. **Hooks** manage data fetching and state (loading, error)
3. **Selectors** compute derived data via `useMemo(() => selector(data), [data])`
4. **Components** receive formatted data and formatting functions as props
5. **Form submission** goes through page handler → API service → hooks refetch

## Data Shape Compatibility

The feature supports both legacy and new finance entry formats:
- **Legacy:** `{amount: number, currency: "USD" | "LBP", normalizedUSD: number}`
- **New:** `{payments: Payment[], sumUSD: number, sumLBP: number, normalizedUSDTotal: number}`

The `getEntrySums` function and `isNewFinanceShape` function handle this transparently.

## Related Documentation

- [FinanceDashboard README](../../../pages/AdminPages/FinanceDashboard/docs/README.md) - Page-level documentation
- Component-level docs may exist in `src/pages/AdminPages/FinanceDashboard/components/` (future)

## Future Enhancements

1. **Error Recovery** - Add retry logic to hooks
2. **Caching** - Add request deduplication or SWR-style caching
3. **Type Safety** - Stricter types for API responses
4. **Testing** - Unit tests for selectors and utilities
5. **Documentation** - JSDoc comments for exported functions

