# TRX Product Overview

## Section 1: One-Sentence Description

TRX is an offline-first, mobile-first SaaS application that digitizes the complete delivery and collection workflow for bottled-water and gas-cylinder distribution companies, enabling drivers to record deliveries, returns, and payments in real-time even without internet connectivity, while providing administrators with comprehensive financial dashboards and daily performance summaries.

---

## Product classification (what TRX is — and isn’t)

In the world of business software, TRX is best described as:

| Term | How TRX fits |
|------|-------------------------------|
| **Route accounting system (RAS)** | **Closest fit.** TRX is built around the “route”: a driver’s daily run with a defined set of customers (areas), recording what was delivered, returned, and collected at each stop. Route accounting is the standard category for beverage, food, and distribution companies that run delivery routes and need per-stop and per-day settlement. |
| **Delivery management / field service** | **Strong fit.** TRX manages delivery operations (shipments, rounds, areas, sequences), offline-capable mobile capture for field workers, and back-office visibility. It fits under delivery management or lightweight field service management (FSM) for last-mile distribution. |
| **Vertical / industry-specific** | **Yes.** TRX targets a narrow vertical (bottled-water and gas-cylinder distribution, including deposit/return and dual-currency). It is not a generic ERP or CRM. |

**What TRX is not:**

- **Not a full ERP** — It does not cover enterprise resource planning end-to-end (e.g. no manufacturing, HR, full general ledger, procurement). It handles delivery operations, route-level finance, and related reporting, not the whole business.
- **Not a classic CRM** — It holds customer and area data for delivery and billing, but it does not provide sales pipeline, marketing automation, or a generic “customer 360” for sales teams.
- **Not a warehouse IMS** — It tracks “delivered vs returned” and carrying quantities per shipment/round for distribution, not central warehouse inventory, stock levels, or warehouse operations.

**One-line classification:**  
TRX is a **route accounting and delivery management** application for **beverage and cylinder distribution**, with offline-first mobile order capture and back-office dashboards for operations and finance.

---

## Section 2: Target Users

TRX serves multiple user roles within distribution companies:

### Primary Users

1. **Drivers/Field Employees**
   - Record deliveries and returns at customer locations
   - Collect payments in multiple currencies (USD and Lebanese Pounds)
   - Work entirely offline during delivery routes
   - View their daily progress and round statistics

2. **Distribution Company Owners/Admins**
   - Monitor real-time delivery performance and financial metrics
   - Manage products, pricing, and customer discounts
   - View comprehensive financial dashboards with income/expense tracking
   - Generate daily and monthly reports
   - Oversee multiple distributors and their commission structures

3. **Accountants/Finance Managers**
   - Track all financial transactions (income and expenses) in dual currencies
   - View customer statements and outstanding balances
   - Monitor daily shipment summaries with net totals
   - Categorize and filter financial entries by type and date range

4. **Dispatchers/Operations Managers**
   - Organize delivery routes by areas and days of the week
   - Manage customer sequences within areas for optimal routing
   - View today's orders and shipment status
   - Coordinate multiple rounds within a single day

5. **Distributors (Sub-distributors)**
   - View their own performance metrics and commission calculations
   - Track their customers and delivery statistics
   - Access monthly analytics for their operations

---

## Section 3: Problems TRX Solves

### Operational Challenges

1. **Manual Paper-Based Systems**
   - Eliminates handwritten invoices and delivery notes that can be lost or damaged
   - Replaces physical ledgers that are difficult to search and update
   - Removes the need for manual data entry at the end of each day

2. **Offline Work Requirements**
   - Solves the problem of unreliable internet connectivity in delivery areas
   - Allows drivers to continue working seamlessly when network coverage is poor
   - Automatically syncs all recorded data when connection is restored

3. **Payment Tracking Confusion**
   - Prevents disputes about who paid what and when
   - Eliminates confusion about outstanding balances
   - Provides instant customer statements showing complete transaction history
   - Handles dual-currency payments (USD and LBP) with automatic exchange rate tracking

