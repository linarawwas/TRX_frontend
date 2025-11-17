import { useCallback, useEffect, useState } from "react";
import { distributorSummary, DateRange } from "../../../utils/distributorApi";
import { MonthRange } from "./useMonthRange";

export interface DistributorDetailCustomer {
  customerId: string;
  name: string;
  netBottles: number;
  revenueUSD: number;
  ordersCount: number;
}

export interface DistributorDetailTotals {
  netBottles: number;
  revenueUSD: number;
  ordersCount: number;
  commissionUSD: number;
}

export interface DistributorDetail {
  distributor: {
    _id: string;
    name: string;
    commissionPct: number;
  };
  from?: string;
  to?: string;
  totals: DistributorDetailTotals;
  customers: DistributorDetailCustomer[];
}

export interface UseDistributorDetailResult {
  detail: DistributorDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDistributorDetail(
  token: string,
  distributorId: string | null,
  range: MonthRange
): UseDistributorDetailResult {
  const [detail, setDetail] = useState<DistributorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!distributorId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dateRange: DateRange = {
        from: range.from,
        to: range.to,
      };
      const response = await distributorSummary(token, distributorId, dateRange);
      setDetail(response);
    } catch (err: any) {
      console.error("Failed to load distributor detail:", err);
      setError(err?.message || "فشل تحميل تفاصيل الموزّع");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [token, distributorId, range.from, range.to]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    detail,
    loading,
    error,
    refresh: fetchDetail,
  };
}

