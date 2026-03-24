import { useState } from "react";
import { reorderAreaCustomers } from "../api";

export function useReorderAreaCustomers(token: string, companyId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (areaId: string, orderedCustomerIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      return await reorderAreaCustomers(
        token,
        areaId,
        companyId,
        orderedCustomerIds
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reorder";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
