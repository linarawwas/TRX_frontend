# Shipments list — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/Shipment/ShipmentsList.tsx`, `ShipmentsList.css`. Uses `react-datepicker`, `react-toastify`, `useLazyListShipmentsRangeQuery` (RTK Query), `computeShipmentTotals` / format helpers from `features/shipments/utils/formatShipment`, `ShipmentData` / `DateObject` from `apiShipments`.

**Date:** 2026-03-27

## 1. Component hierarchy

```
ShipmentsList (default: error boundary)
└── ShipmentsListInner
    ├── ToastContainer
    ├── header
    ├── filter-card (from/to DatePicker, fetch, quick chips)
    ├── kpi-grid (skeleton | KPI cells)
    └── cards (skeleton | error+retry | empty | ShipmentCard × n)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Auth** | `selectUserToken`, `selectUserCompanyId` |
| **Fetch** | `useLazyListShipmentsRangeQuery` → `unwrap()` on button; body `{ companyId, fromDate, toDate }` |
| **Local state** | `fromDate` / `toDate` `DateObject`, `shipments[]`, `isLoading`, `error` |
| **Aggregates** | `computeShipmentTotals(shipments)` for KPI strip |

## 3. State management

- Redux: read token + companyId only.
- RTK Query: lazy trigger; no normalized cache subscription in component beyond trigger.

## 4. Async / offline

- `unwrap()` throws on error; toast + `setError`; inherits RTK/baseQuery offline semantics.

## 5. `requestRaw`

- **Not used**; RTK Query POST `/api/shipments/range`.

## 6. Risks to preserve

- Date validation + `toast.error` for incomplete range or missing auth.
- `dateFormat="dd/MM/yyyy"`; `setQuickRange` inclusive window.
- KPI order, labels (`t("shipments.kpi.*")`), accent on total USD/LBP only.
- **Known quirk:** some LBP metrics use `formatUSD` in JSX (pre-refactor); do not “fix” without product sign-off.

## 7. Post-refactor

- `useCallback` fetch + quick range; `createLogger` on failure; inline error + retry; error boundary; memo `ShipmentCard`; KPI config `useMemo`; 11 KPI skeletons; list skeleton instead of lone SpinLoader; TRX shell in CSS (`sls-*` augmenting `.ship-page`).

See [frontend doc: shipments list](../frontend/shipments-list.md).
