import { useCallback, useEffect, useState } from "react";
import { getPendingRequests } from "../utils/indexedDB";

export type PendingRequestCountState = {
  /** `null` until the first IndexedDB read completes */
  count: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * Tracks queued offline requests count without mutating the queue.
 * Refreshes when the browser goes online (sync hook may drain the queue).
 */
export function usePendingRequestCount(): PendingRequestCountState {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const pending = await getPendingRequests();
      setCount(Array.isArray(pending) ? pending.length : 0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read offline queue");
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onOnline = () => {
      void refresh();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [refresh]);

  return {
    count,
    loading: count === null,
    error,
    refresh,
  };
}
