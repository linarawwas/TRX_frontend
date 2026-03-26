# Areas for day

Route `/areas/:dayId`: lists areas for that delivery day from **IndexedDB only** (no HTTP on this screen). Dispatches `setAreaId` before navigating to `/customers/:areaId`.

- Product / UX: `docs/frontend/areas-for-day.md`
- Architecture baseline: `docs/architecture/refactor-baseline-areas-for-day.md`
