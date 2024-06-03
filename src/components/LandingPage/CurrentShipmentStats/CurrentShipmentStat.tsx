import React, { useEffect, useState } from "react";
import "../../../Pages/Shipment/ShipmentsList.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import { RootState } from "../../../redux/store";

interface ShipmentData {
  _id: string;
  dayId: string;
  date: {
    day: number;
    month: number;
    year: number;
  };
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
  const notifyError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

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
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const formatDateObject = (dateObject: DateObject): DateObject => {
    const { day, month, year } = dateObject;
    return {
      day: day || null,
      month: month || null,
      year: year || null,
    };
  };
  const dateObjectToDate = (dateObj: DateObject): Date | null => {
    if (dateObj.day && dateObj.month && dateObj.year) {
      return new Date(dateObj.year, dateObj.month - 1, dateObj.day);
    }
    return null;
  };

  const token = useSelector((state: any) => state.user.token);
  const [isLoading, setIsLoading] = useState(false);
  const [shipments, setShipments] = useState<ShipmentData[]>([]);

  const fetchShipments = async (fromDate: DateObject, toDate: DateObject) => {
    const formattedFromDate = formatDateObject(fromDate);
    const formattedToDate = formatDateObject(toDate);

    if (
      !formattedFromDate.day ||
      !formattedFromDate.month ||
      !formattedFromDate.year ||
      !formattedToDate.day ||
      !formattedToDate.month ||
      !formattedToDate.year
    ) {
      console.error("Please select both From and To dates.");
      return;
    }
    try {
      setIsLoading(true); // Set loading state to true before fetching

      const response = await fetch(
        `http://localhost:5000/api/shipments/range`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyId: companyId,
            fromDate: formattedFromDate,
            toDate: formattedToDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shipments");
      }

      const { shipments: fetchedShipments } = await response.json();
      setShipments(fetchedShipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      notifyError("Failed to fetch shipments. Please try again.");
    } finally {
      setIsLoading(false); // Set loading state to false after fetching (success or error)
    }
  };

  // Function to check if the date is the same day
  const isSameDay = (dateA: Date, dateB: Date) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  useEffect(() => {
    const currentDate = new Date();
    const formattedFromDate = {
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };
    const formattedToDate = {
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };

    setFromDate(formattedFromDate);
    setToDate(formattedToDate);

    // Fetch shipments when the component mounts
    fetchShipments(formattedFromDate, formattedToDate);
  }, []);

  // Fetch shipments whenever the fromDate or toDate changes
  useEffect(() => {
    if (
      fromDate &&
      toDate &&
      isSameDay(
        new Date(),
        new Date(toDate.year!, toDate.month! - 1, toDate.day!)
      )
    ) {
      fetchShipments(fromDate, toDate);
    }
  }, [fromDate, toDate]);

  const calculateTotals = () => {
    const totals: Record<string, number> = {
      carryingForDelivery: 0,
      calculatedDelivered: 0,
      calculatedReturned: 0,
      shipmentLiraPayments: 0,
      shipmentUSDPayments: 0,
      shipmentLiraExtraProfits: 0,
      shipmentUSDExtraProfits: 0,
      shipmentLiraExpenses: 0,
      shipmentUSDExpenses: 0,
      USD_overall: 0,
      LIRA_overall: 0,
    };

    shipments.forEach((shipment) => {
      totals.carryingForDelivery += shipment.carryingForDelivery || 0;
      totals.calculatedDelivered += shipment.calculatedDelivered || 0;
      totals.calculatedReturned += shipment.calculatedReturned || 0;
      totals.shipmentLiraPayments += shipment.shipmentLiraPayments || 0;
      totals.shipmentUSDPayments += shipment.shipmentUSDPayments || 0;
      totals.shipmentLiraExtraProfits += shipment.shipmentLiraExtraProfits || 0;
      totals.shipmentUSDExtraProfits += shipment.shipmentUSDExtraProfits || 0;
      totals.shipmentLiraExpenses += shipment.shipmentLiraExpenses || 0;
      totals.shipmentUSDExpenses += shipment.shipmentUSDExpenses || 0;
    });

    return totals;
  };

  const totals = calculateTotals(); // Calculate totals based on the current shipments
  const USD_overall =
    totals.shipmentUSDPayments +
    totals.shipmentUSDExtraProfits -
    totals.shipmentUSDExpenses;
  const LIRA_overall =
    totals.shipmentLiraPayments +
    totals.shipmentLiraExtraProfits -
    totals.shipmentLiraExpenses;

  return (
    <div className="shipments-container">
      <div className="shipments-list">
        <h2>Here are your shipment stats for today's shipment</h2>
        <ToastContainer position="top-right" autoClose={3000} />

        {isLoading ? (
          <SpinLoader />
        ) : (
          <div className="totals">
            <div>Carried: {totals.carryingForDelivery}</div>
            <div>Delivered: {totals.calculatedDelivered}</div>
            <div>Returned: {totals.calculatedReturned}</div>
            <div>Lira Payments {totals.shipmentLiraPayments}</div>
            <div>$ Payments {totals.shipmentUSDPayments}</div>
            <div>Expenses $: {totals.shipmentUSDExpenses}</div>
            <div>Expenses LBP: {totals.shipmentLiraExpenses}</div>
            <div>
              Extra Profits $: {totals.shipmentUSDExtraProfits.toFixed(2)}
            </div>
            <div>Extra Profits LBP: {totals.shipmentLiraExtraProfits}</div>
            <div>Overall LBP: {LIRA_overall}</div>
            <div>Overall $: {USD_overall}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentShipmentStat;