4. **Inventory and Returns Management**
   - Tracks how many bottles were delivered vs. returned accurately
   - Prevents over-returning (system enforces maximum returnable based on customer history)
   - Maintains real-time inventory counts per customer

5. **Daily Performance Visibility**
   - Provides instant visibility into daily delivery targets vs. actual performance
   - Shows real-time progress for each round within a day
   - Eliminates the need to wait until end-of-day to know how the business performed

6. **Financial Record Keeping**
   - Replaces scattered expense and income tracking across multiple notebooks
   - Provides categorized financial entries with filtering and search
   - Generates monthly summaries automatically
   - Tracks both operational expenses and extra profits separately

7. **Multi-Distributor Management**
   - Manages commission structures for sub-distributors
   - Tracks performance metrics per distributor
   - Provides analytics for distributor comparison and evaluation

8. **Route Organization**
   - Organizes customers by geographic areas
   - Allows custom sequencing of customers within areas for optimal delivery routes
   - Supports different delivery schedules per day of the week

---

## Section 4: Core Features (Frontend Perspective)

### 4.1 Shipment and Round Management

**What users can do:**
- Start a new shipment for the day by specifying the quantity of bottles loaded for delivery
- Begin additional rounds within the same day to increase delivery capacity
- View real-time progress: delivered vs. target, remaining bottles to deliver
- See round-specific statistics (what was delivered/returned/paid in the current round only)

**Business need:**
- Tracks daily delivery operations with clear targets
- Supports multiple delivery runs per day (rounds) without losing progress
- Provides immediate feedback on whether daily goals are being met

### 4.2 Order Recording (Deliveries, Returns, Payments)

**What users can do:**
- Select a customer from their assigned area
- Record number of bottles delivered
- Record number of empty bottles returned (system prevents over-returning)
- Record payments in USD or Lebanese Pounds (LBP)
- View instant calculation of customer balance after the order
- Send WhatsApp messages to customers with order summary (optional)

**Business need:**
- Replaces paper invoices with digital records
- Ensures accurate tracking of deliveries and returns
- Captures payments immediately at point of sale
- Provides transparency to customers via instant receipts

### 4.3 Offline-First Operation

**What users can do:**
- Work completely offline during delivery routes
- All customer data, product information, and discounts are pre-loaded and cached
- Orders recorded offline are automatically queued and synced when internet returns
- See visual indicators for pending offline orders

**Business need:**
- Critical for field operations where internet is unreliable
- Ensures no data loss even during connectivity issues
- Allows drivers to work without interruption

### 4.4 Customer Management

**What users can do:**
- Browse customers organized by delivery areas
- View customers sorted by delivery sequence (route order)
- Search customers by name, phone, or address
- View customer statements showing all historical orders and payments
- See current balance and remaining bottles for each customer
- Add new customers on the fly
- Update customer information

**Business need:**
- Organizes large customer bases efficiently
- Ensures drivers follow optimal delivery routes
- Provides complete customer history for dispute resolution
- Enables quick customer lookup during deliveries

### 4.5 Area and Route Organization

**What users can do:**
- View areas assigned to each day of the week
- See customers within each area
- Reorder customers within an area to optimize delivery sequence
- Navigate through areas during a delivery day

**Business need:**
- Supports different delivery schedules (e.g., Area A on Mondays, Area B on Tuesdays)
- Optimizes delivery routes to save time and fuel
- Allows flexible route planning per day

### 4.6 Financial Dashboard (Admin)

**What users can do:**
- View daily financial summaries with income and expenses in both currencies
- Browse monthly financial overviews with totals per day
- Add income or expense entries with categories
- Filter entries by type (income/expense), category, and date range
- Edit or delete financial entries
- See net totals (income minus expenses) in USD, LBP, and normalized USD

**Business need:**
- Replaces manual bookkeeping with digital records
- Provides real-time financial visibility
- Enables accurate financial reporting for accounting
- Supports dual-currency operations common in Lebanon

### 4.7 Daily Performance Dashboard (Admin)

