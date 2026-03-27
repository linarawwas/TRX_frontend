# Unified aside menu (`UnifiedAsideMenu.tsx`)

**Styles:** `src/components/AsideMenu/UnifiedAsideMenu.css` (shared with `Left/` import path `../UnifiedAsideMenu.css`).

## Behavior

- **Drawer:** RTL slide-in; overlay dismiss; **Escape** closes; **body scroll locked** while open.
- **Logout:** `clearAuth(dispatch)` (token, company, admin, username in Redux + matching `localStorage` keys) then full reload.
- **Navigation:** Same routes as pre-refactor; hamburger has `aria-expanded` / `aria-controls`.

## Extending

- Add entries to the `baseNavItems` / `adminNavItems` arrays in the component; keep `adminOnly` / shipment guard pattern consistent.
