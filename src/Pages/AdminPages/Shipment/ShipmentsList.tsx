import React, { useMemo, useState } from "react";
import "./ShipmentsList.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader";

interface ShipmentData {
  _id: string;
  dayId: string;
  date: { day: number; month: number; year: number };
  companyId: string;
  carryingForDelivery: number;
  calculatedDelivered: number;
  calculatedReturned: number;
  shipmentLiraPayments: number;
  shipmentUSDPayments: number;
  shipmentLiraExtraProfits: number;
  shipmentUSDExtraProfits: number;
  shipmentLiraExpenses: number;
  shipmentUSDExpenses: number;
}
interface DateObject {
  day: number | null;
  month: number | null;
  year: number | null;
}

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

  const token = useSelector((s: any) => s.user.token);
  const companyId = useSelector((s: RootState) => s.user.companyId);

  const notifyError = (m: string) => toast.error(m);

  const formatDateObject = (d: DateObject): DateObject => ({
    day: d.day || null,
    month: d.month || null,
    year: d.year || null,
  });
  const dateObjectToDate = (d: DateObject): Date | null =>
    d.day && d.month && d.year ? new Date(d.year, d.month - 1, d.day) : null;

  const formatUSD = (n: number) =>
    `$ ${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const formatLBP = (n: number) =>
    `${Number(n || 0).toLocaleString("en-US")} ل.ل`;
  const formatDMY = (s: ShipmentData) =>
    `${s.date.day}/${s.date.month}/${s.date.year}`;

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
      notifyError("اختر تاريخي البداية والنهاية.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`https://trx-api.linarawas.com/api/shipments/range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId, fromDate: fFrom, toDate: fTo }),
      });
      if (!res.ok) throw new Error("Failed to fetch shipments");
      const { shipments: fetched } = await res.json();
      setShipments(fetched || []);
    } catch (e) {
      console.error(e);
      notifyError("تعذّر جلب الشحنات. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    const t = {
      carryingForDelivery: 0,
      calculatedDelivered: 0,
      calculatedReturned: 0,
      shipmentLiraPayments: 0,
      shipmentUSDPayments: 0,
      shipmentLiraExtraProfits: 0,
      shipmentUSDExtraProfits: 0,
      shipmentLiraExpenses: 0,
      shipmentUSDExpenses: 0,
    };
    shipments.forEach((s) => {
      t.carryingForDelivery += Number(s.carryingForDelivery) || 0;
      t.calculatedDelivered += Number(s.calculatedDelivered) || 0;
      t.calculatedReturned += Number(s.calculatedReturned) || 0;
      t.shipmentLiraPayments += Number(s.shipmentLiraPayments) || 0;
      t.shipmentUSDPayments += Number(s.shipmentUSDPayments) || 0;
      t.shipmentLiraExtraProfits += Number(s.shipmentLiraExtraProfits) || 0;
      t.shipmentUSDExtraProfits += Number(s.shipmentUSDExtraProfits) || 0;
      t.shipmentLiraExpenses += Number(s.shipmentLiraExpenses) || 0;
      t.shipmentUSDExpenses += Number(s.shipmentUSDExpenses) || 0;
    });
    const USD_overall =
      t.shipmentUSDPayments + t.shipmentUSDExtraProfits - t.shipmentUSDExpenses;
    const LIRA_overall =
      t.shipmentLiraPayments +
      t.shipmentLiraExtraProfits -
      t.shipmentLiraExpenses;
    return { ...t, USD_overall, LIRA_overall };
  }, [shipments]);

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
        <h1 className="ship-title">قائمة الشحنات</h1>
      </header>

      {/* Filter bar */}
      <section className="filter-card">
        <div className="filters">
          <div className="picker">
            <label>من</label>
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
              placeholderText="اختر تاريخ البداية"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="picker">
            <label>إلى</label>
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
              placeholderText="اختر تاريخ النهاية"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <button className="btn-primary" onClick={fetchShipments}>
            عرض
          </button>
        </div>

        <div className="quick-row">
          <button className="chip" onClick={() => setQuickRange(1)}>
            اليوم
          </button>
          <button className="chip" onClick={() => setQuickRange(7)}>
            آخر 7 أيام
          </button>
          {/* <button className="chip" onClick={() => setQuickRange(30)}>آخر 30 يوماً</button> */}
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
              <div className="kpi-label">عدد الشحنات</div>
              <div className="kpi-value">
                {shipments.length.toLocaleString("en-US")}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">المُسلّمة</div>
              <div className="kpi-value">
                {totals.calculatedDelivered.toLocaleString("en-US")}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">المُعادة</div>
              <div className="kpi-value">
                {totals.calculatedReturned.toLocaleString("en-US")}
              </div>
            </div>
            <div className="kpi accent">
              <div className="kpi-label">إجمالي بالدولار</div>
              <div className="kpi-value">{formatUSD(totals.USD_overall)}</div>
            </div>
            <div className="kpi accent">
              <div className="kpi-label">إجمالي بالليرة</div>
              <div className="kpi-value">{formatLBP(totals.LIRA_overall)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">ليرة (مدفوعات)</div>
              <div className="kpi-value">
                {formatLBP(totals.shipmentLiraPayments)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">دولار (مدفوعات)</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentUSDPayments)}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">نفقات $</div>
              <div className="kpi-value">
                {formatUSD(totals.shipmentUSDExpenses)}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Shipments list */}
      <section className="cards">
        {isLoading ? (
          <SpinLoader />
        ) : shipments.length === 0 ? (
          <div className="empty">لا توجد شحنات ضمن المدى الزمني المحدد.</div>
        ) : (
          shipments.map((s) => (
            <article className="ship-card" key={s._id}>
              <header className="ship-card-head">
                <div className="ship-date">التاريخ: {formatDMY(s)}</div>
              </header>
              <div className="ship-grid">
                <div className="item">
                  <span>للتوصيل</span>
                  <strong>{s.carryingForDelivery}</strong>
                </div>
                <div className="item">
                  <span>مُسلّمة</span>
                  <strong>{s.calculatedDelivered}</strong>
                </div>
                <div className="item">
                  <span>مُعادة</span>
                  <strong>{s.calculatedReturned}</strong>
                </div>
                <div className="item">
                  <span>مدفوعات ل.ل</span>
                  <strong>{formatLBP(s.shipmentLiraPayments)}</strong>
                </div>
                <div className="item">
                  <span>مدفوعات $</span>
                  <strong>{formatUSD(s.shipmentUSDPayments)}</strong>
                </div>
                <div className="item">
                  <span>نفقات ل.ل</span>
                  <strong>{formatLBP(s.shipmentLiraExpenses)}</strong>
                </div>
                <div className="item">
                  <span>نفقات $</span>
                  <strong>{formatUSD(s.shipmentUSDExpenses)}</strong>
                </div>
                <div className="item">
                  <span>أرباح إضافية ل.ل</span>
                  <strong>{formatLBP(s.shipmentLiraExtraProfits)}</strong>
                </div>
                <div className="item">
                  <span>أرباح إضافية $</span>
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
