export function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function monthKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function monthKeyFromIsoDate(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return monthKeyFromDate(parsed);
}

export function addMonths(base: Date, offset: number): Date {
  const clone = new Date(base.getTime());
  clone.setMonth(clone.getMonth() + offset);
  return clone;
}

export function computeMonthRange(monthKey: string) {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }
  const start = new Date(year, monthIndex, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0);
  end.setHours(23, 59, 59, 999);
  return {
    key: monthKey,
    from: iso(start),
    to: iso(end),
    start,
    end,
  };
}

