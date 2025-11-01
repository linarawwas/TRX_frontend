import React from "react";
import "../../../SharedPages/Shipment/ShipmentsList.css";
import { useSelector } from "react-redux";
import SpinLoader from "../../../../components/UI reusables/SpinLoader/SpinLoader";
import { RootState } from "../../../../redux/store";
import { useTodayShipmentTotals } from "../../../../features/shipments/hooks/useTodayShipmentTotals";

const CurrentShipmentStat: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);

  const { totals, loading: isLoading } = useTodayShipmentTotals(
    token,
    companyId
  );

  const USD_overall =
    totals.shipmentUSDPayments +
    totals.shipmentUSDExtraProfits -
    totals.shipmentUSDExpenses;

  const LIRA_overall =
    totals.shipmentLiraPayments +
    totals.shipmentLiraExtraProfits -
    totals.shipmentLiraExpenses;

  return (
    <div className="shipments-container" dir="rtl">
      <div className="shipments-list">
        <h2>إحصائيات خاصة بشحنة اليوم</h2>

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
