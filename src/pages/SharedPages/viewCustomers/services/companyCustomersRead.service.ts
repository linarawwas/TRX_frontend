import { fetchCustomersByCompany } from "../../../../features/customers/apiCustomers";
import {
  adaptCompanyCustomersApiResult,
  type CompanyCustomersReadResult,
} from "../adapters/companyCustomersAdapter";

export type { CompanyCustomersReadResult };

/**
 * Company-wide customer list (active + inactive). I/O boundary — swap body for DAL later.
 */
export async function readCompanyCustomersSnapshot(
  token: string
): Promise<CompanyCustomersReadResult> {
  const result = await fetchCustomersByCompany(token);
  return adaptCompanyCustomersApiResult(result);
}
