import type { CustomerRow } from "./customersForAreaTypes";

export type SegmentBuckets = {
  activeList: Array<{ c: CustomerRow; statusClass: "" }>;
  pendingList: Array<{ c: CustomerRow }>;
  completedList: Array<{ c: CustomerRow; statusClass: "filled" | "empty" }>;
  counts: { filled: number; empty: number; total: number };
  hasPending: boolean;
};

const norm = (v: unknown): string =>
  typeof v === "string"
    ? v
    : (v as { _id?: string })?._id
      ? String((v as { _id: string })._id)
      : String(v);

/**
 * Groups cached customers by shipment order state. Pending wins over filled/empty for an id.
 * Search filter: name, phone, address (case-insensitive).
 */
export function segmentCustomersForArea(
  customers: CustomerRow[],
  searchTerm: string,
  customersWithFilledOrders: string[] | undefined,
  customersWithEmptyOrders: string[] | undefined,
  customersWithPendingOrders: string[] | undefined
): SegmentBuckets {
  const q = searchTerm.trim().toLowerCase();
  const matches = (c: CustomerRow) =>
    !q ||
    c.name.toLowerCase().includes(q) ||
    (c.phone?.includes(q) ?? false) ||
    c.address.toLowerCase().includes(q);

  const filledSet = new Set((customersWithFilledOrders ?? []).map(norm));
  const emptySet = new Set((customersWithEmptyOrders ?? []).map(norm));
  const pendingSet = new Set((customersWithPendingOrders ?? []).map(norm));

  const completed: Array<{ c: CustomerRow; statusClass: "filled" | "empty" }> =
    [];
  const active: Array<{ c: CustomerRow; statusClass: "" }> = [];
  const pending: Array<{ c: CustomerRow }> = [];

  for (const c of customers) {
    if (!matches(c)) continue;
    const id = String(c._id);

    if (pendingSet.has(id)) {
      pending.push({ c });
      continue;
    }
    if (filledSet.has(id)) {
      completed.push({ c, statusClass: "filled" });
      continue;
    }
    if (emptySet.has(id)) {
      completed.push({ c, statusClass: "empty" });
      continue;
    }
    active.push({ c, statusClass: "" });
  }

  return {
    activeList: active,
    pendingList: pending,
    completedList: completed,
    counts: {
      filled: completed.filter((x) => x.statusClass === "filled").length,
      empty: completed.filter((x) => x.statusClass === "empty").length,
      total: completed.length,
    },
    hasPending: pending.length > 0,
  };
}
