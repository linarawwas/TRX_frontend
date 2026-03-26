import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  clearCustomerId,
  clearCustomerName,
  clearCustomerPhoneNb,
} from "../../../../redux/Order/action";
import { getCustomersFromDB } from "../../../../utils/indexedDB";
import { createLogger } from "../../../../utils/logger";
import type { CustomerRow } from "../customersForAreaTypes";

const logger = createLogger("customers-for-area-cache");

export type CustomersForAreaCacheState = {
  customers: CustomerRow[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

/**
 * Loads customers for `areaId` from IndexedDB and clears order customer fields on each load.
 */
export function useCustomersForAreaCache(
  areaId: string | undefined
): CustomersForAreaCacheState {
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    dispatch(clearCustomerId());
    dispatch(clearCustomerName());
    dispatch(clearCustomerPhoneNb());

    if (!areaId) {
      setCustomers([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cached = await getCustomersFromDB(areaId);
      setCustomers(Array.isArray(cached) ? cached : []);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      logger.error("IndexedDB load error", e);
      setError(message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [areaId, dispatch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { customers, loading, error, reload };
}
