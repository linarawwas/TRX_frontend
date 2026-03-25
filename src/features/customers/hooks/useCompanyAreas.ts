import { useCallback, useEffect, useState } from "react";
import { fetchCompanyAreas } from "../api";

export type CompanyArea = { _id: string; name: string };

export function useCompanyAreas(token: string | null, enabled = true) {
  const [areas, setAreas] = useState<CompanyArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || !token) {
      setAreas([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await fetchCompanyAreas(token);
    if (result.error) {
      setAreas([]);
      setError(result.error);
      setLoading(false);
      return;
    }
    setAreas(Array.isArray(result.data) ? result.data : []);
    setLoading(false);
  }, [enabled, token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { areas, loading, error, refetch };
}
