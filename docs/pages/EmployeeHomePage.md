# Employee Home Page

**Path:** [src/pages/EmployeePages/EmployeeHomePage/EmployeeHomePage.tsx](../../src/pages/EmployeePages/EmployeeHomePage/EmployeeHomePage.tsx)  
**Role:** Main landing page for employees displaying today's shipment progress, round statistics, and quick action buttons.  
**Owner/Area:** Employee Pages

## Overview

The Employee Home Page serves as the primary dashboard for employees, providing:

- Connectivity / offline queue status (`EmployeeHomeStatusBar`; uses `navigator.onLine` + IndexedDB pending count)
- Compact welcome + date (`EmployeeHomeHeader`)
- Empty state when no active shipment (`EmployeeHomeEmptyState`) or today snapshot (`TodaySnapshot`) when `shipment._id` exists
- Round snapshot (`RoundSnapshot`) or muted empty copy when no active round
- Sticky action dock (`EmployeeActionDock`: continue to `/areas/:dayId`, start shipment modal with `StartShipment`)
- Footer (`EmployeeHomeFooter`)

## Key Components & Links

### Main Container

- **[EmployeeHomePage.tsx](../../src/pages/EmployeePages/EmployeeHomePage/EmployeeHomePage.tsx)** - Main page component orchestrating all sections

### Snapshot Components

- **[TodaySnapshot.tsx](../../src/components/AsideMenu/Right/TodaySnapshot.tsx)** - Displays today's overall shipment progress and financial KPIs
- **[RoundSnapshot.tsx](../../src/components/AsideMenu/Right/RoundSnapshot.tsx)** - Displays current round progress and financial KPIs
- **[ProgressSnapshot.tsx](../../src/components/snapshots/ProgressSnapshot.tsx)** - Shared presentational component for both snapshots (progress bar, KPIs, collapsible panel)

### Action & shell components (under `EmployeeHomePage/`)

- **[EmployeeActionDock.tsx](../../src/pages/EmployeePages/EmployeeHomePage/components/EmployeeActionDock.tsx)** — Primary actions + `StartShipment` modal (controlled from the page for empty-state parity)
- **[EmployeeHomeStatusBar.tsx](../../src/pages/EmployeePages/EmployeeHomePage/components/EmployeeHomeStatusBar.tsx)** — Online/offline + pending sync count
- **[EmployeeHomeHeader.tsx](../../src/pages/EmployeePages/EmployeeHomePage/components/EmployeeHomeHeader.tsx)** — Greeting + date
- **[EmployeeHomeEmptyState.tsx](../../src/pages/EmployeePages/EmployeeHomePage/components/EmployeeHomeEmptyState.tsx)** — No active shipment
- **[EmployeeHomeFooter.tsx](../../src/pages/EmployeePages/EmployeeHomePage/components/EmployeeHomeFooter.tsx)** — Copyright

### Hooks

- **[useNavigatorOnline.ts](../../src/hooks/useNavigatorOnline.ts)** — Subscribes to browser online/offline events
- **[usePendingRequestCount.ts](../../src/hooks/usePendingRequestCount.ts)** — Reads `getPendingRequests()` from IndexedDB (does not mutate the queue)

### Data & Selectors

- **[shipment.ts](../../src/redux/selectors/shipment.ts)** - Typed Redux selectors:
  - `selectShipmentMeta` - Returns shipment ID and dayId
  - `selectTodayProgress` - Returns today's target, delivered, returned, and financial values
  - `selectRoundProgress` - Returns current round progress and financial deltas

### Utilities

- **[progress.ts](../../src/features/shipments/utils/progress.ts)** - Pure utility functions:
  - `computeProgress(delivered, target)` - Calculates progress percentage, over-delivery, and reached status
  - `formatMoneyPair(usd, lbp)` - Formats USD and LBP values for display

## Data Flow

```
Redux Store (shipment slice)
    ↓
Typed Selectors (selectTodayProgress, selectRoundProgress, selectShipmentMeta)
    ↓
Progress Utilities (computeProgress, formatMoneyPair)
    ↓
ProgressSnapshot Component (shared UI)
    ↓
TodaySnapshot / RoundSnapshot (wrappers)
    ↓
EmployeeHomePage (layout)
```

### Selector Responsibilities

1. **selectShipmentMeta**
  - Returns `{ id: shipment._id, dayId: shipment.dayId }`
  - Used by `EmployeeActionDock` to link to current shipment areas
