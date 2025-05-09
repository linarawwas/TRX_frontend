import React, { useState } from 'react';
import './ShipmentsList.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { RootState } from '../../../redux/store';
import SpinLoader from '../../../components/UI reusables/SpinLoader/SpinLoader';
// import SpinLoader from '../../components/UI reusables/SpinLoader/SpinLoader';
// import { RootState } from '../../redux/store';


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

const ShipmentsList: React.FC = () => {
  const notifyError = (errorMessage: string) => {
    toast.error(errorMessage);
  };


  const [fromDate, setFromDate] = useState<DateObject>({ day: null, month: null, year: null });
  const [toDate, setToDate] = useState<DateObject>({ day: null, month: null, year: null });
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
  const [currentPage, setCurrentPage] = useState(1);
  const [shipmentsPerPage] = useState(1);

  const indexOfLastShipment = currentPage * shipmentsPerPage;
  const indexOfFirstShipment = indexOfLastShipment - shipmentsPerPage;
  const currentShipments = shipments.slice(indexOfFirstShipment, indexOfLastShipment);

  const fetchShipments = async () => {
    const formattedFromDate = formatDateObject(fromDate);
    const formattedToDate = formatDateObject(toDate);

    if (!formattedFromDate.day || !formattedFromDate.month || !formattedFromDate.year ||
      !formattedToDate.day || !formattedToDate.month || !formattedToDate.year) {
      console.error('Please select both From and To dates.');
      return;
    }
    try {
      setIsLoading(true); // Set loading state to true before fetching

      const response = await fetch(`https://trx-api.linarawas.com/api/shipments/range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId:companyId, fromDate: formattedFromDate, toDate: formattedToDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }

      const { shipments: fetchedShipments } = await response.json();
      setShipments(fetchedShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      notifyError('Failed to fetch shipments. Please try again.');
    } finally {
      setIsLoading(false); // Set loading state to false after fetching (success or error)
    }
  };
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
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
      totals.carryingForDelivery += Number(shipment.carryingForDelivery) || 0;
      totals.calculatedDelivered += Number(shipment.calculatedDelivered ) || 0;
      totals.calculatedReturned += Number(shipment.calculatedReturned ) || 0;
      totals.shipmentLiraPayments += Number(shipment.shipmentLiraPayments ) || 0;
      totals.shipmentUSDPayments += Number(shipment.shipmentUSDPayments ) || 0;
      totals.shipmentLiraExtraProfits += Number(shipment.shipmentLiraExtraProfits ) || 0;
      totals.shipmentUSDExtraProfits += Number(shipment.shipmentUSDExtraProfits ) || 0;
      totals.shipmentLiraExpenses += Number(shipment.shipmentLiraExpenses ) || 0;
      totals.shipmentUSDExpenses += Number(shipment.shipmentUSDExpenses ) || 0

    });

    return totals;
  };

  const totals = calculateTotals(); // Calculate totals based on the current shipments
  const USD_overall = totals.shipmentUSDPayments + totals.shipmentUSDExtraProfits - totals.shipmentUSDExpenses;
  const LIRA_overall = totals.shipmentLiraPayments + totals.shipmentLiraExtraProfits - totals.shipmentLiraExpenses;

  return (
    <div className="shipments-container" dir="rtl">
      <div className="shipments-list">
        <h2>قائمة الشحنات</h2>
        <ToastContainer position="top-right" autoClose={3000} />
  
        {/* Date Pickers */}
        <div className="date-pickers">
          <DatePicker
            selected={dateObjectToDate(fromDate)}
            onChange={(date: Date | null) => {
              if (date) {
                setFromDate({
                  day: date.getDate(),
                  month: date.getMonth() + 1,
                  year: date.getFullYear(),
                });
              } else {
                setFromDate({ day: null, month: null, year: null });
              }
            }}
            placeholderText="اختر تاريخ البداية"
          />
          <DatePicker
            selected={dateObjectToDate(toDate)}
            onChange={(date: Date | null) => {
              if (date) {
                setToDate({
                  day: date.getDate(),
                  month: date.getMonth() + 1,
                  year: date.getFullYear(),
                });
              } else {
                setToDate({ day: null, month: null, year: null });
              }
            }}
            placeholderText="اختر تاريخ النهاية"
          />
          <button onClick={fetchShipments}>تحديد</button>
        </div>
  
        {isLoading ? (
          <SpinLoader />
        ) : (
          <div className="totals">
            <div>مجموع الشحنات للتوصيل: {totals.carryingForDelivery}</div>
            <div>مجموع الشحنات المُسلمة: {totals.calculatedDelivered}</div>
            <div>مجموع الشحنات المُعادت: {totals.calculatedReturned}</div>
            <div>مدفوعات الليرة: {totals.shipmentLiraPayments}</div>
            <div>مدفوعات الدولار: {totals.shipmentUSDPayments}</div>
            <div>النفقات بالدولار: {totals.shipmentUSDExpenses}</div>
            <div>النفقات بالليرة: {totals.shipmentLiraExpenses}</div>
            <div>الأرباح الإضافية بالدولار: {totals.shipmentUSDExtraProfits}</div>
            <div>الأرباح الإضافية بالليرة: {totals.shipmentLiraExtraProfits}</div>
            <div>إجمالي بالليرة: {LIRA_overall}</div>
            <div>إجمالي بالدولار: {USD_overall}</div>
          </div>
        )}
        <ul className="shipment-info-box">
          {isLoading ? (
            <SpinLoader />
          ) : (
            currentShipments.map((shipment) => (
              <li className="single-shipment-info" key={shipment._id}>
                <div className="shipment-info-field">
                  <strong>التاريخ:</strong> {shipment.date.day}/{shipment?.date.month}/{shipment.date.year}
                </div>
                <div className="shipment-info-field">
                  <strong>مجموع الشحنات للتوصيل:</strong> {shipment?.carryingForDelivery}
                </div>
                <div className="shipment-info-field">
                  <strong>مجموع الشحنات المُسلمة:</strong> {shipment?.calculatedDelivered}
                </div>
                <div className="shipment-info-field">
                  <strong>مجموع الشحنات المُعادت:</strong> {shipment?.calculatedReturned}
                </div>
                <div className="shipment-info-field">
                  <strong>مدفوعات الليرة:</strong> {shipment?.shipmentLiraPayments}
                </div>
                <div className="shipment-info-field">
                  <strong>مدفوعات الدولار:</strong> {shipment?.shipmentUSDPayments}
                </div>
                <div className="shipment-info-field">
                  <strong>النفقات بالليرة:</strong> {shipment?.shipmentLiraExpenses}
                </div>
                <div className="shipment-info-field">
                  <strong>النفقات بالدولار:</strong> {shipment?.shipmentUSDExpenses}
                </div>
                <div className="shipment-info-field">
                  <strong>الأرباح الإضافية بالدولار:</strong> {shipment?.shipmentUSDExtraProfits}
                </div>
                <div className="shipment-info-field">
                  <strong>الأرباح الإضافية بالليرة:</strong> {shipment?.shipmentLiraExtraProfits}
                </div>
              </li>
            ))
          )}
        </ul>
  
        {/* Pagination */}
        <ul className="pagination">
          {Array.from({ length: Math.ceil(shipments.length / shipmentsPerPage) }, (_, index) => (
            <li key={index} onClick={() => paginate(index + 1)} className="pagination-item">
              {index + 1}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
};

export default ShipmentsList;

