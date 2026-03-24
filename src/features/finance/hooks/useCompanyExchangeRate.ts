import { useEffect, useState } from "react";
import { fetchCompanyExchangeRate } from "../api";

export function useCompanyExchangeRate(token: string | null, enabled = true) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !token) {
      setExchangeRate(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCompanyExchangeRate(token);
        if (!cancelled) setExchangeRate(data?.exchangeRateInLBP ?? null);
      } catch (err) {
        if (!cancelled) {
          setExchangeRate(null);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load exchange rate"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, token]);

  return { exchangeRate, loading, error };
}
