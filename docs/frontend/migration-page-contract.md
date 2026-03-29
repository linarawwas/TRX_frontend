# Migrating other pages to the page contract

Use **Employee Home** (`src/pages/EmployeePages/EmployeeHomePage/`) as the template.

## Steps

1. **Inventory data sources** — Redux, RTK Query, IndexedDB, `navigator`, props. List them in a short baseline doc under `docs/architecture/`.
2. **Extract services** — For each I/O boundary, add `services/<verb><Entity>.service.ts` returning typed results (`ok` / `error` or `Result` types). No JSX.
3. **Add adapters** — If the payload is raw or backend-shaped, normalize in `adapters/` before the hook consumes it.
4. **Centralize selectors** — Move `useSelector` wiring into `state/` (re-export or thin wrappers around existing selectors).
5. **One view-model hook** — `use<Page>ViewModel()` returns everything the shell needs, including callbacks and local UI state.
6. **Shell component** — Move layout JSX from the page file into `components/<Page>Shell.tsx` with a typed props interface in `types/`.
7. **Thin page file** — `PageName.tsx` imports CSS, calls the hook, spreads props into the shell.
8. **Optional `index.tsx`** — `export { default } from "./PageName"` so the router can `import Page from "../pages/.../FeatureFolder"`.
9. **Tests** — Follow the [page architecture contract § Testing](./page-architecture-contract.md#testing-contract): adapters → services → state → hooks → shell. Place fixtures in **`test-utils/`**, not arbitrary `__tests__/*.ts` (CRA may run them as suites).
10. **Docs + commit** — Update `docs/INDEX.md` and use Conventional Commits; see [frontend project blueprint](../architecture/frontend-project-blueprint.md).

## Pitfalls

- **Duplicating global hooks** — If a hook already lives under `src/hooks/`, either keep using it from the view model or migrate its implementation into a shared `services/` module both call (avoid `src/hooks` importing from `pages/`).
- **Over-abstracting** — Skip `features/` until a second workflow clearly belongs there.
- **Breaking offline** — Preserve refresh-on-`online` and non-mutating queue reads when moving IndexedDB access into services.

## Checklist

- [ ] No `fetch` / `axios` in `components/`
- [ ] Page file under ~30 lines
- [ ] View model type exported from `types/`
- [ ] Services documented as DAL-swappable in file header
