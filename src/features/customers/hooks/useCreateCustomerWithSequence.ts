import { createCustomerWithSequence } from "../api";
import { useAsyncMutation } from "../../api/hooks/useAsyncMutation";

export function useCreateCustomerWithSequence(token: string) {
  return useAsyncMutation(
    (payload: Record<string, unknown>) => createCustomerWithSequence(token, payload),
    "Failed to create customer"
  );
}
