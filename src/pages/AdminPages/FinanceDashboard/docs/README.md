# FinanceDashboard

**Path:** `src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx`  
**Role:** Orchestrates the Finance feature UI, managing tab state, data fetching coordination, and form submission for income/expense entries.  
**Owner/Area:** Finance | Admin Pages

## Responsibilities
- Renders four main tabs: Daily Summary, Monthly Summary, Entries List, and Add Finance Entry
- Coordinates data fetching via custom hooks for categories, daily/monthly summaries, and entries
- Manages filter state for entries (year, month, kind, category) and monthly view (year, month, selected days)
- Handles form submission flow: validation, API call, toast notifications, data refresh, and form reset
- Computes derived totals using pure selector functions
- Routes to mobile vs desktop views based on screen size

## Public API (Props & Exports)
- `FinanceDashboard()` - Default export, no props (reads from Redux for token/admin status)

## Internal Structure

### State Management
- `active` (TabKey) - Current active tab ("daily" | "monthly" | "entries" | "add")
- `date` (string) - Selected date for daily summary (ISO format YYYY-MM-DD)
- `ym` ({y: number, m: number}) - Year/month for monthly summary
- `selDays` (number[]) - Selected day numbers for mobile monthly view filtering
- `eYm`, `eKind`, `eCat` - Filter state for entries tab (year/month, kind, categoryId)
- `formRef` - Ref to AddFinanceForm for reset after submission

### Data Hooks
- `useFinanceCategories(token)` - Loads category list once
- `useDailySummary(token, date)` - Fetches daily summary, refetches on date change
- `useMonthlySummary(token, y, m)` - Fetches monthly rows, refetches on y/m change
- `useFinanceEntries(token, y, m, kind?, categoryId?, enabled)` - Fetches entries when entries tab is active

### Computed Values
- `totals` - Monthly totals computed via `computeMonthlyTotals(monthly)`
- `entriesTotals` - Entry totals computed via `computeEntriesTotals(entries)`

### Key Sections
1. **Tabs Navigation** - Rendered by [FinanceTabs](../components/FinanceTabs.tsx)
2. **Add Form** - Rendered by [AddFinanceForm](../components/AddFinanceForm.tsx) with ref-based reset
3. **Daily Panel** - Rendered by [DailySummaryPanel](../components/DailySummaryPanel.tsx)
4. **Monthly View** - Conditionally renders [MonthlyViewMobile](../components/MonthlyViewMobile.tsx) or [MonthlyViewTable](../components/MonthlyViewTable.tsx)
5. **Entries View** - Conditionally renders [EntriesViewMobile](../components/EntriesViewMobile.tsx) or [EntriesViewTable](../components/EntriesViewTable.tsx)

## Dependencies (with links)

### Uses:
- [FinanceTabs](../components/FinanceTabs.tsx) - Tab navigation component
- [AddFinanceForm](../components/AddFinanceForm.tsx) - Finance entry form with payments
- [DailySummaryPanel](../components/DailySummaryPanel.tsx) - Daily summary tiles
- [MonthlyViewMobile](../components/MonthlyViewMobile.tsx) - Mobile monthly cards with day selector
- [MonthlyViewTable](../components/MonthlyViewTable.tsx) - Desktop monthly table
- [EntriesViewMobile](../components/EntriesViewMobile.tsx) - Mobile entries grouped by date
- [EntriesViewTable](../components/EntriesViewTable.tsx) - Desktop entries table
- [useFinanceCategories](../../../features/finance/hooks/useFinanceCategories.ts) - Categories data hook
- [useDailySummary](../../../features/finance/hooks/useDailySummary.ts) - Daily summary hook
- [useMonthlySummary](../../../features/finance/hooks/useMonthlySummary.ts) - Monthly summary hook
- [useFinanceEntries](../../../features/finance/hooks/useFinanceEntries.ts) - Entries list hook
- [computeMonthlyTotals](../../../features/finance/selectors.ts) - Monthly totals selector
- [computeEntriesTotals](../../../features/finance/selectors.ts) - Entries totals selector
- [fmtUSD, fmtLBP, fmtSignedUSD, fmtSignedLBP, getEntrySums, catAr](../../../features/finance/utils/financeUtils.ts) - Formatting and helper utilities
- [useMediaQuery](../../../hooks/useMediaQuery.ts) - Responsive breakpoint hook
- [createFinance](../../../features/finance/apiFinance.ts) - API service for creating finance entries

