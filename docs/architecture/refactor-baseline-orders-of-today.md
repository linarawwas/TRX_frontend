# Orders of today (by date) — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/Login/reports/orders-today/OrdersOfToday.tsx`, `OrdersOfToday.css`. Routed at `/reports/orders-today` (`CommonRoutes.tsx`).

**Date:** 2026-03-26

## 1. Component hierarchy

```
OrdersOfToday (default: error boundary)
└── OrdersOfTodayInner
    ├── Page header (title, date controls, summary stats)
    ├── Loading / error messages
    └── Main content
        ├── Section “طلبات اليوم” (type === 2, defaultOpen)
        └── Section “طلبات خارجية” (type === 3)
            └── OrderCard list per section
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Auth** | Redux `user.token` — gate fetch; missing token → Arabic error string, no HTTP. |
| **Orders by date** | RTK Query **`useLazyShipmentsOrdersByDateQuery`** from `src/features/api/trxApi.ts` → `GET /api/shipments/orders/by-date?includeExternal=…&date=…`. |
| **Trigger** | Initial `useEffect` when `token` is set; manual **عرض** button calls same loader with optional `date` (`YYYY-MM-DD`). |
| **Derived UI** | `rows` (`ShipmentWithOrders[]`) flattened → `type2Orders` / `type3Orders` by `order.type`; `totalCount` sum. |

**Note:** `technical-debt.md` records prior migration from `apiToday.ts` into `trxApi`; this page does **not** use `requestRaw`.

## 3. State management

- **Global:** Redux read-only (`user.token`).
- **Local:** `useState` for `loading`, `err`, `dateStr` (date input + display), `rows`.
- **No offline queue** on this screen: read-only reporting; no IndexedDB or mutation replay.

## 4. Async behavior

- **Retries:** Inherited from RTK Query / `fetchBaseQuery` defaults (no custom retry in component).
- **Concurrency:** Original pattern: `cancelled` flag in `useEffect` only skipped *starting* load; in-flight `unwrap()` could still settle (address with mounted ref + guarded state updates).
- **Date fallback:** If response omits `date`, UI falls back to Beirut “today” string when display date still empty (avoid stale closure on `dateStr`).

## 5. `requestRaw` usage

- **None.** Data path is RTK Query only.

## 6. UI / CSS risks identified (pre-refactor)

- **`OrdersOfToday.css`:** `@media (min-width: 768px)` hid `.ooty-reflowList` while **no desktop table** was rendered in TSX → orders could **disappear on tablet/desktop** (functional bug).
- **Spacing / hierarchy:** Serviceable but generic; room for enterprise polish (focus rings, loading skeleton, calmer density).
- **Inline render helper** (`renderStacked`) recreated each render; acceptable but refactor-friendly extract to memoized child.

## 7. Risks to preserve

- Query params: `includeExternal: true` must remain for parity with backend expectations.
- Order typing: `type === 2` vs `type === 3` split and labels (Arabic).
- Links: `/updateCustomer/${customerObjId || customerid}`.
- USD/LBP display: prefer `sumUSD` / `sumLBP`, else reduce `payments[]` by currency (preserve math).

## 8. Follow-up phases (this feature)

- **Phase 1:** Pure helpers, typed errors, mounted guard, `useCallback` loader, subcomponents, optional `createLogger` on failure (dev / prod-safe).
- **Phase 2:** N/A for dedicated offline replay on this page (read-only).
- **Phase 3:** CSS tokens, 8px rhythm, accessible controls, loading skeleton, remove desktop hide regression.
- **Phase 4:** Optional RTL/component test or helper unit tests if Jest env stable.

---

## Phases 1–3 (implemented, 2026-03-26)

- **Data / architecture:** Kept `useLazyShipmentsOrdersByDateQuery` and `includeExternal: true` (no `requestRaw`). Added `getQueryErrorMessage` for RTK / serialized errors, `mountedRef` to avoid setState after unmount, functional `setDateStr` fallback for missing API date, `createLogger` on failures.
- **Structure:** `OrderCard` and `ReportSection` memoized; route default export wrapped in `OrdersOfTodayErrorBoundary` with reload affordance.
- **UI/UX:** Page-level design tokens in CSS, toolbar + stat chips, skeleton loading, focus-visible rings, teal enterprise accent aligned with TRX; **removed** the `@media (min-width: 768px)` rule that hid `.ooty-reflowList` without a desktop table (layout bugfix).
- **A11y:** `lang="ar"`, `aria-busy` / `aria-live`, labeled date field (`useId`), `role="alert"` on errors, `type="button"` on actions.

---

**See also:** [State management — RTK Query usage](../state-management.md) (`OrdersOfToday` cited as consumer of generated hooks).
