import { reorderAreaCustomers } from "../api";
import { useAsyncMutation } from "../../api/hooks/useAsyncMutation";

export function useReorderAreaCustomers(token: string, companyId: string) {
  return useAsyncMutation(
    (areaId: string, orderedCustomerIds: string[]) =>
      reorderAreaCustomers(token, areaId, companyId, orderedCustomerIds),
    "Failed to reorder"
  );
}
