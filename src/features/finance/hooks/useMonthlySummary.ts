// src/features/finance/hooks/useMonthlySummary.ts
import { useEffect, useState } from "react";
import { monthlySummary } from "../../../utils/apiFinances";
import { MonthlyRow } from "../types";

export function useMonthlySummary(token: string | null, y: number, m: number) {
  const [data, setData] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await monthlySummary(token, y, m);
      setData(result);
    } catch (err) {
      setError("Failed to load monthly summary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, y, m]);

  return { data, loading, error, refetch };
}