**What users can do:**
- View today's delivery statistics: delivered, returned, target vs. actual
- See today's net revenue in USD and LBP
- Monitor payments collected (USD and LBP separately)
- Track expenses and extra profits for the day
- View delivery rate (delivered vs. target) as a visual progress ring
- Access detailed shipment information

**Business need:**
- Provides instant visibility into daily operations
- Helps identify performance issues early
- Enables data-driven decision making

### 4.8 Customer Statements and Invoices

**What users can do:**
- View complete transaction history for any customer
- See opening balance (bottles and money owed)
- Browse all orders with delivery/return/payment details
- Add additional payments to existing orders
- See running balance after each transaction
- View invoices with timestamps and exchange rates used

**Business need:**
- Resolves disputes about outstanding balances
- Provides transparency to customers
- Enables accurate collection of accounts receivable
- Maintains complete audit trail

### 4.9 Product Management (Admin)

**What users can do:**
- Add, edit, and delete products (e.g., different bottle sizes)
- Set prices in USD per product
- Mark products as returnable or non-returnable
- Set default product for the company

**Business need:**
- Manages product catalog centrally
- Supports multiple product types (water bottles, gas cylinders, etc.)
- Enables pricing updates without code changes

### 4.10 Customer Discounts (Admin)

**What users can do:**
- Apply custom discounts to specific customers
- Set discounted price per unit
- Add notes about discount reasons
- Discounts are automatically applied when recording orders for that customer

**Business need:**
- Supports negotiated pricing for large customers
- Maintains discount history and reasons
- Ensures consistent pricing application

### 4.11 Expenses and Extra Profits Tracking

**What users can do:**
- Record daily expenses (fuel, maintenance, etc.) in USD or LBP
- Record extra profits (additional income sources) in USD or LBP
- View all expenses and profits with date and currency
- Filter by date range

**Business need:**
- Tracks operational costs separately from order revenue
- Captures all income sources for accurate financial reporting
- Supports dual-currency expense tracking

### 4.12 Distributor Management

**What users can do:**
- View list of all distributors (sub-distributors)
- See distributor performance metrics: customers served, bottles delivered, revenue
- Calculate commissions based on configurable commission percentages
- View monthly analytics per distributor
- Filter by product type and month
- Compare distributor performance

**Business need:**
- Manages relationships with sub-distributors
- Automates commission calculations
- Provides performance insights for distributor evaluation

### 4.13 Daily Reports

**What users can do:**
- View all orders recorded today across all shipments
- See order details: customer, delivered, returned, payments
- Filter by shipment or view all
- Export or print daily order summaries

**Business need:**
- Provides end-of-day reconciliation
- Enables verification of all transactions
- Supports accounting and auditing requirements

### 4.14 Multi-Currency Support

**What users can do:**
- Record payments in USD or Lebanese Pounds (LBP)
- View all financial data in both currencies simultaneously
- System tracks exchange rates used at time of transaction
- Automatic conversion and normalization for reporting

**Business need:**
- Essential for Lebanon's dual-currency economy
- Handles currency fluctuations accurately
- Provides financial clarity in both currencies

---

## Section 5: Typical User Flows

### 5.1 A Day in the Life of a Driver

**Morning Setup:**
1. Driver opens TRX app on their mobile device
2. Logs in with their employee credentials
3. Lands on **Employee Home**: connectivity strip (online/offline), optional pending-sync count, compact greeting + date, then **today’s delivery progress** (when a shipment exists) and **round** summary, with financial KPIs scoped correctly (today vs. this round). If there is no active shipment yet, an **empty state** explains next steps; **sticky actions** at the bottom offer **Continue to route** (when the day’s area is known) and **Start shipment** (opens the same flow as before).
4. Taps **Start shipment** (from the dock or empty state) when beginning the day
5. Enters the number of bottles loaded in the truck (e.g., 200 bottles)
6. Confirms and submits
7. System shows loading screen: "Preparing shipment for offline work..."
8. App pre-loads all areas, customers, products, and discounts into device storage
9. Progress bar shows: "Loading areas...", "Caching data...", "Preparing customers..."
10. Once complete, driver is taken to the "Areas" screen

