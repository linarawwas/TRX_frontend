import { useEffect, useState } from "react";
import {
  fetchActiveCustomersForArea,
  type CustomerOption,
} from "../api";

export function useActiveAreaCustomers(token: string, areaId: string) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !areaId) {
      setCustomers([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchActiveCustomersForArea(token, areaId);
        if (!cancelled) setCustomers(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) {
          setCustomers([]);
          setError(
            err instanceof Error ? err.message : "Failed to load area customers"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [areaId, token]);

  return { customers, loading, error };
}
