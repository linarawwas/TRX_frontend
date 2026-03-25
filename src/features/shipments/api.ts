import { rtkResult, type ApiResult } from "../api/rtkTransport";

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
): Promise<ApiResult<ShipmentRound[]>> {
  const response = await rtkResult<unknown>(`/api/shipments/${shipmentId}/rounds`, {
    token,
    fallbackMessage: "Failed to load rounds",
  });
  if (response.error) return { data: null, error: response.error };
  return {
    data: Array.isArray(response.data) ? (response.data as ShipmentRound[]) : [],
    error: null,
  };
}
