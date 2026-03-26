import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCustomerDiscountFromDB } from "../../../../utils/indexedDB";
import { t } from "../../../../utils/i18n";
import type { CustomerDiscountCache } from "../customerDiscountTypes";

export type CustomerDiscountCacheState = {
  data: CustomerDiscountCache | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

/**
 * Loads per-customer discount from IndexedDB for the record-order shell.
 * Does not write to IDB; toasts match prior behavior when cache is missing.
 */
export function useCustomerDiscountCache(
  customerId: string | null | undefined
): CustomerDiscountCacheState {
  const [data, setData] = useState<CustomerDiscountCache | null>(null);
  const [loading, setLoading] = useState(Boolean(customerId));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!customerId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    try {
      const cached = await getCustomerDiscountFromDB(customerId);
      if (cached) {
        setData(cached);
      } else {
        setData(null);
        console.warn("No discount data found in IndexedDB");
        toast.warn(t("recordOrderForCustomer.discount.missing"));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Error loading discount from IndexedDB", e);
      setError(message);
      setData(null);
      toast.error(t("recordOrderForCustomer.discount.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
