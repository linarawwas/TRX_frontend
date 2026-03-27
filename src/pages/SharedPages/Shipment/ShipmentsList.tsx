import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "./ShipmentsList.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  selectUserToken,
  selectUserCompanyId,
} from "../../../redux/selectors/user";
import { useLazyListShipmentsRangeQuery } from "../../../features/api/trxApi";
import {
  type DateObject,
  type ShipmentData,
} from "../../../features/shipments/apiShipments";
import {
  formatUSD,
  formatLBP,
  formatDMY,
  computeShipmentTotals,
  type ShipmentTotals,
} from "../../../features/shipments/utils/formatShipment";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("shipments-list");

const KPI_SKELETON_COUNT = 11;

const KpiSkeletonGrid = memo(function KpiSkeletonGrid() {
  return (
    <>
      {Array.from({ length: KPI_SKELETON_COUNT }, (_, i) => (
        <div className="kpi sls-kpi-skel" key={i}>
          <div className="skeleton skeleton-label" aria-hidden />
          <div className="skeleton skeleton-value" aria-hidden />
        </div>
      ))}
    </>
  );
});

const ShipmentsCardsSkeleton = memo(function ShipmentsCardsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div className="ship-card sls-card-skeleton" key={i} aria-hidden>
          <div className="sls-card-skeleton__head skeleton" />
          <div className="sls-card-skeleton__grid">
            {Array.from({ length: 6 }, (_, j) => (
              <div key={j} className="sls-card-skeleton__cell skeleton" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
});

const ShipmentCard = memo(function ShipmentCard({ s }: { s: ShipmentData }) {
  return (
    <article className="ship-card sls-ship-card">
      <header className="ship-card-head">
        <div className="ship-date">
          {t("shipments.card.date")}: {formatDMY(s)}
        </div>
      </header>
      <div className="ship-grid">
        <div className="item">
          <span>{t("shipments.card.forDelivery")}</span>
          <strong>{s.carryingForDelivery}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.delivered")}</span>
          <strong>{s.calculatedDelivered}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.returned")}</span>
          <strong>{s.calculatedReturned}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.paymentsLBP")}</span>
          <strong>{formatLBP(s.shipmentLiraPayments)}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.paymentsUSD")}</span>
          <strong>{formatUSD(s.shipmentUSDPayments)}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.expensesLBP")}</span>
          <strong>{formatLBP(s.shipmentLiraExpenses)}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.expensesUSD")}</span>
          <strong>{formatUSD(s.shipmentUSDExpenses)}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.profitsLBP")}</span>
          <strong>{formatLBP(s.shipmentLiraExtraProfits)}</strong>
        </div>
        <div className="item">
          <span>{t("shipments.card.profitsUSD")}</span>
          <strong>{formatUSD(s.shipmentUSDExtraProfits)}</strong>
        </div>
      </div>
    </article>
  );
});

function buildKpiItems(
  shipments: ShipmentData[],
  totals: ShipmentTotals,
  translate: typeof t
): { id: string; label: string; value: string; accent: boolean }[] {
  return [
    {
      id: "count",
      accent: false,
      label: translate("shipments.kpi.count"),
      value: shipments.length.toLocaleString("en-US"),
    },
    {
      id: "delivered",
      accent: false,
      label: translate("shipments.kpi.delivered"),
      value: totals.calculatedDelivered.toLocaleString("en-US"),
    },
    {
      id: "returned",
      accent: false,
      label: translate("shipments.kpi.returned"),
      value: totals.calculatedReturned.toLocaleString("en-US"),
    },
    {
      id: "totalUsd",
      accent: true,
      label: translate("shipments.kpi.totalUSD"),
      value: formatUSD(totals.USD_overall),
    },
    {
      id: "totalLbp",
      accent: true,
      label: translate("shipments.kpi.totalLBP"),
      value: formatLBP(totals.LIRA_overall),
    },
    {
      id: "payLbp",
      accent: false,
      label: translate("shipments.kpi.paymentsLBP"),
      value: formatLBP(totals.shipmentLiraPayments),
    },
    {
      id: "payUsd",
      accent: false,
      label: translate("shipments.kpi.paymentsUSD"),
      value: formatUSD(totals.shipmentUSDPayments),
    },
    {
      id: "expUsd",
      accent: false,
      label: translate("shipments.kpi.expensesUSD"),
      value: formatUSD(totals.shipmentUSDExpenses),
    },
    {
      id: "expLbp",
      accent: false,
      label: translate("shipments.kpi.expensesLBP"),
      value: formatUSD(totals.shipmentLiraExpenses),
    },
    {
      id: "profUsd",
      accent: false,
      label: translate("shipments.kpi.profitsUSD"),
      value: formatUSD(totals.shipmentUSDExtraProfits),
    },
    {
      id: "profLbp",
      accent: false,
      label: translate("shipments.kpi.profitsLBP"),
      value: formatUSD(totals.shipmentLiraExtraProfits),
    },
  ];
}

function ShipmentsListInner(): JSX.Element {
  const [fromDate, setFromDate] = useState<DateObject>({
    day: null,
    month: null,
    year: null,
  });
  const [toDate, setToDate] = useState<DateObject>({
    day: null,
    month: null,
    year: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);
  const [listShipmentsRange] = useLazyListShipmentsRangeQuery();

  const formatDateObject = useCallback((d: DateObject): DateObject => {
    return {
      day: d.day || null,
      month: d.month || null,
      year: d.year || null,
    };
  }, []);

  const dateObjectToDate = useCallback((d: DateObject): Date | null => {
    return d.day && d.month && d.year
      ? new Date(d.year, d.month - 1, d.day)
      : null;
  }, []);

  const fetchShipments = useCallback(async () => {
    const fFrom = formatDateObject(fromDate);
    const fTo = formatDateObject(toDate);
    if (
      !fFrom.day ||
      !fFrom.month ||
      !fFrom.year ||
      !fTo.day ||
      !fTo.month ||
      !fTo.year
    ) {
      toast.error(t("shipments.filter.dateRequired"));
      return;
    }
    const requestFrom = { day: fFrom.day, month: fFrom.month, year: fFrom.year };
    const requestTo = { day: fTo.day, month: fTo.month, year: fTo.year };
    if (!token || !companyId) {
      toast.error(t("common.error"));
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const payload = await listShipmentsRange({
        companyId,
        fromDate: requestFrom,
        toDate: requestTo,
      }).unwrap();
      const fetched = Array.isArray(payload?.shipments)
        ? (payload.shipments as ShipmentData[])
        : [];
      setShipments(fetched || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      logger.warn("listShipmentsRange failed", {
        message,
        companyId,
      });
      setError(message);
      toast.error(t("shipments.filter.fetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [
    companyId,
    formatDateObject,
    fromDate,
    listShipmentsRange,
    toDate,
    token,
  ]);

  const totals = useMemo(() => computeShipmentTotals(shipments), [shipments]);

  const kpiItems = useMemo(
    () => buildKpiItems(shipments, totals, t),
    [shipments, totals]
  );

  const setQuickRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setFromDate({
      day: start.getDate(),
      month: start.getMonth() + 1,
      year: start.getFullYear(),
    });
    setToDate({
      day: end.getDate(),
      month: end.getMonth() + 1,
      year: end.getFullYear(),
    });
  }, []);

  return (
    <div className="ship-page sls-shell" dir="rtl" lang="ar">
      <ToastContainer position="top-right" autoClose={2500} />

      <header className="ship-header sls-header">
        <h1 id="sls-title" className="ship-title">
          {t("shipments.title")}
        </h1>
      </header>

      <section className="filter-card sls-filter">
        <div className="filters">
          <div className="picker">
            <label htmlFor="sls-from-date">{t("shipments.filter.from")}</label>
            <DatePicker
              id="sls-from-date"
              selected={dateObjectToDate(fromDate)}
              onChange={(d) =>
                setFromDate(
                  d
                    ? {
                        day: d.getDate(),
                        month: d.getMonth() + 1,
                        year: d.getFullYear(),
                      }
                    : { day: null, month: null, year: null }
                )
              }
              placeholderText={t("shipments.filter.from")}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="picker">
            <label htmlFor="sls-to-date">{t("shipments.filter.to")}</label>
            <DatePicker
              id="sls-to-date"
              selected={dateObjectToDate(toDate)}
              onChange={(d) =>
                setToDate(
                  d
                    ? {
                        day: d.getDate(),
                        month: d.getMonth() + 1,
                        year: d.getFullYear(),
                      }
                    : { day: null, month: null, year: null }
                )
              }
              placeholderText={t("shipments.filter.to")}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <button
            type="button"
            className="btn-primary sls-btn-fetch"
            onClick={() => {
              void fetchShipments();
            }}
          >
            {t("shipments.filter.show")}
          </button>
        </div>

        <div className="quick-row sls-quick-row">
          <button
            type="button"
            className="chip sls-chip"
            onClick={() => setQuickRange(1)}
          >
            {t("shipments.filter.quick.today")}
          </button>
          <button
            type="button"
            className="chip sls-chip"
            onClick={() => setQuickRange(7)}
          >
            {t("shipments.filter.quick.last7Days")}
          </button>
        </div>
      </section>

      <section className="kpi-grid sls-kpi-grid" aria-busy={isLoading}>
        {isLoading ? (
          <KpiSkeletonGrid />
        ) : (
          kpiItems.map((row) => (
            <div
              key={row.id}
              className={`kpi sls-kpi${row.accent ? " accent" : ""}`}
            >
              <div className="kpi-label">{row.label}</div>
              <div className="kpi-value">{row.value}</div>
            </div>
          ))
        )}
      </section>

      <section className="cards sls-cards" aria-label={t("shipments.title")}>
        {isLoading ? (
          <ShipmentsCardsSkeleton />
        ) : error ? (
          <div className="empty sls-inline-error" role="alert">
            <p className="sls-inline-error__text">
              {t("common.error")}: {error}
            </p>
            <button
              type="button"
              className="sls-retry"
              onClick={() => {
                void fetchShipments();
              }}
            >
              {t("updateCustomer.retry")}
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <div className="empty sls-empty">{t("shipments.empty")}</div>
        ) : (
          shipments.map((s) => <ShipmentCard key={s._id} s={s} />)
        )}
      </section>
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class ShipmentsListErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logger.error("ShipmentsList crashed", {
      message: err.message,
      stack: err.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="ship-page sls-shell sls-shell--error" dir="rtl" lang="ar" role="alert">
          <div className="sls-error-card">
            <h2 className="sls-error-title">{t("updateCustomer.errorBoundary.title")}</h2>
            <p className="sls-error-body">{t("updateCustomer.errorBoundary.body")}</p>
            <button
              type="button"
              className="sls-error-reload"
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

export default function ShipmentsList(): JSX.Element {
  return (
    <ShipmentsListErrorBoundary>
      <ShipmentsListInner />
    </ShipmentsListErrorBoundary>
  );
}
