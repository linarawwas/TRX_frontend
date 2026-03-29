You are a senior frontend engineer working on TRX, a mobile-first, offline-first SaaS application for route accounting and delivery management.

Before making any changes:
- Read ALL existing documentation in the project, especially:
  - TRX Product Overview (core flows, roles, offline-first constraints)
  - Any frontend architecture, state management, or data layer docs
- Understand that the Data Access Layer (DAL) is currently under active development and NOT finalized
- Your work MUST NOT break or bypass future DAL abstraction

Your task is to use the "Employee Home Page" as the reference implementation to define and enforce a scalable, consistent frontend architecture contract.

---

# 🎯 OBJECTIVE

Refactor the Employee Home Page so that it becomes:

1. The **reference implementation** of a strict frontend folder structure contract
2. A **blueprint** for how ALL pages in the app should be organized
3. Fully aligned with:
   - Offline-first architecture
   - Mobile-first UX
   - Future DAL integration
   - Scalable state management

---

# 🧱 PART 1 — DEFINE THE FOLDER STRUCTURE CONTRACT

Design a standardized folder structure for a page.

Each page MUST follow this contract:

/pages/employee-home/
  ├── index.tsx                // Entry point (thin)
  ├── EmployeeHomePage.tsx     // Main composition layer
  ├── components/              // Pure UI components (presentational only)
  ├── features/                // Feature-level logic (grouped by domain)
  ├── hooks/                   // Page-specific hooks
  ├── state/                   // Local/global state bindings (Redux/RTK)
  ├── services/                // API + DAL interaction layer (NO direct fetch)
  ├── adapters/                // Data transformation (API → UI models)
  ├── utils/                   // Pure utilities
  ├── types/                   // TypeScript types/interfaces
  ├── constants/               // Static configs
  ├── test-utils/              // Fixtures, store factories (NOT named *.test.* — Jest would run them)
  └── __tests__/               // Only *.test.ts / *.test.tsx

**Canonical docs in repo:** `docs/frontend/page-architecture-contract.md` (layers + **Testing contract**), `docs/architecture/frontend-project-blueprint.md` (whole `src/` map, test tiers, docs checklist, Conventional Commits).

Define CLEAR rules for each layer:

- components → no business logic
- features → orchestrates logic
- services → interacts with DAL ONLY (no raw API calls)
- adapters → normalize backend data to UI-friendly format
- state → integrates Redux/RTK Query (or future DAL)
- hooks → reusable logic specific to page
- page file → composition only, no logic

---

# ⚙️ PART 2 — REFACTOR EMPLOYEE HOME PAGE

Refactor the existing Employee Home Page to strictly comply with this contract.

While refactoring:

1. Extract ALL logic out of UI components
2. Separate:
   - UI
   - Business logic
   - Data fetching
   - State management
3. Ensure:
   - Clean separation of concerns
   - No duplicated logic
   - No direct API calls in components
4. Replace any legacy or inconsistent patterns

Respect TRX constraints:
- Offline-first behavior MUST remain intact
- Any data fetching must be compatible with queued/offline sync logic
- DO NOT break existing flows like:
  - today's snapshot
  - shipment state
  - round tracking

---

# 🔌 PART 3 — DATA ACCESS LAYER (CRITICAL CONSTRAINT)

The DAL is currently under maintenance.

You MUST:

- Identify ALL data-fetching logic in this page
- Abstract it into the /services layer
- Create interfaces that are DAL-compatible

DO NOT:
- Call fetch/axios directly inside components
- Hardcode API assumptions

Instead:
- Create a clean boundary like:

services/
  getEmployeeHomeSnapshot()
  getCurrentShipment()
  getTodayStats()

Each should:
- Return normalized data (via adapters)
- Be easily swappable with DAL later

---

# 🧠 PART 4 — STATE MANAGEMENT ALIGNMENT

- Identify all state used in Employee Home Page
- Separate:
  - UI state (local)
  - server state (remote)
  - global state (Redux)

Refactor so that:
- Server state is NOT manually managed if it should be handled by RTK Query / DAL
- Global state is only used where necessary (shipment, auth, etc.)
- Hooks encapsulate state logic

---

# 📱 PART 5 — MOBILE-FIRST + UX INTEGRITY

Ensure the refactor:
- Preserves mobile-first layout
- Keeps performance optimized
- Avoids unnecessary re-renders
- Keeps UI responsive under offline conditions

---

# 📚 PART 6 — DOCUMENTATION (MANDATORY)

Update or create documentation for:

1. Frontend Architecture Contract
   - Explain folder structure
   - Explain responsibilities of each layer
   - Provide examples from Employee Home Page

2. Data Access Pattern (Interim)
   - Explain how services layer works
   - Explain how it will integrate with DAL later

3. Refactor Notes
   - What changed in Employee Home Page
   - Why these decisions were made
   - What patterns should be reused

4. Migration Guide
   - How to refactor other pages using this pattern

5. Project blueprint
   - `docs/architecture/frontend-project-blueprint.md` — generalized structure, testing pyramid, INDEX updates, commit style

Ensure documentation is:
- Clear
- Structured
- Actionable

---

# 🧪 PART 7 — CODE QUALITY + TESTING

Ensure:
- Strong TypeScript typing
- No dead code
- No duplicated logic
- Clean naming conventions
- Scalable patterns

**Testing (aligned with page contract):** Cover adapters and pure utils first; then services (mock I/O at one boundary); then `state/` selectors; then view-model hooks (`renderHook`); then shell components (RTL, `MemoryRouter` when routing). Place shared Redux/state fixtures in `test-utils/`, not loose `__tests__/*.ts` under CRA. See `docs/frontend/page-architecture-contract.md#testing-contract`.

---

# 📦 PART 8 — FINAL OUTPUT

After completing everything, provide:

## 1. Summary of Changes
- What was refactored
- What improved

## 2. Folder Structure Contract (final version)

## 3. Key Architectural Decisions

## 4. Follow-up Recommendations
- What should be refactored next
- Risks to watch for

## 5. COMMIT MESSAGE

Write a professional, detailed commit message:

Format:

feat(frontend): establish page architecture contract via Employee Home refactor

- Introduced standardized page folder structure
- Refactored Employee Home Page to follow strict separation of concerns
- Extracted data access into services layer (DAL-ready)
- Introduced adapters for data normalization
- Improved state management boundaries
- Preserved offline-first behavior
- Updated frontend architecture documentation
- Added migration guide for other pages

---

# 🚫 CONSTRAINTS

DO NOT:
- Break existing functionality
- Introduce unnecessary abstractions
- Over-engineer
- Ignore offline-first requirements

---

# 🧭 MENTAL MODEL

You are not just refactoring a page.

You are defining the **frontend architecture foundation of TRX**.

Every future page will follow this.