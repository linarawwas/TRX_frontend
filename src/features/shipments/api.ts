import { apiClient } from "../../api/client";

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
  const response = await apiClient.get<ShipmentRound[]>(
    `/api/shipments/${shipmentId}/rounds`,
    {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    data: Array.isArray(response.data) ? response.data : [],
  };
}
