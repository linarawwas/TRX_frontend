import { useState } from "react";
import { createCustomerWithSequence } from "../api";

export function useCreateCustomerWithSequence(token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createCustomerWithSequence(token, payload);
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create customer";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
