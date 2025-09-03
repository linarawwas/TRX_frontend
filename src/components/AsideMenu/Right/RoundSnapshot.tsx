import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./TodaySnapshot.css"; // reuse same styles

const RoundSnapshot: React.FC = () => {
  const [open, setOpen] = useState(true);

  // day totals (live)
  const targetDay = useSelector((s: any) => s.shipment.target) || 0;
  const deliveredDay = useSelector((s: any) => s.shipment.delivered) || 0;
  const returnedDay = useSelector((s: any) => s.shipment.returned) || 0;
  const paidUsdDay = useSelector((s: any) => s.shipment.dollarPayments) || 0;
  const paidLbpDay = useSelector((s: any) => s.shipment.liraPayments) || 0;
  const expUsdDay = useSelector((s: any) => s.shipment.expensesInUSD) || 0;
  const expLbpDay = useSelector((s: any) => s.shipment.expensesInLiras) || 0;
  const profUsdDay = useSelector((s: any) => s.shipment.profitsInUSD) || 0;
  const profLbpDay = useSelector((s: any) => s.shipment.profitsInLiras) || 0;

  // round baseline + round target
  const round = useSelector((s: any) => s.shipment.round) || {};
  const roundSeq: number | null = round.sequence ?? null;
  const roundTarget: number = round.targetAdded ?? 0;

  // deltas = "this round only"
  const dDelivered = Math.max(0, deliveredDay - (round.baseDelivered || 0));
  const dReturned  = Math.max(0, returnedDay  - (round.baseReturned  || 0));
  const dUsd       = Math.max(0, paidUsdDay   - (round.baseUsd       || 0));
  const dLbp       = Math.max(0, paidLbpDay   - (round.baseLbp       || 0));
  const dExpUsd    = Math.max(0, expUsdDay    - (round.baseExpUsd    || 0));
  const dExpLbp    = Math.max(0, expLbpDay    - (round.baseExpLbp    || 0));
  const dProfUsd   = Math.max(0, profUsdDay   - (round.baseProfUsd   || 0));
  const dProfLbp   = Math.max(0, profLbpDay   - (round.baseProfLbp   || 0));

  // progress for this round (like TodaySnapshot: ignore returned in the bar)
  const pctRaw = roundTarget > 0 ? (dDelivered / roundTarget) * 100 : 0;
  const pctForBar = Math.min(100, Math.max(0, Math.round(pctRaw)));
  const pctDisplay = Math.max(0, Math.round(pctRaw));
  const overBy = roundTarget > 0 ? Math.max(0, dDelivered - roundTarget) : 0;

  // Empty state
  if (!roundSeq || roundTarget <= 0) {
    return null; // or return a small card saying "لا توجد جولة قيد التنفيذ"
  }

  return (
    <section className="snap-card" dir="rtl">
      <button
        className="snap-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="round-panel"
      >
        <span className="snap-title">إحصاءات الجولة #{roundSeq}</span>
        <span className={`chev ${open ? "up" : "down"}`} />
      </button>

      <div id="round-panel" className={`snap-panel ${open ? "open" : ""}`}>
        {/* Progress (Round) */}
        <div className="progress">
          <div className="progress-head">
            <div>
              هدف هذه الجولة: <strong>{roundTarget}</strong>
            </div>
            <div>
              تم التسليم في هذه الجولة: <strong>{dDelivered}</strong>
              {overBy > 0 && <span className="over-badge">+{overBy}</span>}
            </div>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${pctForBar}%` }} />
          </div>
          <div className="progress-foot">
            <span>{pctDisplay}% من هدف الجولة</span>
            <span>المُعاد في هذه الجولة: {dReturned}</span>
          </div>
        </div>

        {/* KPIs (Round) */}
        <div className="kpis">
          <div className="kpi">
            <span className="kpi-label">نقدية الجولة</span>
            <span className="kpi-value">
              ${dUsd.toLocaleString("en-US")} •{" "}
              {dLbp.toLocaleString("en-US")} ل.ل
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">مصاريف الجولة</span>
            <span className="kpi-value">
              ${dExpUsd.toLocaleString("en-US")} •{" "}
              {dExpLbp.toLocaleString("en-US")} ل.ل
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">الأرباح الإضافية (الجولة)</span>
            <span className="kpi-value">
              ${dProfUsd.toLocaleString("en-US")} •{" "}
              {dProfLbp.toLocaleString("en-US")} ل.ل
            </span>
          </div>
        </div>

        {/* Optional: when it started */}
        {round.startedAt && (
          <p className="kpi-label" style={{ marginTop: 6 }}>
            بدأت: <strong>{new Date(round.startedAt).toLocaleTimeString()}</strong>
          </p>
        )}
      </div>
    </section>
  );
};

export default RoundSnapshot;