**During Delivery Route:**
11. Driver sees list of areas for today (e.g., "Downtown", "Hamra", "Achrafieh")
12. Taps on first area (e.g., "Downtown")
13. Sees list of customers in that area, sorted by delivery sequence
14. Each customer shows their status: not visited (white), pending (yellow), completed (green)
15. Driver taps on first customer (e.g., "John's Restaurant")
16. Sees customer details: name, address, phone, current balance, remaining bottles
17. Taps "Record Order" button
18. Enters:
    - Delivered: 10 bottles
    - Returned: 8 empty bottles
    - Paid USD: $20
    - Paid LBP: 0 (or enters LBP amount if paid in Lebanese Pounds)
19. System shows preview: "Balance after: $X, Remaining bottles: Y"
20. Driver confirms order
21. If offline: Order is saved locally with "Pending" status
22. If online: Order is immediately sent to server
23. System shows success message
24. Driver can optionally send WhatsApp message to customer with order summary
25. Returns to customer list - customer now shows as "Completed" (green)
26. Repeats steps 15-25 for next customer

**Mid-Day Round:**
27. After completing first round, driver returns to warehouse
28. Loads more bottles (e.g., 150 more)
29. Taps "Start New Round" (not new shipment - same day)
30. Enters additional bottles loaded
31. System adds to today's target (now 350 total)
32. Driver continues with more deliveries

**End of Day:**
33. Driver views "Today's Snapshot" to see:
    - Total delivered: 320 bottles
    - Total returned: 280 bottles
    - Total payments: $640 USD + 2,000,000 LBP
    - Progress: 91% of target delivered
34. If any orders were recorded offline, they automatically sync when driver returns to area with internet
35. Driver can view "Today's Orders Report" to verify all transactions

### 5.2 A Day in the Life of an Admin/Owner

**Morning Check:**
1. Admin logs into TRX on desktop or tablet
2. Sees admin dashboard with:
   - Today's date and greeting
   - Quick action buttons
   - Today's snapshot: delivery rate, net USD, LBP payments, LBP expenses
3. Views "Current Shipment" to see:
   - Which drivers are active
   - Real-time delivery progress
   - Current round information

**During the Day:**
4. Admin receives notification that a customer needs a discount
5. Navigates to "Add Discount" feature
6. Selects customer, enters discounted price, adds note
7. Discount is immediately available to drivers
8. Admin adds an expense: "Fuel - $50 USD"
9. Records it in Finance Dashboard
10. Views customer statement for a customer who called with a question
11. Shows complete transaction history and current balance

**End of Day Review:**
12. Admin views Finance Dashboard "Daily" tab
13. Sees summary:
    - Income from orders: $2,500 USD
    - Expenses: $150 USD
    - Net: $2,350 USD
    - LBP totals shown separately
14. Switches to "Monthly" tab
15. Views calendar-style overview of entire month
16. Sees which days were profitable
17. Clicks on a specific day to see detailed entries
18. Reviews "Today's Orders Report"
19. Verifies all orders match driver records
20. Exports or prints report for accounting records
21. Views "Shipments" page
22. Filters by date range (e.g., last 7 days)
23. Sees aggregated statistics:
    - Total shipments: 7
    - Total delivered: 2,100 bottles
    - Total revenue: $4,200 USD
24. Reviews distributor performance
25. Checks commission calculations for the month

**Weekly/Monthly Tasks:**
26. Admin reviews distributor analytics
27. Compares performance across distributors
28. Adjusts commission rates if needed
29. Adds new products or updates prices
30. Organizes customer routes by adjusting area sequences
31. Generates monthly financial reports from Finance Dashboard

### 5.3 A Day in the Life of an Accountant

**Daily Tasks:**
1. Accountant logs into TRX
2. Navigates directly to Finance Dashboard
3. Views "Daily" tab to see today's financial summary
4. Verifies income matches order totals
5. Reviews expense entries for accuracy
6. Checks that all entries have proper categories

