// src/features/shipments/hooks/useTodayShipmentTotals.ts
import { useState, useEffect } from "react";
import { listShipmentsRange } from "../../../utils/apiShipments";

interface ShipmentTotals {
  carryingForDelivery: number;
  calculatedDelivered: number;
  calculatedReturned: number;
  shipmentLiraPayments: number;
  shipmentUSDPayments: number;
  shipmentLiraExtraProfits: number;
  shipmentUSDExtraProfits: number;
  shipmentLiraExpenses: number;
  shipmentUSDExpenses: number;
}

export function useTodayShipmentTotals(
  token: string,
  companyId?: string,
  date?: Date
) {
  const [totals, setTotals] = useState<ShipmentTotals>({
    carryingForDelivery: 0,
    calculatedDelivered: 0,
    calculatedReturned: 0,
    shipmentLiraPayments: 0,
    shipmentUSDPayments: 0,
    shipmentLiraExtraProfits: 0,
    shipmentUSDExtraProfits: 0,
    shipmentLiraExpenses: 0,
    shipmentUSDExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    const targetDate = date || new Date();
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();

    const dateObj = { day, month, year };

    setLoading(true);
    setError(null);
    try {
      const result = await listShipmentsRange(token, {
        companyId,
        fromDate: dateObj,
        toDate: dateObj,
      });

      // Aggregate totals from shipments
      const aggregated: ShipmentTotals = {
        carryingForDelivery: 0,
        calculatedDelivered: 0,
        calculatedReturned: 0,
        shipmentLiraPayments: 0,
        shipmentUSDPayments: 0,
        shipmentLiraExtraProfits: 0,
        shipmentUSDExtraProfits: 0,
        shipmentLiraExpenses: 0,
        shipmentUSDExpenses: 0,
      };

      for (const s of result.shipments || []) {
        aggregated.carryingForDelivery += s.carryingForDelivery || 0;
        aggregated.calculatedDelivered += s.calculatedDelivered || 0;
        aggregated.calculatedReturned += s.calculatedReturned || 0;
        aggregated.shipmentLiraPayments += s.shipmentLiraPayments || 0;
        aggregated.shipmentUSDPayments += s.shipmentUSDPayments || 0;
        aggregated.shipmentLiraExtraProfits += s.shipmentLiraExtraProfits || 0;
        aggregated.shipmentUSDExtraProfits += s.shipmentUSDExtraProfits || 0;
        aggregated.shipmentLiraExpenses += s.shipmentLiraExpenses || 0;
        aggregated.shipmentUSDExpenses += s.shipmentUSDExpenses || 0;
      }

      setTotals(aggregated);
    } catch (err) {
      setError("Failed to fetch shipment totals");
      console.error("Error fetching shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, date?.getTime()]);

  return { totals, loading, error, refetch };
}

