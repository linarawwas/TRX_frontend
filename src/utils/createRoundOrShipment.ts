// utils/createRoundOrShipment.ts
export type CreateRoundPayload = {
  dayId: string;
  type: number; // 1 = normal
  carryingForDelivery: number;
  date: { day: number; month: number; year: number };
};

export async function createRoundOrShipment(opts: {
  token: string;
  payload: CreateRoundPayload;
  prevShipmentId?: string | null;
  prevDayId?: string | null;
}) {
  const { token, payload, prevShipmentId, prevDayId } = opts;

  const res = await fetch("http://localhost:5000/api/shipments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const out = await res.json().catch(() => ({} as any));
  if (!res.ok || !out?.shipment?._id) {
    throw new Error(out?.error || "Shipment creation failed");
  }

  const shipment = out.shipment;
  const round = out.round;

  // If the returned shipment matches what's in Redux for today -> it's a round.
  const isNewShipment = !(
    prevShipmentId &&
    shipment._id === prevShipmentId &&
    prevDayId &&
    shipment.dayId === prevDayId
  );

  return { shipment, round, isNewShipment };
}
