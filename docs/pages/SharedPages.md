# SharedPages Directory Refactoring Documentation

## Overview
This document describes the refactoring of all pages in the `src/pages/SharedPages` directory. All pages have been refactored to follow consistent patterns: typed Redux selectors, unified API modules, i18n support, accessibility improvements, and proper error handling.

## Refactoring Summary

### Infrastructure Created

#### Typed Redux Selectors
- **`src/redux/selectors/user.ts`**: Selectors for user state (token, companyId, isAdmin, username)
- **`src/redux/selectors/order.ts`**: Selectors for order state (areaId, customerId, productId, etc.)
- **`src/redux/selectors/shipment.ts`**: Enhanced with customer order status selectors

#### API Modules
- **`src/features/areas/apiAreas.ts`**: API functions for areas and customers by area
- **`src/features/customers/apiCustomers.ts`**: API functions for customers by company
- **`src/features/orders/apiOrders.ts`**: API functions for orders by company
- **`src/features/shipments/apiShipments.ts`**: API functions for shipments by date range
- **`src/features/finance/apiFinance.ts`**: API functions for expenses and profits

#### Utility Functions
- **`src/features/areas/utils/sortCustomers.ts`**: Customer sorting by sequence and name
- **`src/features/shipments/utils/formatShipment.ts`**: Shipment formatting utilities (USD, LBP, date)
- **`src/features/finance/utils/formatTimestamp.ts`**: Timestamp formatting for Beirut timezone

#### i18n Extensions
- Extended `src/utils/i18n.ts` with keys for all SharedPages
- Added interpolation support for dynamic values (e.g., `{{count}}`, `{{dayName}}`)

## Refactored Pages

### 1. Addresses (`src/pages/SharedPages/Addresses/Addresses.tsx`)

**Purpose**: Display and reorder customers within an area.

**Data Flow**:
- Selectors: `selectUserToken`, `selectUserCompanyId`
- API: `fetchCustomersByArea`, `reorderCustomersInArea`
- Utils: `sortCustomersBySequence`

**Features**:
- Drag-and-drop reordering (desktop)
- Mobile-friendly up/down buttons
- Search functionality
- Loading/error/empty states

**i18n Keys Used**:
- `addresses.title`, `addresses.search.placeholder`
- `addresses.reorder.*` (toggle, apply, cancel, hint, success, error)
- `addresses.customer.*` (name, phone, address, status, sequence, moveUp, moveDown)
- `addresses.loading`, `addresses.empty`

**Accessibility**:
- `aria-label` on search input
- `aria-pressed` on reorder toggle
- `role="status"` and `aria-live="polite"` on loading state
- `role="alert"` on error state
- `type="button"` on all buttons

---

### 2. Areas (`src/pages/SharedPages/Areas/Areas.tsx`)

**Purpose**: Display all areas for a company with option to add new areas.

**Data Flow**:
- Selectors: `selectUserToken`, `selectUserCompanyId`
- API: `fetchAreasByCompany`

**Features**:
- Toggle between list view and add form
- Loading/error/empty states

**i18n Keys Used**:
- `addresses.areas.title`, `addresses.areas.addToggle`, `addresses.areas.showAreas`
- `addresses.empty`, `common.error`

**Accessibility**:
- `aria-expanded` and `aria-controls` on toggle button
- `role="alert"` on error state

---

### 3. AreasForDay (`src/pages/SharedPages/AreasForDay/AreasForDay.tsx`)

**Purpose**: Display areas assigned to a specific day (from IndexedDB cache).

**Data Flow**:
- IndexedDB: `getAreasByDayFromDB`, `getDayFromDB`
- Redux: `clearAreaId`, `setAreaId` actions

**Features**:
- Loads from IndexedDB (offline-first)
- Arabic day name translation
- Link to external areas

**i18n Keys Used**:
- `addresses.areasForDay.*` (title, loading, empty, unknownDay, loadError, otherAreas)

**Accessibility**:
- `role="status"` and `aria-live="polite"` on loading
- `role="alert"` on error

---

### 4. CustomersForArea (`src/pages/SharedPages/CustomersForArea/CustomersForArea.tsx`)

**Purpose**: Display customers in an area, grouped by order status (pending, completed, active).

**Data Flow**:
- IndexedDB: `getCustomersFromDB` (only; no network on this page)
- Selectors: `selectCustomersWithFilledOrders`, `selectCustomersWithEmptyOrders`, `selectCustomersWithPendingOrders`
- Redux order: clear customer fields on load; `setCustomerId`, `setCustomerName`, `setCustomerPhoneNb` before navigating to record order

