import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCustomerDiscountFromDB } from "../../../utils/indexedDB";
import { createLogger } from "../../../utils/logger";
import { t } from "../../../utils/i18n";
import type { RecordOrderCustomerData } from "../../../features/orders/hooks/useRecordOrderController";

const logger = createLogger("record-order-discount-cache");

/** Payload from IndexedDB; extends controller shape with optional note/currency for UI. */
export type CachedCustomerDiscount = RecordOrderCustomerData & {
  noteAboutCustomer?: string;
  discountCurrency?: string;
};

export function useCustomerDiscountFromCache(
  customerId: string | undefined
): {
  customerData: CachedCustomerDiscount | null;
  loading: boolean;
  error: Error | null;
} {
  const [customerData, setCustomerData] = useState<CachedCustomerDiscount | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) {
      setCustomerData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const cached = await getCustomerDiscountFromDB(customerId);
        if (cancelled) return;
        if (cached) {
          setCustomerData(cached as CachedCustomerDiscount);
        } else {
          setCustomerData(null);
          console.warn("No discount data found in IndexedDB");
          toast.warn(t("recordOrderForCustomer.cache.noDiscountOffline"));
        }
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        logger.error("load discount from cache failed", err);
        console.error("Error loading discount from IndexedDB", e);
        toast.error(t("recordOrderForCustomer.cache.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return { customerData, loading, error };
}
