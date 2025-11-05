import { saveCustomerInvoicesToDB } from "./indexedDB";

export async function fetchAndCacheCustomerInvoice(customerId: string, token: string) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/customers/reciept/${customerId}`,
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
  