import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCustomerId } from "../../../../redux/Order/action";
import { createLogger } from "../../../../utils/logger";
import { readCompanyCustomersSnapshot } from "../services/companyCustomersRead.service";
import { selectCustomersPageToken } from "../state/customersPageState";
import type { CustomersPageViewModel } from "../types/customersPage.types";
import { customerMatchesSearch } from "../utils/customersPageSearch";

const logger = createLogger("customers-list");

/**
 * Orchestrates list load, search/filter, and accordion UI state for the customers page.
 */
export function useCustomersViewModel(): CustomersPageViewModel {
  const token = useSelector(selectCustomersPageToken);
  const [activeCustomers, setActiveCustomers] = useState<
    CustomersPageViewModel["activeCustomers"]
  >([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<
    CustomersPageViewModel["inactiveCustomers"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInsertOne, setShowInsertOne] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(false);

  const dispatch = useDispatch();
  const activePanelId = useId();
  const inactivePanelId = useId();

  const loadCustomers = useCallback(async (signal: AbortSignal) => {
    if (!token) {
      setLoading(false);
      setActiveCustomers([]);
      setInactiveCustomers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const outcome = await readCompanyCustomersSnapshot(token);

    if (signal.aborted) return;

    if (!outcome.ok) {
      logger.warn("readCompanyCustomersSnapshot failed", { message: outcome.error });
      setError(outcome.error);
      setLoading(false);
      return;
    }

    setActiveCustomers(outcome.data.active);
    setInactiveCustomers(outcome.data.inactive);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    dispatch(clearCustomerId());
    const ac = new AbortController();
    void loadCustomers(ac.signal);
    return () => ac.abort();
  }, [dispatch, showInsertOne, loadCustomers]);

  const qLower = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

  const filteredActive = useMemo(
    () => activeCustomers.filter((c) => customerMatchesSearch(c, qLower)),
    [activeCustomers, qLower]
  );

  const filteredInactive = useMemo(
    () => inactiveCustomers.filter((c) => customerMatchesSearch(c, qLower)),
    [inactiveCustomers, qLower]
  );

  const noResults =
    !loading &&
    searchTerm.trim().length > 0 &&
    filteredActive.length === 0 &&
    filteredInactive.length === 0;

  const onRetry = useCallback(() => {
    const ac = new AbortController();
    void loadCustomers(ac.signal);
  }, [loadCustomers]);

  return {
    loading,
    error,
    filteredActive,
    filteredInactive,
    activeCustomers,
    inactiveCustomers,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    showInsertOne,
    onToggleShowInsertOne: () => setShowInsertOne((s) => !s),
    openActive,
    onToggleOpenActive: () => setOpenActive((s) => !s),
    openInactive,
    onToggleOpenInactive: () => setOpenInactive((s) => !s),
    noResults,
    onRetry,
    activePanelId,
    inactivePanelId,
  };
}
