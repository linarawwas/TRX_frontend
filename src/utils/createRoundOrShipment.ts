// utils/createRoundOrShipment.ts
export type CreateRoundPayload = {
  dayId: string;
  type: number; // 1 = normal
  carryingForDelivery: number;
  date: { day: number; month: number; year: number };
};

type ApiResponse = {
  shipment: any; // your Shipment doc
  round?: any;   // your Round doc when it's a round
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

  const out: ApiResponse & { error?: string } = await res.json().catch(() => ({} as any));
  if (!res.ok || !out?.shipment?._id) {
    throw new Error(out?.error || "Shipment creation failed");
  }

  const { shipment, round = null } = out;

  // If the newly returned shipment is the same one you already had today,
  // it's a round; otherwise it's a brand-new shipment.
  const isNewShipment = !(
    prevShipmentId &&
    prevDayId &&
    shipment._id === prevShipmentId &&
    shipment.dayId === prevDayId
  );

  return { shipment, round, isNewShipment };
}
