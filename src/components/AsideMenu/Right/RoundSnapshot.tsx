import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./TodaySnapshot.css";
import { selectRoundProgress } from "../../../redux/selectors/shipment";

const RoundSnapshot: React.FC = () => {
  const [open, setOpen] = useState(true);

  const {
    sequence,
    targetRound,
    deliveredThisRound,
    returnedThisRound,
    usdThisRound,
    lbpThisRound,
    expUsdThisRound,
    expLbpThisRound,
    profUsdThisRound,
    profLbpThisRound,
  } = useSelector(selectRoundProgress);

  // Empty state: no active round or no target for this round
  if (!sequence || targetRound <= 0) return null;

  const pctRaw = targetRound > 0 ? (deliveredThisRound / targetRound) * 100 : 0;
  const pctForBar = Math.min(100, Math.max(0, Math.round(pctRaw)));
  const pctDisplay = Math.max(0, Math.round(pctRaw));
  const overBy =
    targetRound > 0 ? Math.max(0, deliveredThisRound - targetRound) : 0;
  const reached = targetRound > 0 && deliveredThisRound >= targetRound;

  return (
    <section className="snap-card" dir="rtl">
      <button
        className="snap-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="round-panel"
      >
        <span className="snap-title">إحصاءات الجولة #{sequence}</span>
        <span className={`chev ${open ? "up" : "down"}`} />
      </button>

      <div id="round-panel" className={`snap-panel ${open ? "open" : ""}`}>
        <div className="progress">
          <div className="progress-head">
            <div>
              هدف هذه الجولة: <strong>{targetRound}</strong>
            </div>
            <div>
              تم التسليم في هذه الجولة: <strong>{deliveredThisRound}</strong>
              {overBy > 0 && <span className="over-badge">+{overBy}</span>}
            </div>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${pctForBar}%` }} />
          </div>
          <div className="progress-foot">
            <span>{pctDisplay}% من هدف الجولة</span>
            <span>المُعاد في هذه الجولة: {returnedThisRound}</span>
          </div>
          {reached && (
            <div className="target-lock">
              <span className="lock-emoji" aria-hidden>
                🔒
              </span>
              <div>
                اكتمل الهدف لهذه الجولة. لزيادة التسليم، ابدأ جولة جديدة.
              </div>
            </div>
          )}
        </div>

        <div className="kpis">
          <div className="kpi">
            <span className="kpi-label">نقدية الجولة</span>
            <span className="kpi-value">
              ${usdThisRound.toLocaleString("en-US")} •{" "}
              {lbpThisRound.toLocaleString("en-US")} ل.ل
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">مصاريف الجولة</span>
            <span className="kpi-value">
              ${expUsdThisRound.toLocaleString("en-US")} •{" "}
              {expLbpThisRound.toLocaleString("en-US")} ل.ل
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">الأرباح الإضافية (الجولة)</span>
            <span className="kpi-value">
              ${profUsdThisRound.toLocaleString("en-US")} •{" "}
              {profLbpThisRound.toLocaleString("en-US")} ل.ل
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoundSnapshot;
