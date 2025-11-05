import React, { Suspense, useMemo } from "react";
import "./LandingPage.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
import AdminFeatures from "../../../components/LandingPage/AdminFeatures";
import CurrentShipmentStat from "./CurrentShipmentStats/CurrentShipmentStat";
import Sparkline from "../../../components/visuals/Sparkline";
import RingCard from "../../../components/dashboard/RingCard";
import KpiCard from "../../../components/dashboard/KpiCard";
import { useTodayShipmentTotals } from "../../../features/shipments/hooks/useTodayShipmentTotals";
import { computeNetTotals, seedTrend } from "../../../features/shipments/utils/totals";
import { t } from "../../../utils/i18n";
const FinanceDashboard = React.lazy(() => import("../FinanceDashboard/FinanceDashboard"));

const AdminHomePage: React.FC = () => {
  const name = useSelector((s: RootState) => s.user.username);
  const token = useSelector((s: RootState) => s.user.token);
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const navigate = useNavigate();

  const { totals: today, loading, error } = useTodayShipmentTotals(token, companyId);

  const { usd: USD_overall, lbp: LIRA_overall } = useMemo(() => computeNetTotals(today), [today]);
  const usdTrend = useMemo(() => seedTrend(USD_overall), [USD_overall]);

  const dateStr = new Date().toLocaleDateString("ar-LB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="admin-home" dir="rtl">
      {/* Hero */}
      <section className="admin-hero">
        <div className="hero-top">
          <h1 className="hero-title">{t('dashboard.hello')} {name}</h1>
          <div className="hero-sub">{dateStr}</div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <AdminFeatures />
          <button 
            type="button"
            className="qa-btn outline" 
            onClick={() => navigate('/currentShipment')}
            aria-label={t('dashboard.quickActions.viewShipments')}
          >
            👁️ {t('dashboard.quickActions.viewShipments')}
          </button>
          <button 
            type="button"
            className="qa-btn outline" 
            onClick={() => window.print()}
            aria-label={t('dashboard.quickActions.printToday')}
          >
            🖨️ {t('dashboard.quickActions.printToday')}
          </button>
        </div>
      </section>

      {/* Today snapshot */}
      <section className="snapshot">
        {loading ? (
          <>
            <div className="ring-card">
              <div className="skeleton skeleton-value" style={{ width: '94px', height: '94px', borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-label" />
              </div>
            </div>
            <div className="kpi-wrap">
              <div className="kpi-card">
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-value" />
                <div className="skeleton skeleton-label" style={{ marginTop: '4px' }} />
              </div>
              <div className="kpi-card">
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-value" />
                <div className="skeleton skeleton-label" style={{ marginTop: '4px' }} />
              </div>
              <div className="kpi-card">
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-value" />
                <div className="skeleton skeleton-label" style={{ marginTop: '4px' }} />
              </div>
            </div>
          </>
        ) : error ? (
          <div className="kpi-card" style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: 'var(--muted)' }}>
            {t('dashboard.error')}
          </div>
        ) : (
          <>
            <RingCard
              value={today.calculatedDelivered}
              total={Math.max(0, today.carryingForDelivery || 0)}
              label={t('dashboard.deliveryRateToday')}
              delivered={today.calculatedDelivered}
              carrying={today.carryingForDelivery}
              returned={today.calculatedReturned}
            />

            <div className="kpi-wrap">
              <KpiCard
                title={t('dashboard.netUSD')}
                value={`$ ${Number(USD_overall || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                sub={t('dashboard.netUSDSubtitle')}
                className="accent"
              >
                <Sparkline points={usdTrend} />
              </KpiCard>

              <KpiCard
                title={t('dashboard.liraPayments')}
                value={`${Number(today.shipmentLiraPayments || 0).toLocaleString("en-US")} ل.ل`}
                sub={t('dashboard.liraPaymentsSubtitle')}
              />

              <KpiCard
                title={t('dashboard.liraExpenses')}
                value={`${Number(today.shipmentLiraExpenses || 0).toLocaleString("en-US")} ل.ل`}
                sub={t('dashboard.liraExpensesSubtitle')}
              />
            </div>
          </>
        )}
      </section>

      {/* Live today stats (your existing component broadcasts totals) */}
      <section className="pane">
        <h2 className="pane-title">{t('dashboard.todayShipmentDetails')}</h2>
        <CurrentShipmentStat />
      </section>
      <Suspense fallback={<div className="finx-tile" role="status" aria-live="polite">{t('dashboard.loading')}</div>}>
        <FinanceDashboard />
      </Suspense>
    </div>
  );
};

export default AdminHomePage;
