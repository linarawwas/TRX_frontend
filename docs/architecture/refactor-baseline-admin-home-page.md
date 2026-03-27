# Admin home page — refactor baseline (Phase 0)

**Scope:** `src/pages/AdminPages/AdminHomePage/AdminHomePage.tsx`, `LandingPage.css` (legacy layout tokens), post-refactor `AdminHomePage.css` (premium overlay). Children: `AdminFeatures`, `RingCard`, `KpiCard`, `Sparkline`, `CurrentShipmentStat`, lazy `FinanceDashboard`.

**Date:** 2026-03-27

## 1. Component hierarchy

```
AdminHomePage (default: error boundary)
└── AdminHomePageInner
    ├── hero: greeting, date, AdminFeatures, quick actions (nav + print)
    ├── snapshot: RingCard + 3× KpiCard OR skeleton OR error
    ├── pane: title + CurrentShipmentStat
    └── Suspense → FinanceDashboard
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **User** | Redux `username`, `token`, `companyId` |
| **Today totals** | `useTodayShipmentTotals(token, companyId)` → RTK `listShipmentsRange` (same day) |
| **Derived** | `computeNetTotals(today)` → USD/LBP net; `seedTrend(USD_overall)` → sparkline points |
| **Navigation** | `useNavigate` → `/currentShipment` |
| **Print** | `window.print()` |

## 3. State management

- Redux read-only for user slice.
- RTK Query state inside hook; no local list state on this page.

## 4. Async / offline

- Inherits RTK Query behavior; lazy `FinanceDashboard` chunk loads on demand.
- Pre-refactor: hook `refetch` unused; error UI was text-only.

## 5. `requestRaw`

- **Not used** on this page.

## 6. Risks to preserve

- `RingCard` / `KpiCard` props and number formatting (`toLocaleString`, `maximumFractionDigits: 2`).
- Arabic date `toLocaleDateString("ar-LB", ...)`.
- i18n keys `dashboard.*`.
- Lazy import path for `FinanceDashboard`.
- `dir="rtl"` on root.

## 7. Post-refactor

- `refetch` + retry on snapshot error; `createLogger` on error; error boundary; `AdminHomePage.css` (Tajawal, shell gradient, skeleton/error/fallback classes); semantic `aria-*` on quick actions; `lang="ar"`.

See [frontend doc: admin home](../frontend/admin-home-page.md).
