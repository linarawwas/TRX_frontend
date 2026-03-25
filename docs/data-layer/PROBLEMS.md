# Data Layer Problem Status

Status review after unified transport migration.

## Severity: High

### 1) Duplicate critical endpoint ownership

- **Previous issue:** `/api/shipments/range` had multiple implementations.
- **Current status:** **Resolved**
- **Current owner:** `src/features/api/trxApi.ts` (`listShipmentsRange`).

### 2) Mixed transport strategy across features

- **Previous issue:** multiple network stacks used across the app.
- **Current status:** **Resolved**
- **Current owner model:** RTK Query (`trxApi`) + RTK-backed wrapper (`runUnifiedRequest`) for feature APIs.

### 3) Offline/business flows using divergent response semantics

- **Previous issue:** online/offline paths had incompatible transport contracts.
- **Current status:** **Resolved**
- **Current behavior:** both paths now go through RTK Query transport; wrappers normalize errors through `UnifiedRequestError`.

### 4) API calls scattered in UI layer

- **Previous issue:** endpoint-level calls existed directly in components/pages.
- **Current status:** **Partially Resolved**
- **Notes:** transport is unified, but some components still call feature API wrappers directly instead of dedicated domain hooks. Functional behavior is preserved.

### 5) Inconsistent success/error contracts

- **Previous issue:** mixed payload/throw/envelope semantics.
- **Current status:** **Partially Resolved**
- **Notes:** network error model is unified; compatibility envelopes remain intentionally in selected wrappers to avoid UI behavior regressions.

## Remaining Medium Priorities

1. Continue moving component-level feature API calls behind domain hooks where it improves reuse.
2. Incrementally remove compatibility envelopes once dependent UI paths are migrated.
3. Expand first-class typed endpoint definitions in `trxApi` for high-traffic feature paths currently routed through the generic unified endpoint.

## Risk Summary

- **High risk issues:** no open high-severity transport issues remain.
- **Main residual risk:** consistency of domain abstraction boundaries, not network transport divergence.
