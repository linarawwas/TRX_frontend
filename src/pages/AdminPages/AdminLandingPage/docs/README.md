# AdminLandingPage

**Path:** `src/pages/AdminPages/AdminLandingPage/AdminLandingPage.tsx`  
**Role:** Admin home container that orchestrates hero section, quick actions, snapshot KPIs, live shipment statistics, and lazy-loaded finance dashboard.  
**Owner/Area:** Admin Pages

## Responsibilities
- Renders welcome hero with user name and current date
- Provides quick action buttons (discount modal, view shipments navigation, print report)
- Displays today's shipment snapshot with delivery progress ring and key financial KPIs
- Shows live shipment statistics via [CurrentShipmentStat](../CurrentShipmentStats/CurrentShipmentStat.tsx)
- Lazy-loads [FinanceDashboard](../../../FinanceDashboard/FinanceDashboard.tsx) for on-demand finance management
- Coordinates data fetching for today's shipment totals via [useTodayShipmentTotals](../../../../features/shipments/hooks/useTodayShipmentTotals.ts)

## Public API (Props & Exports)
- `AdminLandingPage()` - Default export, no props (reads token/companyId from Redux)

## Internal Structure

### Key Sections
1. **Hero Section** - Welcome message, date display, quick action buttons
   - Uses [AdminFeatures](../../../../components/LandingPage/AdminFeatures.tsx) for discount modal
   - Navigation button routes to `/currentShipment`
2. **Snapshot Section** - Today's KPIs and progress indicators
   - [ProgressRing](../../../../components/visuals/ProgressRing.tsx) - Delivery completion percentage
   - KPI cards showing USD net, LBP payments, LBP expenses
   - [Sparkline](../../../../components/visuals/Sparkline.tsx) - Trend visualization for USD
3. **Live Stats Section** - Detailed shipment breakdown
   - [CurrentShipmentStat](../CurrentShipmentStats/CurrentShipmentStat.tsx) - Full statistics table
4. **Finance Section** - Lazy-loaded dashboard
   - [FinanceDashboard](../../../FinanceDashboard/FinanceDashboard.tsx) wrapped in Suspense

### State Management
- `name` - Username from Redux (`s.user.username`)
- `token` - Authentication token from Redux (`s.user.token`)
- `companyId` - Company ID from Redux (`s.user.companyId`)
- `today` - Shipment totals from `useTodayShipmentTotals` hook

### Computed Values
- `USD_overall` - Net USD calculation: `payments + extraProfits - expenses`
- `LIRA_overall` - Net LBP calculation: `payments + extraProfits - expenses`
- `usdTrend` - Mock trend array for sparkline (7 values derived from USD_overall)

## Dependencies (with links)

### Uses:
- [AdminFeatures](../../../../components/LandingPage/AdminFeatures.tsx) - Quick actions (discount modal)
- [CurrentShipmentStat](../CurrentShipmentStats/CurrentShipmentStat.tsx) - Today's shipment statistics display
- [FinanceDashboard](../../../FinanceDashboard/FinanceDashboard.tsx) - Finance management (lazy-loaded)
- [Sparkline](../../../../components/visuals/Sparkline.tsx) - Trend line visualization
- [ProgressRing](../../../../components/visuals/ProgressRing.tsx) - Progress circle indicator
- [useTodayShipmentTotals](../../../../features/shipments/hooks/useTodayShipmentTotals.ts) - Shipment totals data hook
- `useSelector` from `react-redux` - Redux state access
- `useNavigate` from `react-router-dom` - SPA navigation
- `React.lazy` & `Suspense` - Code splitting for FinanceDashboard

### Exposes to:
- Used by routing (AdminRouter) to render `/` route for admin users

## Data Flow

### Data In
1. **Redux Store** - Reads `username`, `token`, `companyId` from `state.user`
2. **useTodayShipmentTotals Hook** - Fetches and aggregates today's shipment totals:
   - Calls [listShipmentsRange](../../../../utils/apiShipments.ts) API service
   - Aggregates shipment data into totals object
   - Returns `{totals, loading, error, refetch}`

### Transformations
1. **USD/LBP Calculations** - Computed via `useMemo`:
   - `USD_overall = payments + extraProfits - expenses`
   - `LIRA_overall = payments + extraProfits - expenses`
2. **Trend Generation** - Mock sparkline data derived from `USD_overall`

### Data Out
1. **Navigation** - `navigate('/currentShipment')` for SPA routing
2. **Child Components** - Passes data as props:
   - `ProgressRing` receives `value={today.calculatedDelivered}` and `total={today.carryingForDelivery}`
   - `Sparkline` receives computed `usdTrend` array
   - KPI cards display formatted `USD_overall`, `today.shipmentLiraPayments`, `today.shipmentLiraExpenses`
   - `CurrentShipmentStat` uses same `useTodayShipmentTotals` hook internally (shared source of truth)

