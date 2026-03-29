import { useCallback, useEffect, useState } from "react";
import { readPendingQueueSnapshot } from "../services/pendingQueueRead.service";

export type EmployeeHomeSyncQueueState = {
  /** `null` until the first read completes */
  count: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * Page-scoped hook: offline queue count via `readPendingQueueSnapshot`.
 * Refreshes on mount and when the browser comes back online (sync may drain the queue).
 */
export function useEmployeeHomeSyncQueue(): EmployeeHomeSyncQueueState {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await readPendingQueueSnapshot();
    if (result.ok) {
      setCount(result.count);
      setError(null);
    } else {
      setError(result.error);
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