**Features**:
- **Connectivity strip** (`useNavigatorOnline`) + optional offline hint
- **Pending-order banner** when any customer is in the pending bucket (count + online/offline messaging)
- Collapsible sections (pending, completed, active) with **sessionStorage** per `areaId`
- Search; skeleton loading; **error + retry** for IndexedDB read failure
- Scroll-to-top FAB (accessible label)

**i18n Keys Used**:
- `customersForArea.*` (including `offlineHint`, `retry`, `scrollTop`, `pending.cardAriaLabel`)

**Accessibility**:
- `aria-expanded` and `aria-controls` on accordion headers
- `role="button"` and keyboard handlers on customer cards
- Skeleton / loading `aria-busy`; error `role="alert"` with retry

**See also**: [CustomersForArea.md](./CustomersForArea.md)

---

### 5. OrdersTable (`src/pages/SharedPages/OrdersTable/OrdersTable.tsx`)

**Purpose**: Display all orders for a company in a table format.

**Data Flow**:
- Selectors: `selectUserToken`, `selectUserCompanyId`
- API: `fetchOrdersByCompany`

**Features**:
- Table view with customer, delivered, returned columns
- Link to update order page

**i18n Keys Used**:
- `orders.title`, `orders.table.*` (customer, delivered, returned, seeMore)
- `addresses.empty`, `common.error`

**Accessibility**:
- `aria-label` on edit links
- `role="alert"` on error state

---

### 6. ShipmentsList (`src/pages/SharedPages/Shipment/ShipmentsList.tsx`)

**Purpose**: Display shipments within a date range with KPIs and detailed cards.

**Data Flow**:
- Selectors: `selectUserToken`, `selectUserCompanyId`
- API: `fetchShipmentsByRange`
- Utils: `formatUSD`, `formatLBP`, `formatDMY`, `computeShipmentTotals`

**Features**:
- Date range picker
- Quick range buttons (today, last 7 days)
- KPI grid with totals
- Shipment cards with detailed breakdown

**i18n Keys Used**:
- `shipments.*` (title, filter, kpi, empty, card)

**Accessibility**:
- `type="button"` on all buttons
- `role="alert"` on error state
- Proper labels on date pickers

---

### 7. viewCustomers (`src/pages/SharedPages/viewCustomers/` — page contract)

**Purpose**: Display all customers (active and inactive) with search and add functionality.

**Data Flow**:
- Selectors: `selectCustomersPageToken` (`state/customersPageState.ts`, wraps `selectUserToken`)
- Service: `readCompanyCustomersSnapshot` → `fetchCustomersByCompany`
- Redux: `clearCustomerId` action

**Features**:
- Search across active and inactive customers
- Collapsible sections for active/inactive
- Toggle to show/hide add form

**i18n Keys Used**:
- `customers.*` (title, search, addToggle, showCustomers, active, inactive, noResults)
- `common.edit`, `common.error`

**Accessibility**:
- `aria-expanded` and `aria-controls` on accordion headers
- `aria-label` on search input
- `title` attribute on customer links

---

### 8. ViewExpenses (`src/pages/SharedPages/ViewExpenses/ViewExpenses.tsx`)

**Purpose**: Display and manage extra expenses.

**Data Flow**:
- Selectors: `selectUserToken`, `selectUserIsAdmin`
- API: `fetchExpenses`, `deleteExpense`
- Utils: `formatTimestamp`

**Features**:
- List of expenses with details
- Delete functionality
- Toggle to show/hide add form (non-admin only)

**i18n Keys Used**:
- `expenses.*` (title, addToggle, hideForm, empty, delete, fields)

**Accessibility**:
- `type="button"` on all buttons
- `aria-label` on delete buttons
- `aria-expanded` and `aria-controls` on toggle
- `role="alert"` on error state

---

### 9. ViewProfits (`src/pages/SharedPages/ViewProfits/ViewProfits.tsx`)

**Purpose**: Display and manage extra profits.

**Data Flow**:
- Selectors: `selectUserToken`, `selectUserCompanyId`, `selectUserIsAdmin`
- API: `fetchExtraProfits`, `deleteExtraProfit`
- Utils: `formatTimestamp`

**Features**:
- List of profits with details
- Delete functionality
- Toggle to show/hide add form (non-admin only)

**i18n Keys Used**:
- `profits.*` (title, addToggle, hideForm, empty, delete, fields)

**Accessibility**:
- `type="button"` on all buttons
- `aria-label` on delete buttons
- `aria-expanded` and `aria-controls` on toggle
- `role="alert"` on error state

---

### 10. RecordOrderForCustomer (`src/pages/SharedPages/RecordOrderForCustomer/RecordOrderForCustomer.tsx`)

