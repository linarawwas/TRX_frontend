import { useCallback, useEffect, useState } from "react";
import { fetchCustomersByArea } from "../api";

export type AreaCustomer = {
  _id: string;
  name?: string;
  sequence?: number | null;
  address?: string;
  phone?: string;
  isActive?: boolean;
};

export function useAreaCustomers(
  token: string | null,
  areaId: string,
  enabled = true
) {
  const [customers, setCustomers] = useState<AreaCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || !token || !areaId) {
      setCustomers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomersByArea(token, areaId);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setCustomers([]);
      setError(err instanceof Error ? err.message : "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, [areaId, enabled, token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { customers, loading, error, refetch };
}
