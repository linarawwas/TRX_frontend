import type { ApiResult } from "../../../../features/api/rtkTransport";
import type { Customer, CustomersResponse } from "../../../../features/customers/apiCustomers";

export type CompanyCustomersSnapshot = {
  active: Customer[];
  inactive: Customer[];
};

export type CompanyCustomersReadResult =
  | { ok: true; data: CompanyCustomersSnapshot }
  | { ok: false; error: string };

/**
 * Maps transport/API result into a UI-safe snapshot. Adjust when DTO shape changes.
 */
export function adaptCompanyCustomersApiResult(
  result: ApiResult<CustomersResponse>
): CompanyCustomersReadResult {
  if (result.error || !result.data) {
    return { ok: false, error: result.error || "Failed to fetch customers" };
  }
  return {
    ok: true,
    data: {
      active: Array.isArray(result.data.active) ? result.data.active : [],
      inactive: Array.isArray(result.data.inactive) ? result.data.inactive : [],
    },
  };
}