## Error Handling & Loading

### Error Handling
- **API Errors** - Handled inside `useTodayShipmentTotals` hook (sets error state)
- **Toast Notifications** - Single `ToastContainer` mounted in [Layout.jsx](../../../../Layout/Layout.jsx) at app root level

### Loading States
- **Hook Loading** - `useTodayShipmentTotals` manages `loading` state internally
- **Lazy Loading** - `Suspense` fallback shows "جارٍ التحميل…" while FinanceDashboard loads
- **Component Loading** - `CurrentShipmentStat` shows `SpinLoader` when `loading === true`

## i18n/RTL & Accessibility

### i18n
- **Strategy** - Arabic strings are hardcoded in component
- **Date Formatting** - Uses `toLocaleDateString("ar-LB")` for Arabic date display
- **Number Formatting** - Uses `toLocaleString("en-US")` for number display (consider Arabic locale for future)

### RTL
- **Direction** - Root div has `dir="rtl"` attribute
- **Layout** - CSS classes handle RTL layout (inherited from parent styles)

### Accessibility
- **No explicit aria attributes** - Consider adding `aria-label` to action buttons
- **Sparkline** - Has `aria-hidden="true"` (decorative)
- **ProgressRing** - SVG text element for percentage display

## Testing Notes

### What to Mock
- **Redux Store** - Mock `useSelector` to return `{username: "Test", token: "test-token", companyId: "test-id"}`
- **useNavigate** - Mock `useNavigate` from `react-router-dom`
- **useTodayShipmentTotals** - Mock hook to return controlled totals and loading state:
  ```ts
  jest.mock('../../../features/shipments/hooks/useTodayShipmentTotals', () => ({
    useTodayShipmentTotals: () => ({
      totals: { shipmentUSDPayments: 1000, ... },
      loading: false,
      error: null,
      refetch: jest.fn()
    })
  }))
  ```
- **React.lazy** - For FinanceDashboard, may need to mock or test with actual lazy loading

### Critical Test Cases
1. **Smoke Test** - Renders hero, quick actions, snapshot, live stats sections
2. **Navigation** - Click "عرض الشحنات" button calls `navigate('/currentShipment')`
3. **Data Display** - KPI cards show correct values from `useTodayShipmentTotals`
4. **Progress Ring** - Calculates and displays correct percentage from `today.calculatedDelivered / today.carryingForDelivery`
5. **Lazy Loading** - FinanceDashboard loads with Suspense fallback
6. **Shared Data** - Both AdminLandingPage and CurrentShipmentStat read from same hook (verify single API call)

## Gotchas & Future Work

### Known Limitations
- **Mock Trend Data** - `usdTrend` is hardcoded demo data, not real historical series
- **ToastContainer Location** - Ensure single instance in Layout, not duplicated in child components
- **No Error UI** - Hook errors are logged but not displayed to user
- **Hardcoded API URL** - Some API calls in Layout still use `http://localhost:5000` (should use config)

### Suggested Improvements
1. **Real Trend Data** - Replace mock sparkline with actual historical shipment data
2. **Error Boundaries** - Wrap sections in ErrorBoundary for graceful failure
3. **Loading Skeletons** - Replace simple fallback text with skeleton loaders
4. **Date Range Picker** - Allow users to view stats for different dates (not just today)
5. **Refresh Button** - Add manual refresh capability for shipment totals
6. **Print Report** - Implement actual print functionality for daily report
7. **i18n Extraction** - Move Arabic strings to translation files
8. **Accessibility** - Add aria-labels to interactive elements

## Split Summary

This component was refactored to extract reusable components and consolidate data fetching:

- **Extracted Visual Components:**
  - [Sparkline](../../../../components/visuals/Sparkline.tsx) - Trend line SVG visualization
  - [ProgressRing](../../../../components/visuals/ProgressRing.tsx) - Circular progress indicator

- **Created Data Hook:**
  - [useTodayShipmentTotals](../../../../features/shipments/hooks/useTodayShipmentTotals.ts) - Centralized shipment totals fetching and aggregation

- **Created API Service:**
  - [apiShipments.ts](../../../../utils/apiShipments.ts) - Unified shipment API calls (replaces hardcoded fetch)

- **Migrated to TypeScript:**
  - [AdminFeatures.tsx](../../../../components/LandingPage/AdminFeatures.tsx) - Converted from .jsx to .tsx

- **Removed:**
  - Custom event broadcasting (`window.dispatchEvent('trx:todayTotals')`) - replaced with shared hook
  - Duplicate ToastContainer - consolidated to Layout root
  - Raw fetch calls - replaced with apiShipments service
  - window.location.assign - replaced with useNavigate for SPA navigation

