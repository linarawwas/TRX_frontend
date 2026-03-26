import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearAreaId } from "../../../../redux/Order/action";
import { getAreasByDayFromDB, getDayFromDB } from "../../../../utils/indexedDB";
import { t } from "../../../../utils/i18n";

export type AreaRow = {
  _id: string;
  name: string;
};

export type AreasForDayDataState = {
  areas: AreaRow[];
  dayNameRaw: string;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

/**
 * Loads areas for `dayId` from IndexedDB only (offline-safe).
 * Dispatches clearAreaId at the start of each load — required for order context.
 */
export function useAreasForDayData(
  dayId: string | undefined
): AreasForDayDataState {
  const dispatch = useDispatch();
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayNameRaw, setDayNameRaw] = useState("");

  const load = useCallback(async () => {
    dispatch(clearAreaId());

    try {
      setLoading(true);
      setError(null);

      if (!dayId) {
        setAreas([]);
        setDayNameRaw(t("addresses.areasForDay.unknownDay"));
        return;
      }

      const [byDay, cachedDay] = await Promise.all([
        getAreasByDayFromDB(dayId),
        getDayFromDB(dayId),
      ]);

      setAreas(Array.isArray(byDay) ? byDay : []);
      setDayNameRaw(
        cachedDay?.name
          ? String(cachedDay.name)
          : t("addresses.areasForDay.unknownDay")
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to load from IndexedDB:", err);
      setError(message);
      setDayNameRaw(t("addresses.areasForDay.loadError"));
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }, [dayId, dispatch]);

  useEffect(() => {
    void load();
  }, [load]);

  return { areas, dayNameRaw, loading, error, reload: load };
}