**Monthly Reconciliation:**
7. Switches to "Monthly" view
8. Selects current month
9. Reviews daily totals
10. Identifies any days with unusual patterns
11. Switches to "Entries" tab
12. Filters by:
    - Month: Current month
    - Type: Income (or Expense)
    - Category: Specific category if needed
13. Reviews each entry for accuracy
14. Edits any incorrect entries
15. Adds missing entries (e.g., forgot to record an expense)
16. Views totals at top:
    - Total Income: $X USD, Y LBP
    - Total Expenses: $A USD, B LBP
    - Net: $Z USD, C LBP
17. Exports data for external accounting software if needed

**Customer Account Management:**
18. Receives call from customer about their balance
19. Navigates to customer search
20. Finds customer and opens their statement
21. Reviews all transactions
22. Identifies any discrepancies
23. Adds payment if customer made payment that wasn't recorded
24. Provides customer with updated statement

---

## Section 6: Screens / Modules List

### 6.1 Authentication & Setup
- **Login Screen**: User authentication with role-based access (Admin vs. Employee)
- **Registration**: New user account creation (admin-controlled)

### 6.2 Driver/Employee Screens

#### Home & Navigation
- **Employee Home Page** (`EmployeeHomePage`):  
  - **System status**: online/offline + queued offline request count (IndexedDB), without blocking business KPIs  
  - **Context**: greeting + today’s date (compact header)  
  - **Empty state** when no `shipment._id`: copy + primary CTA to start a shipment  
  - **Today snapshot** (when a shipment exists): collapsible card with **full progress** (goal, delivered, bar, %, returned) + today’s cash/expense/profit KPIs + rounds list for the shipment  
  - **Round snapshot**: round-scoped progress and KPIs (labels use “round”, not “today”), or a muted message when no active round  
  - **Sticky action dock**: text + icon — **Go to areas** (`/areas/:dayId` when available), **Start shipment** / close (modal with existing `StartShipment` flow)  
  - **Footer**: copyright, separate from actions  
  - **Loading**: skeleton while user name is not yet hydrated  
  - **Error**: banner if the pending-queue read fails (rare); does not alter sync behavior  

  *See also **Employee Home: design notes** and **Employee Home: components reference** in this document.*

#### Shipment Management
- **Start Shipment Screen**: 
  - Form to enter bottles loaded for delivery
  - Detects if starting new day vs. new round
  - Shows preloading progress for new shipments
  - Preloads all data for offline operation

#### Delivery Operations
- **Areas for Day Screen** (`/areas/:dayId`): 
  - **Offline-first:** area list and day name are read from **IndexedDB** only (no network on this screen); data must already have been cached when the shipment was prepared.
  - **System visibility:** a **connectivity strip** (online/offline) plus a short **offline hint** so drivers do not confuse “no network” with “no areas.”
  - **Title:** weekday name (Arabic mapping when the cached name is English) + existing emoji title string from i18n.
  - **Primary action:** tap an **area row** → navigate to `/customers/:areaId` and set **order `areaId`** in Redux (required for the record-order flow).
  - **States:** loading skeleton, empty list, IndexedDB error with **retry**, same semantics as before refactor.
  - **Secondary:** link to **`/areas`** for other delivery-day routes (unchanged intent).
  - *Details:* [docs/pages/AreasForDay.md](pages/AreasForDay.md)

- **Customers for Area Screen** (`/customers/:areaId`): 
  - Customer list from **IndexedDB** only (preload elsewhere); **no** API on this screen
  - **Device connectivity** strip (live online/offline) plus, when relevant, a **“pending orders”** banner (customers with unsent/pending orders — count in copy)
  - Segments: **pending** (accordion), **completed** (filled vs empty), **active**; **search** filters name/phone/address
  - **SessionStorage** remembers accordion collapse **per area**
  - **Error + retry** if IndexedDB read fails
  - Tap customer → set order **id/name/phone** → **record order** route (`isExternal` from navigation state)
  - *See [docs/pages/CustomersForArea.md](pages/CustomersForArea.md)*

