/** Session storage keys for accordion collapse — must stay stable for UX continuity. */
export const COMPLETED_COLLAPSE_KEY = (areaId?: string) =>
  `trx.completed.collapsed.${areaId ?? "unknown"}`;
export const PENDING_COLLAPSE_KEY = (areaId?: string) =>
  `trx.pending.collapsed.${areaId ?? "unknown"}`;
