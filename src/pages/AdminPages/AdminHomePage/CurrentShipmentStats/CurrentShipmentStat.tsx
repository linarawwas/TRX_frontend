import React, {
  memo,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import "./CurrentShipmentStat.css";
import {
  useTodayShipmentTotals,
  type ShipmentTotals,
} from "../../../../features/shipments/hooks/useTodayShipmentTotals";
import { computeNetTotals } from "../../../../features/shipments/utils/totals";
import type { RootState } from "../../../../redux/store";
import { t } from "../../../../utils/i18n";
import { createLogger } from "../../../../utils/logger";

const logger = createLogger("current-shipment-stat");

const TITLE = "إحصائيات خاصة بشحنة اليوم";

type StatRowProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

const StatRow = memo(function StatRow({
  label,
  value,
  emphasize = false,
}: StatRowProps) {
  return (
    <>
      <dt className={`ccs-label${emphasize ? " ccs-label--net" : ""}`}>{label}</dt>
      <dd className={`ccs-value${emphasize ? " ccs-value--net" : ""}`}>{value}</dd>
    </>
  );
});

const CurrentShipmentStatSkeleton = memo(function CurrentShipmentStatSkeleton() {
  return (
    <div
      className="ccs-skeleton"
      role="status"
      aria-busy="true"
      aria-label={t("common.loading")}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="ccs-skeleton-row">
          <div className="ccs-skeleton-line ccs-skeleton-line--label" />
          <div className="ccs-skeleton-line ccs-skeleton-line--value" />
        </div>
      ))}
    </div>
  );
});

function useShipmentStatRows(totals: ShipmentTotals) {
  return useMemo(
    () =>
      [
        {
          id: "carrying",
          label: "المحمولة:",
          value: String(totals.carryingForDelivery),
        },
        {
          id: "delivered",
          label: "تم التوصيل:",
          value: String(totals.calculatedDelivered),
        },
        {
          id: "returned",
          label: "المرتجعة:",
          value: String(totals.calculatedReturned),
        },
        {
          id: "liraPay",
          label: "المدفوعات بالليرة:",
          value: totals.shipmentLiraPayments.toLocaleString("en-US"),
        },
        {
          id: "usdPay",
          label: "المدفوعات بالدولار:",
          value: totals.shipmentUSDPayments.toFixed(2),
        },
        {
          id: "usdExp",
          label: "المصاريف بالدولار:",
          value: totals.shipmentUSDExpenses.toFixed(2),
        },
        {
          id: "liraExp",
          label: "المصاريف بالليرة:",
          value: totals.shipmentLiraExpenses.toLocaleString("en-US"),
        },
        {
          id: "usdExtra",
          label: "الأرباح الإضافية بالدولار:",
          value: totals.shipmentUSDExtraProfits.toFixed(2),
        },
        {
          id: "liraExtra",
          label: "الأرباح الإضافية بالليرة:",
          value: totals.shipmentLiraExtraProfits.toLocaleString("en-US"),
        },
      ] as const,
    [totals]
  );
}

function CurrentShipmentStatInner(): JSX.Element {
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const token = useSelector((s: RootState) => s.user.token);

  const { totals, loading, error, refetch } = useTodayShipmentTotals(
    token,
    companyId
  );

  const { usd, lbp } = useMemo(() => computeNetTotals(totals), [totals]);
  const detailRows = useShipmentStatRows(totals);

  const netRows = useMemo(
    () =>
      [
        {
          id: "netLbp",
          label: "الإجمالي بالليرة:",
          value: lbp.toLocaleString("en-US"),
        },
        {
          id: "netUsd",
          label: "الإجمالي بالدولار:",
          value: usd.toFixed(2),
        },
      ] as const,
    [lbp, usd]
  );

  useEffect(() => {
    if (error) {
      logger.warn("today shipment totals query failed", {
        companyId,
        message: error,
      });
    }
  }, [error, companyId]);

  return (
    <section
      className="ccs-shell"
      dir="rtl"
      lang="ar"
      aria-labelledby="ccs-heading"
    >
      <div className="ccs-card">
        <h2 id="ccs-heading" className="ccs-title">
          {TITLE}
        </h2>

        {loading ? (
          <CurrentShipmentStatSkeleton />
        ) : error ? (
          <div className="ccs-error" role="alert">
            <p className="ccs-error__text">
              {t("common.error")}: {error}
            </p>
            <button
              type="button"
              className="ccs-retry"
              onClick={() => {
                void refetch();
              }}
            >
              {t("updateCustomer.retry")}
            </button>
          </div>
        ) : (
          <>
            <dl className="ccs-dl">
              {detailRows.map((row) => (
                <StatRow key={row.id} label={row.label} value={row.value} />
              ))}
            </dl>
            <div className="ccs-net-wrap" aria-label="صافي الإجمالي">
              <dl className="ccs-dl ccs-dl--net">
                {netRows.map((row) => (
                  <StatRow
                    key={row.id}
                    label={row.label}
                    value={row.value}
                    emphasize
                  />
                ))}
              </dl>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type BoundaryState = { hasError: boolean };

class CurrentShipmentStatErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logger.error("CurrentShipmentStat crashed", {
      message: err.message,
      stack: err.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="ccs-shell ccs-shell--error" dir="rtl" lang="ar" role="alert">
          <div className="ccs-error-card">
            <h2 className="ccs-error-title">{t("updateCustomer.errorBoundary.title")}</h2>
            <p className="ccs-error-body">{t("updateCustomer.errorBoundary.body")}</p>
            <button
              type="button"
              className="ccs-error-reload"
              onClick={() => window.location.reload()}
            >
              {t("updateCustomer.errorBoundary.reload")}
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

export default function CurrentShipmentStat(): JSX.Element {
  return (
    <CurrentShipmentStatErrorBoundary>
      <CurrentShipmentStatInner />
    </CurrentShipmentStatErrorBoundary>
  );
}