- **Record Order Screen** (`/recordOrderforCustomer`, `RecordOrderForCustomer` + `RecordOrder`): 
  - **Shell:** back control (44px tap target), **discount cache** from IndexedDB via `useCustomerDiscountFromCache` (loading skeleton; same cache miss / load-error toasts as before), optional **LBP reference** on the discount card when a shipment rate exists
  - **Embedded flow (`RecordOrder`):** customer name header, delivered/returned steppers, USD/LBP payments, discount-driven checkout when cache says `hasDiscount`, balance preview, submit (offline queue unchanged)
  - Optional WhatsApp message sending
  - *See [docs/frontend/record-order-for-customer.md](frontend/record-order-for-customer.md)*

#### Viewing & Reports
- **Today's Orders Report**: 
  - List of all orders recorded today
  - Filterable by shipment
  - Shows customer, delivered, returned, payments

- **Current Shipment Screen**: 
  - View active shipment details
  - Real-time statistics

### 6.3 Admin Screens

#### Dashboard
- **Admin Home Page**: 
  - Hero section with date and quick actions
  - Today's snapshot with KPI cards:
    - Delivery rate (visual progress ring)
    - Net USD with trend sparkline
    - LBP payments
    - LBP expenses
  - Current shipment details panel
  - Finance Dashboard preview (lazy-loaded)

#### Financial Management
- **Finance Dashboard**: 
  - Tabbed interface: Daily, Monthly, Add Entry, Entries
  - **Daily Tab**: 
    - Date picker
    - Summary tiles: Income USD/LBP, Expenses USD/LBP, Net USD/LBP
    - Detailed breakdown by category
  - **Monthly Tab**: 
    - Year/month selector
    - Calendar-style grid showing daily totals
    - Click day to see details
    - Monthly totals summary
  - **Add Entry Tab**: 
    - Form to add income or expense
    - Category selection
    - Multiple payment entries (USD/LBP)
    - Date and notes
  - **Entries Tab**: 
    - Filterable list of all financial entries
    - Filters: month, type (income/expense), category
    - Edit and delete functionality
    - Totals display for filtered results

#### Customer Management
- **Customers List**: 
  - All customers in the company
  - Search by name, phone, address
  - Links to customer details and statements

- **Customer Statement**: 
  - Complete transaction history
  - Opening balance display
  - All orders with details
  - Add payment functionality
  - Running balance after each transaction

- **Add Customer**: 
  - Form to create new customer
  - Name, phone, address, area assignment

- **Update Customer**: 
  - Edit customer information
  - Change area assignment

#### Product Management
- **Products List**: 
  - All products (bottles, cylinders, etc.)
  - Product type, price in USD, returnable status
  - Add, edit, delete functionality
  - Set default product

- **Add Product**: 
  - Form to create new product
  - Type, price, returnable checkbox

#### Area & Route Management
- **Areas List**: 
  - All delivery areas
  - Add new areas
  - View customers per area

- **Addresses/Area Details**: 
  - Customers within an area
  - Reorder customers (drag-and-drop on desktop, up/down buttons on mobile)
  - Change delivery sequence

- **Areas for Day**: 
  - Which areas are assigned to which day of week
  - Navigate to customers in area

#### Discount Management
- **Add Discount**: 
  - Select customer
  - Enter discounted price per unit
  - Add note about discount reason
  - Discount applies automatically to future orders

#### Expense & Profit Tracking
- **View Expenses**: 
  - List of all expense entries
  - Filter by date range
  - Shows amount and currency

- **View Profits**: 
  - List of all extra profit entries
  - Filter by date range
  - Shows amount and currency

- **Add Expense**: 
  - Form: name, value, currency (USD/LBP)

- **Add Profit**: 
  - Form: name, value, currency (USD/LBP)

#### Distributor Management
- **Distributors List**: 
  - All sub-distributors
  - Search functionality
  - Product selection filter
  - Month selection for analytics
  - Performance metrics per distributor
  - Commission calculations

- **Distributor Details**: 
  - Individual distributor view
  - Detailed analytics
  - Customer list for distributor
  - Monthly performance charts

