import React, { useMemo } from "react";
import "./LandingPage.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import AdminFeatures from "../../../components/LandingPage/AdminFeatures.jsx";
import CurrentShipmentStat from "./CurrentShipmentStats/CurrentShipmentStat";

/** Lightweight sparkline and progress ring (no deps) */
const Sparkline: React.FC<{ points: number[]; max?: number }> = ({ points, max }) => {
  if (!points || points.length === 0) return null;
  const w = 120, h = 38, pad = 2;
  const m = max ?? Math.max(...points, 1);
  const step = (w - pad * 2) / Math.max(points.length - 1, 1);
  const path = points
    .map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / m) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
    </svg>
  );
};

const ProgressRing: React.FC<{ value: number; total: number; label?: string }> = ({ value, total, label }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const size = 94, stroke = 8, r = (size - stroke) / 2, c = Math.PI * 2 * r;
  const dash = (pct / 100) * c;
  return (
    <div className="ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="var(--accent)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="ring-text">
          {pct}%
        </text>
      </svg>
      {label && <div className="ring-sub">{label}</div>}
    </div>
  );
};

const AdminLandingPage: React.FC = () => {
  const name = useSelector((s: RootState) => s.user.username);

  // Pull totals from CurrentShipmentStat via custom event fallback (simple, decoupled)
  // Emit from CurrentShipmentStat using: window.dispatchEvent(new CustomEvent('trx:todayTotals', { detail: totalsLike }))
  const [today, setToday] = React.useState<any>({
    carryingForDelivery: 0,
    calculatedDelivered: 0,
    calculatedReturned: 0,
    shipmentLiraPayments: 0,
    shipmentUSDPayments: 0,
    shipmentLiraExpenses: 0,
    shipmentUSDExpenses: 0,
    shipmentLiraExtraProfits: 0,
    shipmentUSDExtraProfits: 0,
  });

  React.useEffect(() => {
    const handler = (e: any) => setToday(e.detail);
    window.addEventListener("trx:todayTotals", handler);
    return () => window.removeEventListener("trx:todayTotals", handler);
  }, []);

  const USD_overall = useMemo(
    () => today.shipmentUSDPayments + today.shipmentUSDExtraProfits - today.shipmentUSDExpenses,
    [today]
  );
  const LIRA_overall = useMemo(
    () => today.shipmentLiraPayments + today.shipmentLiraExtraProfits - today.shipmentLiraExpenses,
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
          <button className="qa-btn outline" onClick={() => window.location.assign('/currentShipment')}>
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
    </div>
  );
};

export default AdminLandingPage;