2. **selectTodayProgress**
  - Returns all today's shipment values:
    - `target, delivered, returned`
    - `paidUSD, paidLBP, expUSD, expLBP, profUSD, profLBP`
  - Used by TodaySnapshot
3. **selectRoundProgress**
  - Returns current round deltas (this round only):
    - `sequence, targetRound`
    - `deliveredThisRound, returnedThisRound`
    - `usdThisRound, lbpThisRound, expUsdThisRound, expLbpThisRound, profUsdThisRound, profLbpThisRound`
  - Used by RoundSnapshot

## i18n Keys

All user-facing Arabic strings are extracted to translation keys under the `emp.`* namespace:

### Home Page

- `emp.home.hello` - "مرحبا"
- `emp.status.online` / `emp.status.offline` / `emp.status.pendingSync` — connectivity strip
- `emp.home.loading` / `emp.home.empty.*` / `emp.home.syncError` / `emp.round.empty` — loading, empty, sync error, no round

### Snapshots

- `emp.snap.today.title` - "إحصاءات اليوم"
- `emp.snap.round.title` - "إحصاءات الجولة #"
- `emp.snap.goal` - "الهدف"
- `emp.snap.delivered` - "تم التسليم"
- `emp.snap.returned` - "المُعاد"
- `emp.snap.percentOfGoal` - "% من الهدف"

### KPIs

- `emp.kpi.cashToday` - "نقدية اليوم"
- `emp.kpi.expenses` - "المصاريف"
- `emp.kpi.extraProfits` - "الأرباح الإضافية"
- `emp.kpi.cashRound` - "نقدية الجولة"
- `emp.kpi.expensesRound` - "مصاريف الجولة"
- `emp.kpi.extraProfitsRound` - "الأرباح الإضافية (الجولة)"

### Round Messages

- `emp.round.targetLock` - "اكتمل الهدف لهذه الجولة. لزيادة التسليم، ابدأ جولة جديدة."

### Actions

- `emp.actions.goToShipment` - "الذهاب إلى تفاصيل الشحنة"
- `emp.actions.addProfits` - "إضافة أرباح"
- `emp.actions.addExpenses` - "إضافة مصاريف"
- `emp.actions.startShipment` - "بدء شحنة جديدة"
- `emp.actions.close` - "إغلاق النموذج"

### Footer

- `emp.footer.copyright` - "© 2025 تيركس بواسطة لينة الرواّس. جميع الحقوق محفوظة."

**Translation utility:** [src/utils/i18n.ts](../../src/utils/i18n.ts)

## Accessibility

### Modal Improvements

- Modal dialogs include `role="dialog"` and `aria-modal="true"`
- Close button receives initial focus when modal opens
- ESC key closes modal (handled via `onKeyDown` on overlay)
- All interactive elements use semantic `<button>` or `<Link>` elements
- Toggle buttons include `type="button"` and proper `aria-label` attributes

### Keyboard Navigation

- TAB focus moves into modal content
- ESC key closes modal
- All action buttons are keyboard accessible

## Extensibility

### Adding a New KPI

1. Update `selectTodayProgress` or `selectRoundProgress` to include new value
2. Add translation key for KPI label in `src/utils/i18n.ts`
3. Pass formatted money pair via `moneyToday`, `moneyExp`, or `moneyProf` props to `ProgressSnapshot`
4. Component will automatically render the new KPI

### Adding a New Snapshot

1. Create a new component similar to `TodaySnapshot` or `RoundSnapshot`
2. Use `ProgressSnapshot` as the base component
3. Create a selector if needed (or reuse existing)
4. Pass formatted data via props to `ProgressSnapshot`

### Example: Adding a Weekly Snapshot

```typescript
const WeeklySnapshot: React.FC = () => {
  const [open, setOpen] = useState(true);
  const weeklyData = useSelector(selectWeeklyProgress);
  const { pctForBar, pctDisplay, overBy, reached } = computeProgress(weeklyData.delivered, weeklyData.target);
  
  return (
    <ProgressSnapshot
      id="weekly-panel"
      open={open}
      onToggle={() => setOpen(v => !v)}
      title={t("emp.snap.weekly.title")}
      // ... other props
    />
  );
};
```

## Related Documentation

- [Admin Home Page](../AdminHomePage.md) - Similar dashboard structure for admins
- [RoundsHistory Component](../../src/components/Shipments/RoundsHistory/RoundsHistory.tsx) - Rounds list component used in TodaySnapshot

