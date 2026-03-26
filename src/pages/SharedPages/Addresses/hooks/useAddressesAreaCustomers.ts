import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { fetchCustomersByArea } from "../../../../features/areas/apiAreas";
import { sortCustomersBySequence } from "../../../../features/areas/utils/sortCustomers";
import { createLogger } from "../../../../utils/logger";

const logger = createLogger("addresses-area-customers");

export type AddressAreaCustomer = {
  _id: string;
  address: string;
  name: string;
  phone: string;
  sequence?: number | null;
  isActive?: boolean;
};

type LoadResult =
  | { ok: true; customers: AddressAreaCustomer[] }
  | { ok: false; error: string };

async function loadCustomersForArea(
  token: string,
  areaId: string
): Promise<LoadResult> {
  const result = await fetchCustomersByArea(token, areaId);
  if (result.error) {
    return { ok: false, error: result.error };
  }
  const sorted = sortCustomersBySequence(result.data || []);
  return { ok: true, customers: sorted };
}

export function useAddressesAreaCustomers(
  areaId: string | undefined,
  token: string | null | undefined
): {
  customers: AddressAreaCustomer[];
  setCustomers: Dispatch<SetStateAction<AddressAreaCustomer[]>>;
  orderIds: string[];
  setOrderIds: Dispatch<SetStateAction<string[]>>;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [customers, setCustomers] = useState<AddressAreaCustomer[]>([]);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(
    async (cancelledRef?: { current: boolean }) => {
      if (!areaId || !token) {
        setCustomers([]);
        setOrderIds([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const out = await loadCustomersForArea(token, areaId);
      if (cancelledRef?.current) {
        return;
      }
      if (!out.ok) {
        logger.error("fetchCustomersByArea failed", {
          areaId,
          message: out.error,
        });
        setError(out.error);
        setCustomers([]);
        setOrderIds([]);
        setLoading(false);
        return;
      }
      setCustomers(out.customers);
      setOrderIds(out.customers.map((c) => c._id));
      setLoading(false);
    },
    [areaId, token]
  );

  useEffect(() => {
    const cancelledRef = { current: false };
    void fetchOnce(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchOnce]);

  const reload = useCallback(() => {
    void fetchOnce();
  }, [fetchOnce]);

  return {
    customers,
    setCustomers,
    orderIds,
    setOrderIds,
    loading,
    error,
    reload,
  };
}
