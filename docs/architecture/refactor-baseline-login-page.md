# Login page — refactor baseline (Phase 0)

**Scope:** `src/pages/SharedPages/Login/Login.tsx`, `Login.css`. Child: `LoginForm.tsx` (not modified in this slice unless coordinated).

**Date:** 2026-03-27

## 1. Component hierarchy

```
Login (default export)
└── LoginErrorBoundary (post-refactor)
    └── shell: ToastContainer, header (logo), main → LoginForm
```

## 2. Data flow (API → store → UI)

| Concern | Path |
|--------|------|
| **Submit** | `LoginForm` → `loginUser({ email, password })` → `rtkResult` `POST /api/auth/login` (not `requestRaw`) |
| **Success** | `localStorage.setItem("token", ...)`, toast, `reload()` after timeout |
| **RTL** | `LoginForm` `useEffect` sets `document.documentElement` `dir="rtl")` |

## 3. Side effects

- **Login.tsx:** `document.body.classList.add/remove("login-page")` for full-viewport styling.

## 4. State management

- No Redux on login route; post-reload hydration elsewhere.

## 5. Risks to preserve

- `data-testid` on form, email, password, submit (tests).
- Validation toast when fields empty; error toast shape from API.
- `credentials: "include"` lives in `loginUser`, not in page.

## 6. Post-refactor

- Error boundary + logger; semantic `header`/`main`, `h1` sr-only; `lang="ar"`; TRX-aligned `Login.css` (Tajawal, emerald/navy shell, card, focus rings).

See [frontend doc: login page](../frontend/login-page.md).
