/**
 * Normalizes raw pending-queue payload from storage into a UI-safe count.
 * When DAL exposes a typed queue DTO, map it here instead of touching components.
 */
export function adaptPendingRequestsToCount(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.length;
}
