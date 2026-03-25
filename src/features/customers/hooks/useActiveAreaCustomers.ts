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
      const result = await fetchActiveCustomersForArea(token, areaId);
      if (!cancelled) {
        if (result.error) {
          setCustomers([]);
          setError(result.error);
        } else {
          setCustomers(Array.isArray(result.data) ? result.data : []);
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [areaId, token]);

  return { customers, loading, error };
}
