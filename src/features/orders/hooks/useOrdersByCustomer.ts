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
      const response = await fetchCustomerOrders(token, customerId);
      if (response.error) {
        console.error("Error fetching orders:", response.error);
        setError(response.error);
      } else {
        setOrders(Array.isArray(response.data) ? response.data : []);
        setError(null);
      }
      setLoading(false);
    };

    if (companyId && customerId) {
      loadCustomerOrders();
    }
  }, [companyId, customerId, token]);

  return { orders, loading, error };
}
