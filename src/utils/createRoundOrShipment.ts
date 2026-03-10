// utils/createRoundOrShipment.ts

/**
 * PURPOSE
 * -------
 * Call the backend "create-or-add-round" endpoint.
 * The server will:
 *   - Upsert today's shipment (one per day per company).
 *   - If a shipment for today already exists, it will create a *round* document
 *     and increment today's shipment carrying target.
 *   - If not, it will create a brand-new shipment for today.
 *
 * RETURN
 * ------
 * { shipment, round?, isNewShipment }
 * - `shipment` : The canonical Shipment doc for today (new or existing).
 * - `round`    : Present only when this call created a *round* (i.e., same-day upsert).
 * - `isNewShipment` : true if this resulted in a brand-new shipment (different day),
 *                     false if it was a same-day round.
 *
 * FRONTEND CONTRACT
 * -----------------
 * - The caller compares the returned shipment against what Redux currently holds:
 *   If it's the same shipment id/day, treat it as a ROUND (don't preload).
 *   If it's a different shipment/day, treat it as a NEW SHIPMENT (clear state + preload).
 */

/** Payload the backend expects for "create-or-add-round". */
export type CreateRoundPayload = {
  dayId: string; // Day document id for "today" (derived from weekday)
  type: number; // 1 = normal (keep your enum aligned with backend)
  carryingForDelivery: number; // Amount to add (for a round) or set (for new day)
  date: {
    // Required by backend for unique keys (YYYY-MM-DD parts)
    day: number;
    month: number;
    year: number;
  };
};

/** Shape we expect back from the API. */
type ApiResponse = {
  shipment: any; // Shipment doc (always present on success)
  round?: any; // Round doc (present when we added a round on same-day shipment)
};

/**
 * Create a new shipment for the given date OR add a round to today's shipment.
 *
 * HOW THE DECISION IS MADE:
 * - The server decides whether this becomes a new shipment or just a new round.
 * - We *infer* that decision client-side by checking if the returned shipment
 *   matches the one we already had in Redux for the same day.
 *
 * @param opts.token          Auth token (Bearer)
 * @param opts.payload        CreateRoundPayload (dayId, date triple, etc.)
 * @param opts.prevShipmentId Shipment id currently in Redux (if any)
 * @param opts.prevDayId      Day id currently in Redux (if any)
 *
 * @throws Error if the response is not OK or lacks a valid `shipment._id`
 */
export async function createRoundOrShipment(opts: {
  token: string;
  payload: CreateRoundPayload;
  prevShipmentId?: string | null;
  prevDayId?: string | null;
}) {
  const { token, payload, prevShipmentId, prevDayId } = opts;

  const res = await fetch(`${API_BASE}/api/shipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // standard Bearer header
    },
    body: JSON.stringify(payload),
  });

  // Parse JSON safely. If parsing fails, we still want a usable error below.
  const out: ApiResponse & { error?: string } = await res
    .json()
    .catch(() => ({} as any));

  // Defensive guard: backend must return a `shipment` with a valid `_id`.
  if (!res.ok || !out?.shipment?._id) {
    // Prefer server-provided error if available, otherwise generic message.
    throw new Error(out?.error || "Shipment creation failed");
  }

  // Normalized locals
  const { shipment, round = null } = out;

  /**
   * Determine whether this was a NEW shipment or a ROUND:
   * - If the previously-known shipment id/day match the newly returned shipment,
   *   then this is a ROUND (same-day upsert) → isNewShipment = false.
   * - Otherwise, this is a brand-new shipment for a different day → isNewShipment = true.
   *
   * WHY we need prevShipmentId and prevDayId:
   * - On first launch (no shipment in Redux), any success here is a new shipment.
   * - Later in the day, calls with the same day will upsert the same shipment id,
   *   signaling "round" rather than "new shipment".
   */
  const isNewShipment = !(
    prevShipmentId &&
    prevDayId &&
    shipment._id === prevShipmentId &&
    shipment.dayId === prevDayId
  );
  console.log(out);
  // The caller will use:
  // - `isNewShipment` to decide whether to clear Redux & preload areas (new day)
  // - or to snapshot round baselines (same day / round)
  return { shipment, round, isNewShipment };
}
