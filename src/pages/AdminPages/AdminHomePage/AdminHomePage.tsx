import React, {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import "./LandingPage.css";
import "./AdminHomePage.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
import AdminFeatures from "../../../components/LandingPage/AdminFeatures";
import CurrentShipmentStat from "./CurrentShipmentStats/CurrentShipmentStat";
import Sparkline from "../../../components/visuals/Sparkline";
import RingCard from "../../../components/dashboard/RingCard";
import KpiCard from "../../../components/dashboard/KpiCard";
import { useTodayShipmentTotals } from "../../../features/shipments/hooks/useTodayShipmentTotals";
import {
  computeNetTotals,
  seedTrend,
} from "../../../features/shipments/utils/totals";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("admin-home");

const FinanceDashboard = React.lazy(
  () => import("../FinanceDashboard/FinanceDashboard")
);

const AdminSnapshotSkeleton = memo(function AdminSnapshotSkeleton() {
  return (
    <>
      <div className="ring-card ahp-skel-ring-card">
        <div className="ahp-skel-circle skeleton" aria-hidden="true" />
        <div className="ahp-skel-meta">
          <div className="skeleton skeleton-label ahp-skel-line" aria-hidden="true" />
          <div className="skeleton skeleton-label ahp-skel-line" aria-hidden="true" />
          <div className="skeleton skeleton-label ahp-skel-line" aria-hidden="true" />
        </div>
      </div>
      <div className="kpi-wrap">
        {[0, 1, 2].map((i) => (
          <div key={i} className="kpi-card ahp-skel-kpi">
            <div className="skeleton skeleton-label" aria-hidden="true" />
            <div className="skeleton skeleton-value" aria-hidden="true" />
            <div
              className="skeleton skeleton-label ahp-skel-kpi-sub"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </>
  );
});

const FinanceDashboardFallback = memo(function FinanceDashboardFallback() {
  return (
    <div
      className="finx-tile ahp-finx-fallback"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="ahp-finx-fallback__inner">
        <span className="ahp-finx-fallback__shimmer" aria-hidden="true" />
        <span className="ahp-finx-fallback__text">{t("dashboard.loading")}</span>
      </div>
    </div>
  );
});

function AdminHomePageInner(): JSX.Element {
  const name = useSelector((s: RootState) => s.user.username);
  const token = useSelector((s: RootState) => s.user.token);
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const navigate = useNavigate();

  const { totals: today, loading, error, refetch } = useTodayShipmentTotals(
    token,
    companyId
  );

  const { usd: USD_overall } = useMemo(
    () => computeNetTotals(today),
    [today]
  );
  const usdTrend = useMemo(() => seedTrend(USD_overall), [USD_overall]);

  const dateStr = new Date().toLocaleDateString("ar-LB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const goCurrentShipment = useCallback(() => {
    navigate("/currentShipment");
  }, [navigate]);

  const printToday = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (error) {
      logger.warn("admin home snapshot: today totals query failed", {
        companyId,
        message: error,
      });
    }
  }, [error, companyId]);

  return (
    <div className="admin-home ahp-root" dir="rtl" lang="ar">
      <section className="admin-hero ahp-hero" aria-labelledby="ahp-hero-heading">
        <div className="hero-top">
          <h1 id="ahp-hero-heading" className="hero-title">
            {t("dashboard.hello")} {name}
          </h1>
          <div className="hero-sub ahp-hero-sub">{dateStr}</div>
        </div>

        <div className="quick-actions ahp-quick-actions">
          <AdminFeatures />
          <button
            type="button"
            className="qa-btn outline ahp-qa-btn"
            onClick={goCurrentShipment}
            aria-label={t("dashboard.quickActions.viewShipments")}
          >
            <span className="ahp-qa-icon" aria-hidden="true">
              👁️
            </span>{" "}
            {t("dashboard.quickActions.viewShipments")}
          </button>
         
        </div>
      </section>

      <section className="snapshot ahp-snapshot">
        {loading ? (
          <AdminSnapshotSkeleton />
        ) : error ? (
          <div className="kpi-card ahp-snapshot-error" role="alert">
            <p className="ahp-snapshot-error__text">{t("dashboard.error")}</p>
            <button
              type="button"
              className="ahp-retry"
              onClick={() => {
                void refetch();
              }}
            >
              {t("updateCustomer.retry")}
            </button>
          </div>
        ) : (
          <>
            <RingCard
              value={today.calculatedDelivered}
              total={Math.max(0, today.carryingForDelivery || 0)}
              label={t("dashboard.deliveryRateToday")}
              delivered={today.calculatedDelivered}
              carrying={today.carryingForDelivery}
              returned={today.calculatedReturned}
            />

            <div className="kpi-wrap">
              <KpiCard
                title={t("dashboard.netUSD")}
                value={`$ ${Number(USD_overall || 0).toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}`}
                sub={t("dashboard.netUSDSubtitle")}
                className="accent"
              >
                <Sparkline points={usdTrend} />
              </KpiCard>

              <KpiCard
                title={t("dashboard.liraPayments")}
                value={`${Number(today.shipmentLiraPayments || 0).toLocaleString(
                  "en-US"
                )} ل.ل`}
                sub={t("dashboard.liraPaymentsSubtitle")}
              />

              <KpiCard
                title={t("dashboard.liraExpenses")}
                value={`${Number(today.shipmentLiraExpenses || 0).toLocaleString(
                  "en-US"
                )} ل.ل`}
                sub={t("dashboard.liraExpensesSubtitle")}
              />
            </div>
          </>
        )}
      </section>

      <section
        className="pane ahp-pane"
        aria-labelledby="ahp-pane-title"
      >
        <h2 id="ahp-pane-title" className="pane-title">
          {t("dashboard.todayShipmentDetails")}
        </h2>
        <CurrentShipmentStat />
      </section>

      <Suspense fallback={<FinanceDashboardFallback />}>
        <FinanceDashboard />
      </Suspense>
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class AdminHomeErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logger.error("AdminHomePage crashed", {
      message: err.message,
      stack: err.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="admin-home ahp-root ahp-root--error" dir="rtl" lang="ar" role="alert">
          <div className="ahp-error-card">
            <h2 className="ahp-error-title">{t("updateCustomer.errorBoundary.title")}</h2>
            <p className="ahp-error-body">{t("updateCustomer.errorBoundary.body")}</p>
            <button
              type="button"
              className="ahp-error-reload"
              onClick={() => window.location.reload()}
            >
              {t("updateCustomer.errorBoundary.reload")}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminHomePage(): JSX.Element {
  return (
    <AdminHomeErrorBoundary>
      <AdminHomePageInner />
    </AdminHomeErrorBoundary>
  );
}
