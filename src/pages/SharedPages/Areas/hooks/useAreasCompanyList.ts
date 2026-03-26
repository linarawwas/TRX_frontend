import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAreasByCompany,
  type Area,
} from "../../../../features/areas/apiAreas";
import { createLogger } from "../../../../utils/logger";

const logger = createLogger("areas-company-list");

export type AreasCompanyListState = {
  areas: Area[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Loads company areas for the Addresses → Areas screen.
 * Refetches when `formVisible` toggles (same as legacy behavior) so the list
 * can refresh after adding an area via {@link AddArea}.
 */
export function useAreasCompanyList(
  token: string | null | undefined,
  formVisible: boolean
): AreasCompanyListState {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tokenRef = useRef(token);
  tokenRef.current = token;

  const executeFetch = useCallback(async (isCancelled: () => boolean) => {
    const tok = tokenRef.current;
    if (!tok) {
      setAreas([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await fetchAreasByCompany(tok);
    if (isCancelled()) return;

    if (result.error) {
      logger.error("fetchAreasByCompany failed", result.error);
      setError(result.error);
      setLoading(false);
      return;
    }
    setAreas(Array.isArray(result.data) ? result.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void executeFetch(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [token, formVisible, executeFetch]);

  const reload = useCallback(() => {
    void executeFetch(() => false);
  }, [executeFetch]);

  return { areas, loading, error, reload };
}