### Exposes to:
- Used by routing (likely in AdminRouter) to render `/finance` or similar route

## Data Flow

### Data In
1. **Redux Store** - Reads `token` and `isAdmin` from `s.user`
2. **Custom Hooks** - Fetch data from API:
   - Categories: loaded once via `useFinanceCategories`
   - Daily summary: fetched when `date` changes via `useDailySummary`
   - Monthly rows: fetched when `ym` changes via `useMonthlySummary`
   - Entries: fetched when `active === "entries"` and filters change via `useFinanceEntries`

### Transformations
1. **Selectors** - Pure functions compute totals:
   - `computeMonthlyTotals(monthly)` → aggregated monthly totals
   - `computeEntriesTotals(entries)` → income/expense/net breakdown
2. **Formatting** - `fmtUSD`, `fmtLBP`, `fmtSignedUSD`, `fmtSignedLBP` format numbers
3. **Entry Sums** - `getEntrySums(entry)` extracts USD/LBP/normalized values from mixed-shape entries

### Data Out
1. **Form Submission** - `handleSubmit` receives payload from AddFinanceForm:
   - Validates `isAdmin`, `categoryId`, `payments.length`
   - Calls `createFinance(token, payload)`
   - On success: shows toast, resets form via ref, refetches daily/monthly summaries, switches to "daily" tab
2. **Child Components** - Passes data down as props:
   - Daily panel receives `daily` data and `setDate` callback
   - Monthly views receive `monthly` array and `totals` object
   - Entries views receive `entries` array and formatting functions
   - Form receives `cats` array and `onSubmit` callback

## Error Handling & Loading

### Error Handling
- **API Errors** - Handled inside hooks (set error state), surfaced via console.error
- **Form Validation** - Client-side checks in `handleSubmit`:
  - Missing category → toast.warn("اختر الفئة")
  - No payments → toast.warn("أضف دفعة واحدة على الأقل")
  - Not admin → toast.warn("هذه العملية للمشرف فقط")
- **Submission Errors** - Caught in try/catch, shows toast.error("فشل حفظ العملية")

### Loading States
- **Hooks** - Each hook manages its own `loading` state
- **Entries View** - `eLoading` passed to EntriesViewMobile/Table for loading indicators
- **UI Feedback** - Loading messages shown in entries views ("جارٍ التحميل…")

## i18n/RTL & Accessibility

### i18n
- **Strategy** - Arabic strings are hardcoded in components
- **Strings** - All user-facing text is in Arabic (labels, buttons, toasts, placeholders)
- **Extraction** - Consider extracting to i18n keys for future translation support

### RTL
- **Direction** - Root div has `dir="rtl"` attribute
- **Layout** - CSS uses RTL-aware classes (e.g., `finx-row__right` for right-side alignment in RTL context)
- **Table Direction** - Tables use `direction: rtl` in CSS

### Accessibility
- **Tabs** - Uses `role="tablist"`, `role="tab"`, `aria-selected`, `aria-label` on tab container
- **Inputs** - Form inputs have `aria-label` attributes (e.g., "السنة", "الشهر", "النوع", "الفئة")
- **Buttons** - Action buttons have `aria-label` where needed (e.g., "تحديث")
- **Day Selector** - Uses `aria-pressed` for selected day chips in monthly mobile view

## Testing Notes

