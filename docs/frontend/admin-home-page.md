# Admin home (`AdminHomePage.tsx`)

**CSS:** `LandingPage.css` (grid, cards, skeleton keyframes) + `AdminHomePage.css` (TRX shell, error, suspense fallback). **Print:** `AdminHomePage.css` hides `.quick-actions` when printing.

## Sections

1. **Hero** — `t('dashboard.hello')` + username, localized date, `AdminFeatures` (discount dialog is portaled to `document.body`, centered overlay), shipments + print actions.
2. **Snapshot** — delivery ring + net USD (sparkline), lira payments, lira expenses; loading skeleton; error + retry.
3. **Today details** — `CurrentShipmentStat` inside `.pane`.
4. **Finance** — `React.lazy` + `Suspense` with styled loading tile.

## Extending

- New KPIs: extend `useTodayShipmentTotals` aggregation and add another `KpiCard`.
- Prefer i18n for any new strings; keep RTL and print behavior in mind.
