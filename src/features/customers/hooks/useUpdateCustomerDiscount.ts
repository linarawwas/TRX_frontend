import { updateCustomerDiscount } from "../api";
import { useAsyncMutation } from "../../api/hooks/useAsyncMutation";

export function useUpdateCustomerDiscount(token: string | null) {
  return useAsyncMutation(
    (customerId: string, payload: Record<string, unknown>) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return updateCustomerDiscount(token, customerId, payload);
    },
    "Failed to update discount"
  );
}
