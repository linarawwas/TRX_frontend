import React, { useEffect, useMemo, useState } from "react";
import "./RoundsHistory.css";
import { useSelector } from "react-redux";
import { API_BASE } from "../../../config/api";

type Round = {
  _id: string;
  shipmentId: string;
  sequence: number;                 // 1-based round number
  carryingForDelivery: number;      // bottles in this round
  startedAt?: string;               // optional
  endedAt?: string;                 // optional
  createdAt?: string;               // fallback
};

interface Props {
  shipmentId?: string | null;
  /** If you already keep the shipment total in Redux (target), pass it here for display */
  totalToday?: number | null;
  /** Optional title override */
  title?: string;
}

const RoundsHistory: React.FC<Props> = ({ shipmentId, totalToday, title }) => {
  const token = useSelector((s: any) => s.user?.token);
  // If parent didn’t pass totalToday, try from Redux shipment slice
  const fallbackTotal = useSelector((s: any) => s.shipment?.target ?? null);

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
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/api/shipments/${shipmentId}/rounds`,
          { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal }
        );
        if (!res.ok) throw new Error("Failed to load rounds");
        const data: Round[] = await res.json();
        // sort by sequence ASC for a natural timeline
        data.sort((a, b) => a.sequence - b.sequence);
        setRounds(data);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Load error");
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [shipmentId, token]);

  const fmtTime = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    // 24h HH:mm
    return d.toLocaleTimeString("ar-LB", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  if (!shipmentId) return null;

  return (
    <div className="rounds-card" dir="rtl" aria-live="polite">
      <div className="rounds-header">
        <h3 className="rounds-title">{title ?? "جولات اليوم"}</h3>
        {loading ? <span className="rounds-pill loading">جارٍ التحميل…</span> : null}
        {error ? <span className="rounds-pill error">خطأ: {error}</span> : null}
      </div>

      {!loading && (rounds?.length ?? 0) === 0 && (
        <p className="rounds-empty">لا توجد جولات بعد.</p>
      )}

      <ul className="rounds-list">
        {(rounds ?? []).map(r => {
          const when = fmtTime(r.startedAt || r.createdAt);
          return (
            <li key={r._id} className="rounds-item">
              <span className="round-chip">#{r.sequence}</span>
              <span className="round-line">
                <span className="round-qty">{r.carryingForDelivery}</span> قنينة
                <span className="sep">—</span>
                <span className="round-time">عند {when}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="rounds-total">
        <span className="total-label">الإجمالي اليوم:</span>
        <strong className="total-val">{Number(total || 0)}</strong>
        <span className="total-unit">قنينة</span>
      </div>
    </div>
  );
};

export default RoundsHistory;
