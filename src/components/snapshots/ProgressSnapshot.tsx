// src/components/snapshots/ProgressSnapshot.tsx
import React from "react";
import "../AsideMenu/Right/TodaySnapshot.css"; // reuse existing classes
import { t } from "../../utils/i18n";

type Money = { usd: string; lbp: string };

interface Props {
  id: string;            // unique id for aria-controls (e.g., "today-panel", "round-panel")
  open: boolean;
  onToggle: () => void;
  title: React.ReactNode; // e.g., "إحصاءات اليوم" or `إحصاءات الجولة #${sequence}`
  target: number;
  delivered: number;
  returned: number;
  pctForBar: number;
  pctDisplay: number;
  overBy: number;
  reached?: boolean;
  moneyToday?: Money;     // for TodaySnapshot
  moneyExp?: Money;
  moneyProf?: Money;
  /** Which KPI labels to use — round metrics must not reuse “today” wording */
  kpiScope?: "today" | "round";
  extraFoot?: React.ReactNode; // optional foot content (e.g., lock message)
  children?: React.ReactNode;  // optional extra sections (e.g., RoundsHistory)
  showProgressSummary?: boolean;
}

const ProgressSnapshot: React.FC<Props> = ({
  id, open, onToggle, title,
  target, delivered, returned,
  pctForBar, pctDisplay, overBy, reached,
  moneyToday, moneyExp, moneyProf,
  kpiScope = "today",
  extraFoot, children,
  showProgressSummary = true,
}) => {
  const cashLabel =
    kpiScope === "round" ? t("emp.kpi.cashRound") : t("emp.kpi.cashToday");
  const expLabel =
    kpiScope === "round" ? t("emp.kpi.expensesRound") : t("emp.kpi.expenses");
  const profLabel =
    kpiScope === "round"
      ? t("emp.kpi.extraProfitsRound")
      : t("emp.kpi.extraProfits");

  return (
  <section className="snap-card--enterprise" dir="rtl">
    <button 
      className="snap-toggle" 
      onClick={onToggle} 
      aria-expanded={open} 
      aria-controls={id} 
      type="button"
    >
      <span className="snap-title">{title}</span>
      <span className={`chev ${open ? "up" : "down"}`} />
    </button>

    <div id={id} className={`snap-panel ${open ? "open" : ""}`}>
      {showProgressSummary && (
        <div className={`progress ${reached ? "reached" : ""}`}>
          <div className="progress-head">
            <div>{t("emp.snap.goal")}: <strong>{target}</strong></div>
            <div>{t("emp.snap.delivered")}: <strong>{delivered}</strong>{overBy > 0 && <span className="over-badge">+{overBy}</span>}</div>
          </div>
          <div className="bar"><div className="bar-fill" style={{ width: `${pctForBar}%` }} /></div>
          <div className="progress-foot">
            <span>{pctDisplay}{t("emp.snap.percentOfGoal")}</span>
            <span>{t("emp.snap.returned")}: {returned}</span>
          </div>
          {extraFoot}
        </div>
      )}

      <div className="kpis">
        {moneyToday && (
          <div className="kpi"><span className="kpi-label">{cashLabel}</span><span className="kpi-value">{moneyToday.usd} • {moneyToday.lbp}</span></div>
        )}
        {moneyExp && (
          <div className="kpi"><span className="kpi-label">{expLabel}</span><span className="kpi-value">{moneyExp.usd} • {moneyExp.lbp}</span></div>
        )}
        {moneyProf && (
          <div className="kpi"><span className="kpi-label">{profLabel}</span><span className="kpi-value">{moneyProf.usd} • {moneyProf.lbp}</span></div>
        )}
      </div>

      {children}
    </div>
  </section>
  );
};

export default ProgressSnapshot;

