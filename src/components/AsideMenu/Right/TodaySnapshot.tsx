import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import "./TodaySnapshot.css";

const TodaySnapshot: React.FC = () => {
  const [open, setOpen] = useState(true);

  const target = useSelector((s: any) => s.shipment.target) || 0;
  const delivered = useSelector((s: any) => s.shipment.delivered) || 0;
  const returned = useSelector((s: any) => s.shipment.returned) || 0;
  const paidUSD = useSelector((s: any) => s.shipment.dollarPayments) || 0;
  const paidLBP = useSelector((s: any) => s.shipment.liraPayments) || 0;
  const expUSD = useSelector((s: any) => s.shipment.expensesInUSD) || 0;
  const expLBP = useSelector((s: any) => s.shipment.expensesInLiras) || 0;
  const profUSD = useSelector((s: any) => s.shipment.profitsInUSD) || 0;
  const profLBP = useSelector((s: any) => s.shipment.profitsInLiras) || 0;

  const pct = useMemo(() => {
    const t = Math.max(target, delivered + returned); // fallback when no target
    return t ? Math.min(100, Math.round((delivered / t) * 100)) : 0;
  }, [target, delivered, returned]);

  return (
    <section className="snap-card" dir="rtl">
      <button
        className="snap-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="today-panel"
      >
        <span className="snap-title">إحصاءات اليوم</span>
        <span className={`chev ${open ? "up" : "down"}`} />
      </button>

      <div id="today-panel" className={`snap-panel ${open ? "open" : ""}`}>
        {/* Progress */}
        <div className="progress">
          <div className="progress-head">
            <div>الهدف: <strong>{target}</strong></div>
            <div>تم التسليم: <strong>{delivered}</strong></div>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-foot">
            <span>{pct}% من الهدف</span>
            <span>المُعاد: {returned}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpis">
          <div className="kpi">
            <span className="kpi-label">نقدية اليوم</span>
            <span className="kpi-value">
              ${paidUSD.toLocaleString("en-US")} • {paidLBP.toLocaleString("en-US")} ل.ل
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">المصاريف</span>
            <span className="kpi-value">
              ${expUSD.toLocaleString("en-US")} • {expLBP.toLocaleString("en-US")} ل.ل
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-label">الأرباح الإضافية</span>
            <span className="kpi-value">
              ${profUSD.toLocaleString("en-US")} • {profLBP.toLocaleString("en-US")} ل.ل
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodaySnapshot;
