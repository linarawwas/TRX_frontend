import { saveCustomerInvoicesToDB } from "./indexedDB";
import { API_BASE } from "../config/api";

export async function fetchAndCacheCustomerInvoice(customerId: string, token: string) {
    try {
      const res = await fetch(
        `${API_BASE}/api/customers/reciept/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data?.sums) {
        await saveCustomerInvoicesToDB(customerId, data.sums);
        console.log("✅ Invoice updated and cached.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch/cache updated invoice:", err);
    }
  }
  