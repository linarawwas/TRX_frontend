import { runUnifiedRequest, UnifiedRequestError } from "../api/rtkRequest";

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
  try {
    const data = await runUnifiedRequest<ShipmentRound[] | unknown>(
      {
        url: `/api/shipments/${shipmentId}/rounds`,
        token,
      },
      "Failed to fetch shipment rounds"
    );
    return {
      ok: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      const body = error.body;
      return {
        ok: false,
        data: Array.isArray(body) ? (body as ShipmentRound[]) : [],
      };
    }
    return { ok: false, data: [] };
  }
}
