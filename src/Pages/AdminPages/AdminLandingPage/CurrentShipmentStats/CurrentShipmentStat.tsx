import React from "react";
import "../../Shipment/ShipmentsList.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import SpinLoader from "../../../../components/UI reusables/SpinLoader/SpinLoader";
import { RootState } from "../../../../redux/store";

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

const CurrentShipmentStat: React.FC = () => {
  const notifyError = (msg: string) => toast.error(msg);

  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);

  const [fromDate, setFromDate] = React.useState<DateObject>({
    day: null,
    month: null,
    year: null,
  });
  const [toDate, setToDate] = React.useState<DateObject>({
    day: null,
    month: null,
    year: null,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [shipments, setShipments] = React.useState<ShipmentData[]>([]);

  const fetchShipments = React.useCallback(
    async (from: DateObject, to: DateObject) => {
      const f = {
        day: from.day || null,
        month: from.month || null,
        year: from.year || null,
      };
      const t = {
        day: to.day || null,
        month: to.month || null,
        year: to.year || null,
      };

      if (!f.day || !f.month || !f.year || !t.day || !t.month || !t.year) return;

      try {
        setIsLoading(true);
        const res = await fetch(`https://trx-api.linarawas.com/api/shipments/range`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyId, // keep if your backend expects it; otherwise remove and let server derive from token
            fromDate: f,
            toDate: t,
          }),
        });
        if (!res.ok) throw new Error("Failed to fetch shipments");
        const { shipments: fetchedShipments } = await res.json();
        setShipments(fetchedShipments || []);
      } catch (err) {
        console.error("Error fetching shipments:", err);
        notifyError("Failed to fetch shipments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, companyId]
  );

  // Initialize dates to today (run once)
  React.useEffect(() => {
    const d = new Date();
    const today = { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
    setFromDate(today);
    setToDate(today);
  }, []);

  // Fetch when date range changes
  React.useEffect(() => {
    if (fromDate.day && toDate.day) {
      fetchShipments(fromDate, toDate);
    }
  }, [fromDate, toDate, fetchShipments]);

  // Stable totals derived from shipments
  const totals = React.useMemo(() => {
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
    for (const s of shipments) {
      t.carryingForDelivery += s.carryingForDelivery || 0;
      t.calculatedDelivered += s.calculatedDelivered || 0;
      t.calculatedReturned += s.calculatedReturned || 0;
      t.shipmentLiraPayments += s.shipmentLiraPayments || 0;
      t.shipmentUSDPayments += s.shipmentUSDPayments || 0;
      t.shipmentLiraExtraProfits += s.shipmentLiraExtraProfits || 0;
      t.shipmentUSDExtraProfits += s.shipmentUSDExtraProfits || 0;
      t.shipmentLiraExpenses += s.shipmentLiraExpenses || 0;
      t.shipmentUSDExpenses += s.shipmentUSDExpenses || 0;
    }
    return t;
  }, [shipments]);

  const USD_overall =
    totals.shipmentUSDPayments +
    totals.shipmentUSDExtraProfits -
    totals.shipmentUSDExpenses;

  const LIRA_overall =
    totals.shipmentLiraPayments +
    totals.shipmentLiraExtraProfits -
    totals.shipmentLiraExpenses;

  // Broadcast to AdminLandingPage only when totals actually change
  const lastJsonRef = React.useRef<string>("");
  React.useEffect(() => {
    const json = JSON.stringify(totals);
    if (json !== lastJsonRef.current) {
      lastJsonRef.current = json;
      window.dispatchEvent(new CustomEvent("trx:todayTotals", { detail: totals }));
    }
  }, [totals]);

  return (
    <div className="shipments-container" dir="rtl">
      <div className="shipments-list">
        <h2>إحصائيات خاصة بشحنة اليوم</h2>
        <ToastContainer position="top-right" autoClose={3000} />

        {isLoading ? (
          <SpinLoader />
        ) : (
          <div className="totals">
            <div>المحمولة: {totals.carryingForDelivery}</div>
            <div>تم التوصيل: {totals.calculatedDelivered}</div>
            <div>المرتجعة: {totals.calculatedReturned}</div>
            <div>المدفوعات بالليرة: {totals.shipmentLiraPayments.toLocaleString("en-US")}</div>
            <div>المدفوعات بالدولار: {totals.shipmentUSDPayments.toFixed(2)}</div>
            <div>المصاريف بالدولار: {totals.shipmentUSDExpenses.toFixed(2)}</div>
            <div>المصاريف بالليرة: {totals.shipmentLiraExpenses.toLocaleString("en-US")}</div>
            <div>الأرباح الإضافية بالدولار: {totals.shipmentUSDExtraProfits.toFixed(2)}</div>
            <div>الأرباح الإضافية بالليرة: {totals.shipmentLiraExtraProfits.toLocaleString("en-US")}</div>
            <div>الإجمالي بالليرة: {LIRA_overall.toLocaleString("en-US")}</div>
            <div>الإجمالي بالدولار: {USD_overall.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentShipmentStat;
