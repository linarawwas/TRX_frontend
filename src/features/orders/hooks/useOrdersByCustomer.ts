import { useEffect, useState } from "react";
import { fetchCustomerOrders, CustomerOrder } from "../api";

export function useOrdersByCustomer(
  token: string,
  companyId: string | null,
  customerId: string
) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerOrders = async () => {
      try {
        const response = await fetchCustomerOrders(token, customerId);
        setOrders(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (companyId && customerId) {
      loadCustomerOrders();
    }
  }, [companyId, customerId, token]);

  return { orders, loading, error };
}
