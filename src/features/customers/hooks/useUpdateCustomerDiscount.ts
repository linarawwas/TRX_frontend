import { updateCustomerDiscount } from "../api";
import { useAsyncMutation } from "../../api/hooks/useAsyncMutation";

export function useUpdateCustomerDiscount(token: string | null) {
  return useAsyncMutation(
    (customerId: string, payload: Record<string, unknown>) => {
      if (!token) {
        return Promise.resolve({
          data: null,
          error: "Missing auth token",
        });
      }
      return updateCustomerDiscount(token, customerId, payload);
    },
    "Failed to update discount"
  );
}
