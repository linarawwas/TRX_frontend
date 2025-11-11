import { useMemo, useState } from "react";
import {
  addMonths,
  computeMonthRange,
  monthKeyFromDate,
  monthKeyFromIsoDate,
} from "../utils/dateUtils";

export interface MonthRange {
  key: string;
  from: string;
  to: string;
  start: Date;
  end: Date;
}

export interface UseMonthRangeOptions {
  initialMonthKey?: string | null;
}

export function useMonthRange(options: UseMonthRangeOptions = {}) {
  const thisMonthKey = monthKeyFromDate(new Date());
  const lastMonthKey = monthKeyFromDate(addMonths(new Date(), -1));
  const initialKey =
    options.initialMonthKey && !options.initialMonthKey.includes("Invalid")
      ? options.initialMonthKey
      : thisMonthKey;

  const [monthKey, setMonthKey] = useState<string>(initialKey);

  const range = useMemo(() => {
    try {
      return computeMonthRange(monthKey);
    } catch (error) {
      console.error("Invalid month key supplied, resetting to current month", error);
      return computeMonthRange(thisMonthKey);
    }
  }, [monthKey, thisMonthKey]);

  return {
    monthKey: range.key,
    range,
    setMonthKey,
    thisMonthKey,
    lastMonthKey,
    isThisMonth: range.key === thisMonthKey,
    isLastMonth: range.key === lastMonthKey,
  };
}

export function deriveInitialMonthKeyFromRange(
  from?: string | null,
  to?: string | null
): string | null {
  const fromKey = monthKeyFromIsoDate(from);
  if (fromKey) return fromKey;
  return monthKeyFromIsoDate(to) ?? null;
}

