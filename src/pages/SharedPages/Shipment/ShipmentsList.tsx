import React, { useMemo, useState } from "react";
import "./ShipmentsList.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { selectUserToken, selectUserCompanyId } from "../../../redux/selectors/user";
import { fetchShipmentsByRange, DateObject, ShipmentData } from "../../../features/shipments/apiShipments";
import { formatUSD, formatLBP, formatDMY, computeShipmentTotals } from "../../../features/shipments/utils/formatShipment";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";
import { t } from "../../../utils/i18n";

const ShipmentsList: React.FC = () => {
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

  const formatDateObject = (d: DateObject): DateObject => ({
    day: d.day || null,
    month: d.month || null,
    year: d.year || null,
  });
  const dateObjectToDate = (d: DateObject): Date | null =>
    d.day && d.month && d.year ? new Date(d.year, d.month - 1, d.day) : null;

  const fetchShipments = async () => {
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
    if (!token || !companyId) {
      toast.error(t("common.error"));
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const fetched = await fetchShipmentsByRange(token, companyId, fFrom, fTo);
      setShipments(fetched || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(e);
      setError(message);
      toast.error(t("shipments.filter.fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => computeShipmentTotals(shipments), [shipments]);

  // Quick ranges (optional)
  const setQuickRange = (days: number) => {
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
  };

  return (
    <div className="ship-page" dir="rtl">
      <ToastContainer position="top-right" autoClose={2500} />
      <header className="ship-header">
        <h1 className="ship-title">{t("shipments.title")}</h1>
      </header>

      {/* Filter bar */}
      <section className="filter-card">
        <div className="filters">
          <div className="picker">
            <label>{t("shipments.filter.from")}</label>
            <DatePicker
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
            <label>{t("shipments.filter.to")}</label>
            <DatePicker
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
          <button type="button" className="btn-primary" onClick={fetchShipments}>
            {t("shipments.filter.show")}
          </button>
        </div>

        <div className="quick-row">
          <button type="button" className="chip" onClick={() => setQuickRange(1)}>
            {t("shipments.filter.quick.today")}
          </button>
          <button type="button" className="chip" onClick={() => setQuickRange(7)}>
            {t("shipments.filter.quick.last7Days")}
          </button>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpi-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div className="kpi" key={i}>
              <div className="skeleton skeleton-label" />
              <div className="skeleton skeleton-value" />
            </div>
          ))
        ) : (
          <>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.count")}</div>
              <div className="kpi-value">
                {shipments.length.toLocaleString("en-US")}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.delivered")}</div>
              <div className="kpi-value">
                {totals.calculatedDelivered.toLocaleString("en-US")}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.returned")}</div>
              <div className="kpi-value">
                {totals.calculatedReturned.toLocaleString("en-US")}
              </div>
            </div>
            <div className="kpi accent">
              <div className="kpi-label">{t("shipments.kpi.totalUSD")}</div>
              <div className="kpi-value">{formatUSD(totals.USD_overall)}</div>
            </div>
            <div className="kpi accent">
              <div className="kpi-label">{t("shipments.kpi.totalLBP")}</div>
              <div className="kpi-value">{formatLBP(totals.LIRA_overall)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.paymentsLBP")}</div>
              <div className="kpi-value">
                {formatLBP(totals.shipmentLiraPayments)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.paymentsUSD")}</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentUSDPayments)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.expensesUSD")}</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentUSDExpenses)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.expensesLBP")}</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentLiraExpenses)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.profitsUSD")}</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentUSDExtraProfits)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">{t("shipments.kpi.profitsLBP")}</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentLiraExtraProfits)}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Shipments list */}
      <section className="cards">
        {isLoading ? (
          <SpinLoader />
        ) : error ? (
          <div className="empty" role="alert">
            {t("common.error")}: {error}
          </div>
        ) : shipments.length === 0 ? (
          <div className="empty">{t("shipments.empty")}</div>
        ) : (
          shipments.map((s) => (
            <article className="ship-card" key={s._id}>
              <header className="ship-card-head">
                <div className="ship-date">{t("shipments.card.date")}: {formatDMY(s)}</div>
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
          ))
        )}
      </section>
    </div>
  );
};

export default ShipmentsList;
