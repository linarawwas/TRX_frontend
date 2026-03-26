# Employee home — refactor baseline (Phase 0)

**Scope:** `src/pages/EmployeePages/EmployeeHomePage/` (page + local components). **Shared** widgets: `TodaySnapshot`, `RoundSnapshot` (`components/AsideMenu/Right/`), `StartShipment` (modal content in `EmployeeActionDock`).

**Date:** 2026-03-26

## 1. Component hierarchy

```
EmployeeHomePage
├── EmployeeHomeStatusBar (online/offline + pending sync count + sync error)
├── EmployeeHomeHeader (greeting + date)
├── main.employee-home__main
│   ├── TodaySnapshot (if shipmentId) OR EmployeeHomeEmptyState
│   └── RoundSnapshot (always; empty message if no round)
├── EmployeeActionDock (Link to /areas/:dayId if dayId; StartShipment modal)
└── EmployeeHomeFooter

Loading (no username yet): EmployeeHomeSkeleton only
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **User** | `useSelector` → `state.user.username`; skeleton until truthy. |
| **Shipment context** | `selectShipmentMeta` (`shipmentId`, `dayId`) drives empty vs `TodaySnapshot` and area link. |
| **KPIs** | `TodaySnapshot` / `RoundSnapshot` use Redux selectors (`selectTodayProgress`, `selectRoundProgress`, etc.) — **not** fetched inside `EmployeeHomePage.tsx`. |
| **Offline queue count** | `usePendingRequestCount` → IndexedDB `getPendingRequests()`; refreshes on mount and `window` `online`. |
| **Start shipment** | `StartShipment` inside modal (separate component tree; may dispatch / API — unchanged by page shell). |

## 3. State management

- **Redux:** User, shipment meta, progress selectors (consumed by snapshot components).
- **Local:** `shipmentModalOpen` for controlled modal; dock receives `onShipmentModalOpenChange`.
- **No duplicate server cache** in this page — snapshots read Redux.

## 4. Async and offline

- **Connectivity:** `useNavigatorOnline()`.
- **Pending requests:** Count-only read from IndexedDB; errors surfaced via `EmployeeHomeStatusBar` (`syncError` + i18n `emp.home.syncError`).
- **Modal:** `EmployeeActionDock` locks `document.body` overflow when open.

## 5. `requestRaw` / RTK Query

- **Grep:** No `requestRaw` or `requestJson` under `EmployeeHomePage/`.
- **RTK Query** migration for this **page file** is N/A; transport lives in feature modules (`StartShipment`, shipment APIs, etc.) if any.

## 6. UI / risks to preserve

- Empty state **must** call `onStartShipment` → opens same modal as dock (`setShipmentModalOpen(true)`).
- `dayId` must gate `/areas/${dayId}` link only when string is present.
- Modal focus trap / Escape: behavior in `EmployeeActionDock` must remain.
- `RoundSnapshot` shows muted empty when no active round — do not hide.

## 7. Follow-up (optional)

- `createLogger` in `usePendingRequestCount` catch path (shared hook).
- Visual alignment with `CustomersForArea` / `RecordOrderForCustomer` shells (gradient + surface card).
