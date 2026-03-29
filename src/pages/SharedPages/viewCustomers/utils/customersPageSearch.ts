import type { Customer } from "../../../../features/customers/apiCustomers";

export function customerMatchesSearch(c: Customer, qLower: string): boolean {
  if (!qLower) return true;
  return (
    Boolean(c.name && c.name.toLowerCase().includes(qLower)) ||
    Boolean(c.phone && c.phone.toLowerCase().includes(qLower)) ||
    Boolean(c.address && c.address.toLowerCase().includes(qLower))
  );
}
