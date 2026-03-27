# Distributors list — refactor baseline (Phase 0)

**Scope:** Route `src/pages/AdminPages/Distributors/DistributorsPage.tsx` (thin shell) and implementation `src/components/Distributors/DistributorsPage.tsx`, `Distributors.css`, plus shared hook `useCompanyDistributorData` and `features/distributors/apiDistributors.ts` (read-only for this pass unless coordinated).

**Date:** 2026-03-27

## 1. Component hierarchy

```
AdminRouter lazy route
└── pages/AdminPages/Distributors/DistributorsPage.tsx (re-export / shell)
    └── components/Distributors/DistributorsPage.tsx
        ├── ToastContainer
        ├── header.dist-head (title + dist-actions)
        │   ├── MonthPicker | MonthPickerSkeleton
        │   ├── Product select | ProductSelectSkeleton
        │   ├── Search input
        │   ├── View toggle (admin vs distributor metrics)
        │   └── Create button → AddToModel modal
        ├── ProductSelectionPrompt (when products loaded, no product selected)
        ├── LoadingMessage + DistributorListSkeleton | empty states | dist-grid of Link cards
        └── AddToModel (create distributor)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Distributors list** | `useCompanyDistributorData` → `listDistributors(token)` (`apiDistributors` / `rtkJson`) → normalized list |
| **Customers** | `fetchCustomersByCompany(token)` → merged active+inactive |
| **Orders** | `fetchOrdersByCompany(token, companyId)` — scoped by `companyId` |
| **Products** | `listCompanyProducts(token, companyId)` |
| **Default product** | Redux `default.default_product` via `setDefaultProduct` — drives analytics gate |
| **Analytics** | Pure `buildDistributorAnalytics` from `./utils/metrics` (orders/customers/range/price) |
| **Create** | `createDistributor(token, { name, commissionPct })` from modal; then `refreshDistributors` + `refreshCustomers` |

**No `requestRaw`** in `DistributorsPage.tsx`; transport is `rtkJson` and related helpers in feature APIs.

## 3. State management

- **Redux:** `user.token`, `user.companyId`, `default.default_product` (read/write for product select).
- **Local:** `search`, `showCreate`, `isAdminView`.
- **Hook state:** All server lists and loading flags in `useCompanyDistributorData`.

## 4. Async / offline

- **Parallel loads:** Four `useEffect` chains refresh distributors, customers, orders, products independently.
- **Errors:** Toasts + `console.error` in hook; lists cleared on failure.
- **No IndexedDB / offline queue** on this list page for the primary reads; create goes through `createDistributor` (HTTP).

## 5. `requestRaw` usage

- **None** in the distributors page component. Migration to RTK Query would belong in `apiDistributors` / shared API layer, not a one-off in the page.

## 6. UI / code risks (pre-refactor)

- `(s as any)?.default` instead of typed `RootState.default`.
- Inline styles on “choose product” empty state.
- `modelFields={createFields as any}` for `AddToModel`.
- No error boundary on the route/component shell.
- `Distributors.css` functional but not aligned with newer TRX token-heavy shells (teal/navy, focus rings).

## 7. Risks to preserve

- Product must remain **explicitly** selected for commission/revenue metrics; `enriched` zeroes KPIs when no product (existing behavior).
- Detail links: `/distributors/:id?from=&to=` query from `range`.
- Admin toggle hides **revenue USD** only; commission row stays visible.
- Create flow: toast, modal close, refresh distributors + customers.

## 8. Phases 1–3 (implemented, 2026-03-27)

- **Types / safety:** `s.default.default_product` instead of `(s as any)`; `AddToModel` `modelFields` typed via `ComponentProps<typeof AddToModel>["modelFields"]`; token/companyId use `?? ""`.
- **Resilience:** `DistributorsErrorBoundary` + `createLogger` around `DistributorsPageInner`; reload affordance on failure.
- **UI:** `lang="ar"`, subtitle (`.dist-lede`), enterprise tokens (teal/navy), toolbar card, chips/month input/search focus rings, denser metric tiles, empty states (`.dist-empty--warning`) without inline styles; primary/secondary button polish (`.dist-btn-*`).
- **Route shell:** `pages/AdminPages/Distributors/DistributorsPage.tsx` documents that implementation lives under `components/Distributors/`.
- **Fetch layer:** Unchanged (`useCompanyDistributorData` / `rtkJson`); RTK Query migration remains a separate API-layer task.

---

**See also:** [Shipments list — baseline](./refactor-baseline-shipments-list.md), [Unified aside menu](./refactor-baseline-unified-aside-menu.md).