**Purpose**: Field shell for recording an order for the customer in Redux. Loads per-customer discount from IndexedDB via `useCustomerDiscountFromCache`, shows `DiscountCard` when `hasDiscount`, and renders `RecordOrder` (submit and offline logic in `useRecordOrderController`).

**Data Flow**:
- Selectors: `selectOrderCustomerId`, `selectShipmentExchangeRateLBP` (optional LBP hint on `DiscountCard`)
- Hook: `useCustomerDiscountFromCache` → IndexedDB `getCustomerDiscountFromDB`
- Location state: `isExternal` (passed to `RecordOrder`)
- Components: `DiscountCard`, `RecordOrder`

**Features**:
- Back navigation (pill, safe-area aware)
- Discount loading skeleton; discount card when applicable; same cache toasts as before (missing cache / load error)
- External order flag support

**i18n Keys Used**:
- `common.back`, `recordOrderForCustomer.*` (cache toasts + discount card copy)

**Accessibility**:
- `type="button"` on back; `aria-label` on back; decorative SVG `aria-hidden`
- Discount skeleton: `role="status"`, `aria-busy`, `aria-label`

*Details:* [record-order-for-customer.md](../frontend/record-order-for-customer.md)

---

## Common Patterns

### Error Handling
All pages implement:
- Error state management
- User-friendly error messages via i18n
- `role="alert"` on error displays
- Console logging for debugging

### Loading States
All pages implement:
- Loading state management
- `role="status"` and `aria-live="polite"` on loading displays
- Spinner component (`SpinLoader`) where appropriate

### Empty States
All pages implement:
- Empty state messages via i18n
- Clear messaging when no data is available

### API Calls
All API calls:
- Use feature-specific API modules
- Use `API_BASE` from `src/config/api.ts` as the single source of truth for the backend base URL
- Include proper error handling
- Support cancellation via cleanup functions

### Type Safety
- All Redux selectors are typed using `RootState`
- All API functions have typed interfaces
- No `any` types in refactored code

### Accessibility
- All buttons have `type="button"` (except submit buttons)
- All interactive elements have proper ARIA attributes
- Keyboard navigation support where applicable
- Screen reader friendly labels

### i18n
- All user-facing strings use i18n keys
- Dynamic values use interpolation (e.g., `{{count}}`)
- Arabic default preserved

## File Structure

```
src/
├── redux/
│   └── selectors/
│       ├── user.ts          # User state selectors
│       ├── order.ts          # Order state selectors
│       └── shipment.ts       # Shipment state selectors (enhanced)
├── features/
│   ├── areas/
│   │   ├── apiAreas.ts       # Areas API
│   │   └── utils/
│   │       └── sortCustomers.ts
│   ├── customers/
│   │   └── apiCustomers.ts   # Customers API
│   ├── orders/
│   │   └── apiOrders.ts      # Orders API
│   ├── shipments/
│   │   ├── apiShipments.ts   # Shipments API
│   │   └── utils/
│   │       └── formatShipment.ts
│   └── finance/
│       ├── apiFinance.ts     # Expenses & Profits API
│       └── utils/
│           └── formatTimestamp.ts
├── pages/
│   └── SharedPages/
│       ├── Addresses/
│       ├── Areas/
│       ├── AreasForDay/
│       ├── CustomersForArea/
│       ├── OrdersTable/
│       ├── Shipment/
│       ├── viewCustomers/
│       ├── ViewExpenses/
│       ├── ViewProfits/
│       └── RecordOrderForCustomer/
└── utils/
    └── i18n.ts               # Extended with SharedPages keys
```

## Migration Notes

### Breaking Changes
None. All refactoring maintains backward compatibility with existing CSS classes and DOM structure.

### Dependencies
- All pages now depend on typed selectors instead of `useSelector((s: any) => ...)`
- All API calls go through feature modules instead of inline `fetch`/`axios`
- All strings use i18n instead of hardcoded Arabic

### Testing Recommendations
1. Test all pages with empty data
2. Test all pages with error states
3. Test keyboard navigation
4. Test screen reader compatibility
5. Verify i18n interpolation works correctly
6. Test offline scenarios (where IndexedDB is used)

## Future Improvements

1. **Hooks**: Consider creating custom hooks (e.g., `useAreas`, `useCustomers`) to further reduce duplication
2. **Error Boundaries**: Add error boundaries around each page
3. **Optimistic Updates**: Add optimistic updates for delete operations
4. **Pagination**: Add pagination for large lists (OrdersTable, viewCustomers)
5. **Caching**: Implement React Query or similar for better caching strategies

