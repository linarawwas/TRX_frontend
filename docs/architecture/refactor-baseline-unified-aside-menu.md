# Unified aside menu — refactor baseline (Phase 0)

**Scope:** `src/components/AsideMenu/Left/UnifiedAsideMenu.tsx`, `src/components/AsideMenu/UnifiedAsideMenu.css`. Mounted from `Layout.tsx` (global chrome).

**Date:** 2026-03-27

## 1. Component hierarchy

```
UnifiedAsideMenu (default: error boundary)
└── UnifiedAsideMenuInner
    ├── ToastContainer
    ├── top-navbar (hamburger, logo → navigate /)
    ├── menu-overlay (click to close)
    └── aside.sidebar-drawer (nav links + footer actions)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Role** | Redux `user.isAdmin` |
| **Shipment context** | Redux `shipment._id`, `shipment.dayId` — gates “المسار” link |
| **Logout** | Pre-refactor: `toast`, `localStorage.removeItem("token")`, `reload()`, then `dispatch` clears (unreachable after reload). |
| **Prev shipment** | `dispatch(setShipmentFromPrev())` — button **disabled** for non-admin |

## 3. State management

- **Local:** `isMenuOpen` drawer.
- **Redux:** read-only except logout / prev-shipment button.

## 4. Async / offline

- No network in this component.

## 5. `requestRaw`

- **Not used.**

## 6. Risks to preserve

- All route paths and Arabic labels + emoji prefixes.
- Conditional links: `/areas/${dayId}` when `shipmentDefined && !isAdmin`.
- Admin-only: `/distributors`, `/Products`.
- Logo `navigate("/")`; sticky top bar z-index vs drawer (999/998).

## 7. Post-refactor

- `RootState` selectors; `clearAuth(dispatch)` before reload; Escape + overlay `currentTarget`; scroll lock; `type="button"`; `aria-*`; nav config `useMemo`; error boundary; TRX CSS (`uam-*` / enhanced tokens).

See [frontend doc: unified aside menu](../frontend/unified-aside-menu.md).
