import { useState } from "react";
import { updateCustomerDiscount } from "../api";

export function useUpdateCustomerDiscount(token: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (customerId: string, payload: Record<string, unknown>) => {
    if (!token) {
      throw new Error("Missing auth token");
    }

    setLoading(true);
    setError(null);
    try {
      return await updateCustomerDiscount(token, customerId, payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update discount";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
