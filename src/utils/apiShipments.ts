// src/utils/apiShipments.ts
import { API_BASE } from "../config/api";

export async function listShipmentsRange(
  token: string,
  body: {
    companyId?: string;
    fromDate: { day: number; month: number; year: number };
    toDate: { day: number; month: number; year: number };
  }
): Promise<{ shipments: any[] }> {
  const res = await fetch(`${API_BASE}/api/shipments/range`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to fetch shipments");
  return res.json();
}

