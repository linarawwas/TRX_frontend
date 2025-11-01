// src/features/finance/hooks/useFinanceCategories.ts
import { useEffect, useState } from "react";
import { listCategories } from "../../../utils/apiFinances";
import { Category } from "../types";

export function useFinanceCategories(token: string) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategories(token);
      setCats(data);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { cats, loading, error, refetch };
}

