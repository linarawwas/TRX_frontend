// src/features/finance/hooks/useDailySummary.ts
import { useEffect, useState } from "react";
import { dailySummary } from "../apiFinance";
import { DailySummary } from "../types";

export function useDailySummary(token: string | null, date: string) {
  const [data, setData] = useState<DailySummary | null>(null);
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
      const result = await dailySummary(token, date);
      setData(result);
    } catch (err) {
      setError("Failed to load daily summary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, date]);

  return { data, loading, error, refetch };
}

