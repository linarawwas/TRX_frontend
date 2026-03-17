// src/features/finance/hooks/useFinanceEntries.ts
import { useEffect, useState } from "react";
import { listFinances } from "../apiFinance";
import { FinanceEntry } from "../types";

export function useFinanceEntries(
  token: string | null,
  year: number,
  month: number,
  kind?: "income" | "expense" | "",
  categoryId?: string,
  enabled = true
) {
  const [data, setData] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!enabled || !token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listFinances(token, {
        year,
        month,
        kind: kind || undefined,
        categoryId: categoryId || undefined,
      });
      setData(result);
    } catch (err) {
      setError("Failed to load finance entries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, year, month, kind, categoryId, enabled]);

  return { data, loading, error, refetch };
}

