import React, { useEffect, useMemo, useState } from "react";
import "./RoundsHistory.css";
import { useSelector } from "react-redux";
import { fetchShipmentRounds } from "../../../features/shipments/api";
import type { RootState } from "../../../redux/store";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("rounds-history");

type Round = {
  _id: string;
  shipmentId: string;
  sequence: number;
  carryingForDelivery: number;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
};

interface Props {
  shipmentId?: string | null;
  totalToday?: number | null;
  title?: string;
}

const RoundsHistory: React.FC<Props> = ({ shipmentId, totalToday, title }) => {
  const token = useSelector((s: RootState) => s.user?.token);
  const fallbackTotal = useSelector(
    (s: RootState) => s.shipment?.target ?? null
  );

  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => (typeof totalToday === "number" ? totalToday : fallbackTotal ?? 0),
    [totalToday, fallbackTotal]
  );

  useEffect(() => {
    if (!shipmentId || !token) return;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      if (ctrl.signal.aborted) {
        setLoading(false);
        return;
      }
      const response = await fetchShipmentRounds(token, shipmentId);
      if (response.error) {
        logger.error("fetchShipmentRounds failed", response.error);
        setError(response.error || "Load error");
        setLoading(false);
        return;
      }
      const data: Round[] = Array.isArray(response.data) ? response.data : [];
      const sorted = [...data].sort((a, b) => a.sequence - b.sequence);
      setRounds(sorted);
      setLoading(false);
    })();

    return () => ctrl.abort();
  }, [shipmentId, token]);

  const fmtTime = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("ar-LB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!shipmentId) return null;

  const heading =
    title ?? t("emp.snap.roundsHistory.defaultTitle");

  return (
    <div className="rounds-card" dir="rtl" aria-live="polite">
      <div className="rounds-header">
        <h3 className="rounds-title">{heading}</h3>
        {loading ? (
          <span className="rounds-pill rounds-pill--loading">
            {t("emp.snap.roundsHistory.loading")}
          </span>
        ) : null}
        {error ? (
          <span className="rounds-pill rounds-pill--error">
            {t("emp.snap.roundsHistory.error", { message: error })}
          </span>
        ) : null}
      </div>

      {!loading && (rounds?.length ?? 0) === 0 && (
        <p className="rounds-empty">{t("emp.snap.roundsHistory.empty")}</p>
      )}

      <ul className="rounds-list">
        {(rounds ?? []).map((r) => {
          const when = fmtTime(r.startedAt || r.createdAt);
          return (
            <li key={r._id} className="rounds-item">
              <span className="round-chip">#{r.sequence}</span>
              <span className="round-line">
                <span className="round-qty">{r.carryingForDelivery}</span>{" "}
                {t("emp.snap.roundsHistory.bottle")}
                <span className="sep">—</span>
                <span className="round-time">
                  {t("emp.snap.roundsHistory.atTime", { time: when })}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="rounds-total">
        <span className="total-label">
          {t("emp.snap.roundsHistory.totalLabel")}
        </span>
        <strong className="total-val">{Number(total || 0)}</strong>
        <span className="total-unit">
          {t("emp.snap.roundsHistory.totalUnit")}
        </span>
      </div>
    </div>
  );
};

export default RoundsHistory;
