// src/features/areas/utils/sortCustomers.ts
export interface CustomerWithSequence {
  _id: string;
  name: string;
  sequence?: number | null;
}

/**
 * Sort customers by sequence (nulls last), then by name (Arabic locale)
 */
export function sortCustomersBySequence<T extends CustomerWithSequence>(
  customers: T[]
): T[] {
  return [...customers].sort((a, b) => {
    const sa = a.sequence ?? Number.POSITIVE_INFINITY;
    const sb = b.sequence ?? Number.POSITIVE_INFINITY;
    if (sa !== sb) return sa - sb;
    return (a.name || "").localeCompare(b.name || "", "ar");
  });
}

