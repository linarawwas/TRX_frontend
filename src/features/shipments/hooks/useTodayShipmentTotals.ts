// src/features/shipments/hooks/useTodayShipmentTotals.ts
import { useMemo } from "react";
import { useListShipmentsRangeQuery } from "../../api/trxApi";

export interface ShipmentTotals {
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
  _token: string | null,
  companyId?: string,
  date?: Date
) {
  const targetDate = date || new Date();
  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1;
  const year = targetDate.getFullYear();

  const { data, isLoading, isError, refetch } = useListShipmentsRangeQuery(
    {
      companyId,
      fromDate: { day, month, year },
      toDate: { day, month, year },
    },
    {
      // keep existing semantics: fetch on mount and when args change
      refetchOnMountOrArgChange: true,
    }
  );

  const totals: ShipmentTotals = useMemo(() => {
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

    for (const s of data?.shipments || []) {
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

    return aggregated;
  }, [data]);

  return {
    totals,
    loading: isLoading,
    error: isError ? "Failed to fetch shipment totals" : null,
    refetch,
  };
}

