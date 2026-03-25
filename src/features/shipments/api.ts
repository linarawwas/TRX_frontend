import { rtkEnvelope } from "../api/rtkTransport";

export type ShipmentRound = {
  _id: string;
  shipmentId: string;
  sequence: number;
  carryingForDelivery: number;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
};

export async function fetchShipmentRounds(
  token: string,
  shipmentId: string
): Promise<{ ok: boolean; data: ShipmentRound[] }> {
  const response = await rtkEnvelope(`/api/shipments/${shipmentId}/rounds`, {
    token,
  });
  return {
    ok: response.ok,
    data: Array.isArray(response.data) ? response.data : [],
  };
}
