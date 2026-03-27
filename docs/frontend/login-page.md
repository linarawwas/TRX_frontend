# Login page (`Login.tsx`)

**Styles:** `Login.css` (shared with `LoginForm` class names: `.login-form`, `.login-button`, etc.).

## Behavior

- Body class **`login-page`** toggled on mount/unmount for edge-to-edge background.
- Form logic and API calls remain in **`LoginForm.tsx`**.

## Extending

- Prefer auth changes in `features/auth/api.ts` and `LoginForm`; keep the shell in `Login.tsx` for layout, a11y, and global page class only.
