import { useCallback, useEffect, useState } from "react";
import { distributorsSummary, DateRange } from "../../../utils/distributorApi";
import { MonthRange } from "./useMonthRange";

export interface DistributorSummaryItem {
  distributorId: string;
  name: string;
  commissionPct: number;
  customersCount: number;
  ordersCount: number;
  netBottles: number;
  revenueUSD: number;
  commissionUSD: number;
}

export interface UseDistributorSummaryResult {
  summaries: DistributorSummaryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDistributorSummary(
  token: string,
  range: MonthRange
): UseDistributorSummaryResult {
  const [summaries, setSummaries] = useState<DistributorSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateRange: DateRange = {
        from: range.from,
        to: range.to,
      };
      const response = await distributorsSummary(token, dateRange);
      // Map backend response to frontend format
      const mapped = (response.summaries || []).map((s: any) => ({
        distributorId: s.distributorId || s._id,
        name: s.name || "—",
        commissionPct: s.commissionPct || 0,
        customersCount: s.customersCount || 0,
        ordersCount: s.ordersCount || 0,
        netBottles: s.netBottles || 0,
        revenueUSD: s.revenueUSD || 0,
        commissionUSD: s.commissionUSD || 0,
      }));
      setSummaries(mapped);
    } catch (err: any) {
      console.error("Failed to load distributor summary:", err);
      setError(err?.message || "فشل تحميل بيانات الموزّعين");
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [token, range.from, range.to]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summaries,
    loading,
    error,
    refresh: fetchSummary,
  };
}