#### Reports & Analytics
- **Shipments List**: 
  - Filter by date range
  - View all shipments with statistics
  - KPI cards: count, delivered, returned, total USD, total LBP, payments, expenses, profits
  - Individual shipment cards with details

- **Orders Table**: 
  - All orders across all shipments
  - Filterable and sortable
  - Update order functionality

- **Today's Orders Report**: 
  - All orders for selected date
  - Grouped by shipment
  - Detailed order information

#### Order Management
- **Update Order**: 
  - Edit existing order
  - Modify delivered/returned quantities
  - Add additional payments
  - Update payment information

### 6.4 Shared Screens (Both Admin & Employee)

- **Login**: Authentication screen
- **Areas**: Browse all areas
- **Customers**: Browse all customers
- **Current Shipment**: View active shipment
- **Expenses**: View expense entries
- **Profits**: View profit entries
- **Distributors**: View distributors (if applicable)

---

## Employee Home: design notes

**Why the layout changed**

- Field users need **delivery progress and money context** before decorative chrome; the home screen was refocused around **operational status** and **correct KPI labeling** (today vs. current round).
- **Offline-first** behavior must be **visible** (connectivity + pending queue size) without mixing that signal with shipment math.
- **Primary actions** (continue route vs. start shipment) needed **explicit labels** and a **sticky dock** suited to one-handed mobile use.

**UX principles applied**

- **Progressive disclosure**: snapshots remain collapsible; today’s **progress summary is visible** when the panel is used (no hiding the main goal/delivered story behind a collapsed default without reason).
- **Semantic clarity**: round financial rows use round-specific copy; today’s rows use today’s copy.
- **System visibility**: loading (profile hydration), empty (no shipment), error (queue read), offline (browser + banner).
- **Separation of concerns**: UI state (modal open) lives in the page; business state stays in Redux; queue depth is read-only from IndexedDB.

---

## Employee Home: components reference

Reusable pieces live under `src/pages/EmployeePages/EmployeeHomePage/components/` unless noted.

| Component | Purpose |
|-----------|---------|
| `EmployeeHomeStatusBar` | Shows online/offline and pending sync count; optional error if IndexedDB read fails |
| `EmployeeHomeHeader` | Compact greeting + localized date |
| `EmployeeHomeEmptyState` | No active shipment: explanation + CTA (opens same start flow as dock) |
| `EmployeeHomeSkeleton` | Profile not ready (no username yet) |
| `EmployeeActionDock` | Sticky primary actions + `StartShipment` modal (controlled by page) |
| `EmployeeHomeFooter` | Copyright, visually separate from actions |

**Hooks**

| Hook | Purpose |
|------|---------|
| `useNavigatorOnline` | Subscribes to `online` / `offline` |
| `usePendingRequestCount` | Reads `getPendingRequests()` length; refreshes on mount and when back online |

**Shared snapshot**

| Piece | Purpose |
|-------|---------|
| `ProgressSnapshot` (`kpiScope: 'today' \| 'round'`) | Shared card UI; KPI labels follow scope |

*Detailed route data flow: [docs/pages/EmployeeHomePage.md](pages/EmployeeHomePage.md).*

---

## Technical Notes (for Reference)

### Offline Architecture
- Uses IndexedDB for local data storage
- Preloads customer data, products, discounts, and areas at shipment start
- Queues API requests when offline, auto-syncs when online
- 10-second delay before sync to avoid rapid reconnection issues

### Multi-Currency Handling
- All financial data stored with currency type
- Exchange rates tracked per transaction
- Normalized USD calculations for reporting
- Separate totals for USD and LBP throughout

### Data Flow
- Redux for global state (shipment, order, user info)
- IndexedDB for offline persistence
- Automatic sync on reconnection
- Optimistic UI updates for better UX

### Mobile-First Design
- Responsive layouts for phone screens
- Touch-optimized controls
- RTL (right-to-left) support for Arabic
- Collapsible sections for long lists
- Bottom sheets for mobile-friendly modals

---

*This document was generated by analyzing the frontend codebase of TRX. It reflects the application's features and user flows as implemented in the code.*

