# Areas (company list) — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/Areas/` — `Areas.tsx`, `hooks/useAreasCompanyList.ts`, `components/AreasConnectivityBar.tsx`, `components/AreasErrorPanel.tsx`, `Areas.css`. **Embedded:** `AddArea` when the add form is visible.

**Date:** 2026-03-26

## 1. Component hierarchy

```
Areas
├── AreasConnectivityBar (offline hint when device offline)
├── Header: title + toggle (show grid vs AddArea form)
├── Loading: SpinLoader
├── Error: AreasErrorPanel + retry → reload()
└── Content
    ├── Grid of Link → /addresses/:areaId (when form hidden)
    └── AddArea (when form visible)
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Auth** | `selectUserToken` — fetch gated on token. |
| **Areas list** | `useAreasCompanyList` → `fetchAreasByCompany(token)` in `features/areas/apiAreas` (via **`rtkResult`**, not `requestRaw`). |
| **Refetch** | Effect deps `[token, formVisible]` — toggling form re-runs fetch (legacy: refresh after add). |

## 3. State management

- **Local:** `formVisible`, list state inside hook.
- **Redux:** Token only (read); no areas slice on this page.

## 4. Async / offline

- **Online:** HTTP list load; errors surfaced with retry.
- **Offline:** `AreasConnectivityBar` warns; fetch may still fail — error UI + retry.

## 5. `requestRaw`

- **Not used** — `apiAreas` uses shared transport (`rtkResult`).

## 6. Risks to preserve

- `formVisible` in fetch deps so list refreshes after add flow.
- Links: `/addresses/${area._id}`.
- `aria-expanded` / `aria-controls` on toggle.

## 7. Notes (pre-change)

- `Areas.tsx` on disk did not import `useAreasCompanyList` / connectivity / error components yet (orphan files); wire-up + UI pass planned.
- Unused `Carousel` imports in `Areas.tsx` — remove.
