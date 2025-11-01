import React, { Suspense, useMemo } from "react";
import "./LandingPage.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
import AdminFeatures from "../../../components/LandingPage/AdminFeatures";
import CurrentShipmentStat from "./CurrentShipmentStats/CurrentShipmentStat";
import Sparkline from "../../../components/visuals/Sparkline";
import ProgressRing from "../../../components/visuals/ProgressRing";
import { useTodayShipmentTotals } from "../../../features/shipments/hooks/useTodayShipmentTotals";
const FinanceDashboard = React.lazy(() => import("../FinanceDashboard/FinanceDashboard"));

const AdminLandingPage: React.FC = () => {
  const name = useSelector((s: RootState) => s.user.username);
  const token = useSelector((s: RootState) => s.user.token);
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const navigate = useNavigate();

  const { totals: today } = useTodayShipmentTotals(token, companyId);

  const USD_overall = useMemo(
    () =>
      today.shipmentUSDPayments +
      today.shipmentUSDExtraProfits -
      today.shipmentUSDExpenses,
    [today]
  );
  const LIRA_overall = useMemo(
    () =>
      today.shipmentLiraPayments +
      today.shipmentLiraExtraProfits -
      today.shipmentLiraExpenses,
    [today]
  );

  // Tiny “trend” demo: last 7 values—replace with real series when you have it
  const usdTrend = useMemo(() => {
    const base = Math.max(1, USD_overall);
    return [0.4,0.6,0.5,0.8,0.9,0.7,1].map(x => Math.round(base * x));
  }, [USD_overall]);

  const dateStr = new Date().toLocaleDateString("ar-LB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="admin-home" dir="rtl">
      {/* Hero */}
      <section className="admin-hero">
        <div className="hero-top">
          <h1 className="hero-title">مرحباً {name}</h1>
          <div className="hero-sub">{dateStr}</div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <AdminFeatures />
          <button className="qa-btn outline" onClick={() => navigate('/currentShipment')}>
            👁️ عرض الشحنات
          </button>
          <button className="qa-btn outline" onClick={() => window.print()}>
            🖨️ تقرير اليوم
          </button>
        </div>
      </section>

      {/* Today snapshot */}
      <section className="snapshot">
        <div className="ring-card">
          <ProgressRing
            value={today.calculatedDelivered}
            total={today.carryingForDelivery}
            label="نسبة التسليم اليوم"
          />
          <div className="ring-meta">
            <div>المحمولة: <strong>{today.carryingForDelivery}</strong></div>
            <div>المُسلّمة: <strong>{today.calculatedDelivered}</strong></div>
            <div>المُعادة: <strong>{today.calculatedReturned}</strong></div>
          </div>
        </div>

        <div className="kpi-wrap">
          <div className="kpi-card accent">
            <div className="kpi-title">صافي الدولار</div>
            <div className="kpi-num">$ {Number(USD_overall||0).toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
            <div className="kpi-sub">مدفوعات − نفقات + أرباح إضافية</div>
            <div className="kpi-spark"><Sparkline points={usdTrend} /></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">مدفوعات الليرة</div>
            <div className="kpi-num">{Number(today.shipmentLiraPayments||0).toLocaleString("en-US")} ل.ل</div>
            <div className="kpi-sub">إجمالي المقبوض بالليرة</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">نفقات الليرة</div>
            <div className="kpi-num">{Number(today.shipmentLiraExpenses||0).toLocaleString("en-US")} ل.ل</div>
            <div className="kpi-sub">جميع المصاريف اليوم</div>
          </div>
        </div>
      </section>

      {/* Live today stats (your existing component broadcasts totals) */}
      <section className="pane">
        <h2 className="pane-title">تفاصيل شحنة اليوم</h2>
        <CurrentShipmentStat />
      </section>
      <Suspense fallback={<div className="finx-tile">جارٍ التحميل…</div>}>
        <FinanceDashboard />
      </Suspense>
    </div>
  );
};

export default AdminLandingPage;