### What to Mock
- **Redux Store** - Mock `useSelector` to return `{token: "test-token", isAdmin: true}`
- **API Services** - Mock `createFinance` from `apiFinance`
- **Custom Hooks** - Mock data hooks to return controlled data:
  - `useFinanceCategories` → mock categories array
  - `useDailySummary` → mock daily summary object
  - `useMonthlySummary` → mock monthly rows array
  - `useFinanceEntries` → mock entries array and loading state
- **useMediaQuery** - Mock to return `true` (mobile) or `false` (desktop)

### Critical Test Cases
1. **Smoke Test** - Renders all four tabs, clicking tabs switches active panel
2. **Daily Summary** - Renders daily tiles with correct formatted amounts when data is present
3. **Monthly View** - Mobile: day selector chips work, cards show for selected days. Desktop: table renders with totals.
4. **Entries View** - Filters update entries list, totals compute correctly, table/cards render entries
5. **Form Submission** - Fill form, submit, verify:
   - Success toast appears
   - Form resets (verify via ref)
   - Daily/monthly refetch called
   - Active tab switches to "daily"
6. **Form Validation** - Submit without category/payments, verify warning toasts

## Gotchas & Future Work

### Known Limitations
- **Error surfacing** - Submission failures still rely on toasts rather than dedicated inline error UI
- **No Error UI** - Errors are only logged, no visible error states in UI
- **No Pagination** - Entries list loads all entries for the month (could be slow with many entries)
- **Inline Styles** - Some minor inline styles remain (width, minWidth for inputs)

### Suggested Improvements
1. **Extract i18n** - Move Arabic strings to i18n files for translation support
2. **Error Boundaries** - Wrap component in ErrorBoundary (component exists but not used here)
3. **Loading Skeletons** - Add skeleton loaders instead of "جارٍ التحميل…" text
4. **Pagination** - Add pagination to entries list for large datasets
5. **Filter Persistence** - Save filter state to URL params or localStorage
6. **Export/Print** - Add export to CSV/PDF for monthly summaries
7. **Date Range Picker** - Replace separate year/month inputs with date range picker
8. **Optimistic Updates** - Update UI optimistically on form submit before API response

## Split Summary

This component was refactored from a monolithic ~1160-line file to a thin orchestrator (~320 lines) with focused subcomponents:

- **Extracted Components:**
  - [FinanceTabs](../components/FinanceTabs.tsx) - Tab navigation UI
  - [AddFinanceForm](../components/AddFinanceForm.tsx) - Form state, payments list, validation
  - [DailySummaryPanel](../components/DailySummaryPanel.tsx) - Daily summary tiles with date picker
  - [MonthlyViewMobile](../components/MonthlyViewMobile.tsx) - Mobile cards with day selector chips
  - [MonthlyViewTable](../components/MonthlyViewTable.tsx) - Desktop table view
  - [EntriesViewMobile](../components/EntriesViewMobile.tsx) - Mobile grouped-by-date cards
  - [EntriesViewTable](../components/EntriesViewTable.tsx) - Desktop entries table

- **Extracted Data Hooks:**
  - [useFinanceCategories](../../../features/finance/hooks/useFinanceCategories.ts) - Categories fetching
  - [useDailySummary](../../../features/finance/hooks/useDailySummary.ts) - Daily summary fetching
  - [useMonthlySummary](../../../features/finance/hooks/useMonthlySummary.ts) - Monthly summary fetching
  - [useFinanceEntries](../../../features/finance/hooks/useFinanceEntries.ts) - Entries fetching with filters

- **Extracted Utilities:**
  - [financeUtils](../../../features/finance/utils/financeUtils.ts) - Formatting functions (fmtUSD, fmtLBP, etc.) and shape helpers (getEntrySums, isNewFinanceShape, catAr, CAT_AR_MAP)
  - [selectors](../../../features/finance/selectors.ts) - Pure computation functions (computeMonthlyTotals, computeEntriesTotals, groupEntriesByDate)

- **Moved to Shared:**
  - [useMediaQuery](../../../hooks/useMediaQuery.ts) - SSR-safe responsive hook

See [Finance Feature Index](../../../features/finance/docs/INDEX.md) for the complete feature structure.

