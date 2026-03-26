import { useMemo } from "react";
import { segmentCustomersForArea } from "../customersForAreaSegmentation";
import type { CustomerRow } from "../customersForAreaTypes";

export function useSegmentCustomersForArea(
  customers: CustomerRow[],
  searchTerm: string,
  customersWithFilledOrders: string[] | undefined,
  customersWithEmptyOrders: string[] | undefined,
  customersWithPendingOrders: string[] | undefined
) {
  return useMemo(
    () =>
      segmentCustomersForArea(
        customers,
        searchTerm,
        customersWithFilledOrders,
        customersWithEmptyOrders,
        customersWithPendingOrders
      ),
    [
      customers,
      searchTerm,
      customersWithFilledOrders,
      customersWithEmptyOrders,
      customersWithPendingOrders,
    ]
  );
}
