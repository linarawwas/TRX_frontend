import React, { useEffect, useState } from 'react';
import '../../Shipment/ShipmentsList.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';

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
  shipmentCalculatedPayments: number;
  shipmentTotalExpenses: number;
  shipmentCalculatedExtraProfits: number;
  shipmentCalculatedLiraPayments: number;
  shipmentCalculatedUSDPayments: number;
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


  const [fromDate, setFromDate] = useState<DateObject>({ day: null, month: null, year: null });
  const [toDate, setToDate] = useState<DateObject>({ day: null, month: null, year: null });

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

  const fetchShipments = async (fromDate: DateObject, toDate: DateObject) => {
    const formattedFromDate = formatDateObject(fromDate);
    const formattedToDate = formatDateObject(toDate);

    if (!formattedFromDate.day || !formattedFromDate.month || !formattedFromDate.year ||
      !formattedToDate.day || !formattedToDate.month || !formattedToDate.year) {
      console.error('Please select both From and To dates.');
      return;
    }
    try {
      setIsLoading(true); // Set loading state to true before fetching

      const response = await fetch(`http://localhost:5000/api/shipments/range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromDate: formattedFromDate, toDate: formattedToDate }),
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
    if (fromDate && toDate && isSameDay(new Date(), new Date(toDate.year!, toDate.month! - 1, toDate.day!))) {
      fetchShipments(fromDate, toDate);
    }
  }, [fromDate, toDate]);
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const calculateTotals = () => {
    const totals: Record<string, number> = {
      carryingForDelivery: 0,
      calculatedDelivered: 0,
      calculatedReturned: 0,
      shipmentCalculatedPayments: 0,
      shipmentTotalExpenses: 0,
      shipmentCalculatedExtraProfits: 0,
      shipmentCalculatedLiraPayments: 0,
      shipmentCalculatedUSDPayments: 0,
    };

    shipments.forEach((shipment) => {
      totals.carryingForDelivery += shipment.carryingForDelivery || 0;
      totals.calculatedDelivered += shipment.calculatedDelivered || 0;
      totals.calculatedReturned += shipment.calculatedReturned || 0;
      totals.shipmentCalculatedPayments += shipment.shipmentCalculatedPayments || 0;
      totals.shipmentTotalExpenses += shipment.shipmentTotalExpenses || 0;
      totals.shipmentCalculatedExtraProfits += shipment.shipmentCalculatedExtraProfits || 0;
      totals.shipmentCalculatedLiraPayments += shipment.shipmentCalculatedLiraPayments || 0;
      totals.shipmentCalculatedUSDPayments += shipment.shipmentCalculatedUSDPayments || 0;
    });

    return totals;
  };

  const totals = calculateTotals(); // Calculate totals based on the current shipments
  const overall = totals.shipmentCalculatedPayments + totals.shipmentCalculatedExtraProfits - totals.shipmentTotalExpenses;

  return (
    <div className="shipments-container">

      <div className="shipments-list">
        <h2>Here are your shipment stats for today's shipment</h2>
        <ToastContainer position="top-right" autoClose={3000} />

        {isLoading ? (<SpinLoader />) : (
          <div className="totals">
            <div>Carried: {totals.carryingForDelivery}</div>
            <div>Delivered: {totals.calculatedDelivered}</div>
            <div>Returned: {totals.calculatedReturned}</div>
            <div>Lira {totals.shipmentCalculatedLiraPayments}</div>
            <div>$ {totals.shipmentCalculatedUSDPayments}</div>
            <div> Total in $: {totals.shipmentCalculatedPayments.toFixed(2)}</div>
            <div>Expenses $: {totals.shipmentTotalExpenses.toFixed(2)}</div>
            <div>Extra Profits $: {totals.shipmentCalculatedExtraProfits.toFixed(2)}</div>
            <div>Overall: {overall.toFixed(2)}</div>

          </div>
        )}
        <ul className='shipment-info-box'>
          {isLoading ? (
            <SpinLoader />) : (
            currentShipments.map((shipment) => (
              <li className='single-shipment-info' key={shipment._id}>
                <div className='shipment-info-field'>
                  <strong>Date:</strong> {shipment.date.day}/{shipment?.date.month}/{shipment.date.year}
                </div>
                <div className='shipment-info-field'>
                  <strong>Carried For Delivery:</strong> {shipment?.carryingForDelivery}
                </div>
                <div className='shipment-info-field'>
                  <strong>Delivered:</strong> {shipment?.calculatedDelivered}
                </div>
                <div className='shipment-info-field'>
                  <strong>Returned:</strong> {shipment?.calculatedReturned}
                </div>
                <div className='shipment-info-field'>
                  <strong> Lira Payments:</strong> {shipment?.shipmentCalculatedLiraPayments}
                </div>
                <div className='shipment-info-field'>
                  <strong>USD Payments:</strong> {shipment?.shipmentCalculatedUSDPayments}
                </div>
                <div className='shipment-info-field'>
                  <strong> Total Payments -usd and liras-  in usd :</strong> {shipment?.shipmentCalculatedPayments.toFixed(2)}
                </div>
                <div className='shipment-info-field'>
                  <strong>Total Expenses $: </strong> {shipment?.shipmentTotalExpenses.toFixed(2)}
                </div>
                <div className='shipment-info-field'>
                  <strong>Extra Profits $:</strong> {shipment?.shipmentCalculatedExtraProfits.toFixed(2)}
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

export default CurrentShipmentStat;

