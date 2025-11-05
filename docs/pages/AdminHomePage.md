# Admin Home Page

**Path:** [src/pages/AdminPages/AdminHomePage/AdminHomePage.tsx](../../src/pages/AdminPages/AdminHomePage/AdminHomePage.tsx)  
**Role:** Main admin landing page displaying today's shipment statistics, financial KPIs, and quick actions (RTL layout).  
**Owner/Area:** Admin Pages

## Overview

The Admin Home Page serves as the primary dashboard for administrators, providing:
- Real-time shipment delivery statistics with progress visualization
- Financial KPIs (net USD, LBP payments, LBP expenses) with trend sparklines
- Quick action buttons for common tasks
- Detailed shipment statistics
- Lazy-loaded finance dashboard

## Key Components & Links

### Main Container
- **[AdminHomePage.tsx](../../src/pages/AdminPages/AdminHomePage/AdminHomePage.tsx)** - Main container component orchestrating all sections

### Data Components
- **[CurrentShipmentStat.tsx](../../src/pages/AdminPages/AdminHomePage/CurrentShipmentStats/CurrentShipmentStat.tsx)** - Displays detailed shipment statistics (carrying, delivered, returned, payments, expenses, profits, totals)
- **[useTodayShipmentTotals.ts](../../src/features/shipments/hooks/useTodayShipmentTotals.ts)** - Custom hook that fetches and aggregates today's shipment data from API
- **[totals.ts](../../src/features/shipments/utils/totals.ts)** - Utility functions for computing net totals (`computeNetTotals`) and generating trend data (`seedTrend`)

### Visual Components
- **[ProgressRing.tsx](../../src/components/visuals/ProgressRing.tsx)** - Circular progress indicator showing delivery rate percentage
- **[Sparkline.tsx](../../src/components/visuals/Sparkline.tsx)** - Mini line chart for USD trend visualization

### Extracted Presentational Components
- **[KpiCard.tsx](../../src/components/dashboard/KpiCard.tsx)** - Reusable KPI card component (title, value, subtitle, optional children)
- **[RingCard.tsx](../../src/components/dashboard/RingCard.tsx)** - Wrapper component combining ProgressRing with metadata rows

### Supporting Components
- **[AdminFeatures.tsx](../../src/components/LandingPage/AdminFeatures.tsx)** - Modal triggers for discount management and exchange rate
- **[FinanceDashboard.tsx](../../src/pages/AdminPages/FinanceDashboard/FinanceDashboard.tsx)** - Lazy-loaded finance management interface

## Data Flow

```
token/companyId (Redux)
    ↓
useTodayShipmentTotals(token, companyId)
    ↓
{ totals, loading, error }
    ↓
computeNetTotals(totals) → { usd, lbp }
    ↓
KPIs & RingCard (display)
    ↓
CurrentShipmentStat (uses same hook internally)
```

### Data Sources

1. **useTodayShipmentTotals Hook**
   - Fetches shipments for today's date via `listShipmentsRange` API
   - Aggregates shipment data into totals object
   - Returns `{ totals, loading, error, refetch }`
   - Totals include: carryingForDelivery, calculatedDelivered, calculatedReturned, payments (USD/LBP), expenses (USD/LBP), extra profits (USD/LBP)

2. **computeNetTotals Utility**
   - Pure function: `(totals: ShipmentTotals) => { usd, lbp }`
   - Computes net USD: `payments + extraProfits - expenses`
   - Computes net LBP: `payments + extraProfits - expenses`
   - Handles null/undefined with `|| 0` guards

3. **seedTrend Utility**
   - Pure function: `(base: number) => number[]`
   - Generates 7-point trend array for sparkline visualization
   - Uses relative multipliers: `[0.4, 0.6, 0.5, 0.8, 0.9, 0.7, 1]`

## i18n Keys

All user-facing Arabic strings are extracted to translation keys under the `dashboard.*` namespace:

- `dashboard.hello` - "مرحباً"
- `dashboard.quickActions.viewShipments` - "عرض الشحنات"
- `dashboard.quickActions.printToday` - "تقرير اليوم"
- `dashboard.netUSD` - "صافي الدولار"
- `dashboard.netUSDSubtitle` - "مدفوعات − نفقات + أرباح إضافية"
- `dashboard.liraPayments` - "مدفوعات الليرة"
- `dashboard.liraPaymentsSubtitle` - "إجمالي المقبوض بالليرة"
- `dashboard.liraExpenses` - "نفقات الليرة"
- `dashboard.liraExpensesSubtitle` - "جميع المصاريف اليوم"
- `dashboard.todayShipmentDetails` - "تفاصيل شحنة اليوم"
- `dashboard.deliveryRateToday` - "نسبة التسليم اليوم"
- `dashboard.loading` - "جارٍ التحميل…"
- `dashboard.error` - "حدث خطأ في تحميل البيانات"

**Translation utility:** [src/utils/i18n.ts](../../src/utils/i18n.ts)

## CSS Classes

### Main Layout
- `.admin-home` - Root container (max-width: 520px, grid layout)
- `.admin-hero` - Hero section with greeting and quick actions
- `.snapshot` - Today's statistics section (grid layout, responsive)
- `.pane` - Details section container

### Components
- `.ring-card` - Progress ring container (grid: ring + metadata)
- `.kpi-wrap` - KPI cards container (grid layout)
- `.kpi-card` - Individual KPI card (with `.accent` variant for highlighted card)
- `.skeleton` - Loading skeleton styles (shimmer animation)

**CSS file:** [src/pages/AdminPages/AdminHomePage/LandingPage.css](../../src/pages/AdminPages/AdminHomePage/LandingPage.css)

## Loading & Error States

- **Loading:** Displays skeleton loaders for ring card and KPI cards when `loading === true`
- **Error:** Shows inline error message (translated) when `error !== null`
- **Success:** Renders full UI with RingCard and KpiCard components

## Accessibility

- All buttons include `type="button"` and `aria-label` attributes
- Suspense fallback includes `role="status"` and `aria-live="polite"`
- ProgressRing handles `total === 0` gracefully (shows 0%)
- RingCard receives `Math.max(0, total || 0)` to prevent negative values

## Extensibility

### Adding a New KPI Card

1. Import `KpiCard` component
2. Add translation keys for title/subtitle in `src/utils/i18n.ts`
3. Add `<KpiCard>` to `.kpi-wrap` container
4. Ensure CSS classes remain compatible (`.kpi-card`, `.kpi-title`, `.kpi-num`, `.kpi-sub`)

### Adding a New Section

1. Create new `<section>` with appropriate CSS class
2. Use same loading/error guard pattern if data-dependent
3. Extract reusable components if logic is shared

## Related Documentation

- [FinanceDashboard README](../src/pages/AdminPages/FinanceDashboard/docs/README.md)
- [useTodayShipmentTotals Hook](../../src/features/shipments/hooks/useTodayShipmentTotals.ts)

