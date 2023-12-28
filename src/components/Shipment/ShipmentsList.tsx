import React, { useState } from 'react';
import './ShipmentsList.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import SpinLoader from '../UI reusables/SpinLoader/SpinLoader';

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

const ShipmentsList: React.FC = () => {
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
  const [shipmentsPerPage] = useState(3);

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
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  return (
    <div className="shipments-container">

      <div className="shipments-list">
        <h2>Shipments List</h2>
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
            placeholderText="Select From Date"
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
            placeholderText="Select To Date"
          />
          <button onClick={fetchShipments}>Fetch Shipments</button>
        </div>
        <ul>
          {isLoading ? (
            <SpinLoader />) : (
            currentShipments.map((shipment) => (
              <li key={shipment._id}>
                <div>
                  <strong>Date:</strong> {shipment.date.day}/{shipment?.date.month}/{shipment.date.year}
                </div>
                <div>
                  <strong>Carrying For Delivery:</strong> {shipment?.carryingForDelivery}
                </div>
                <div>
                  <strong>Calculated Delivered:</strong> {shipment?.calculatedDelivered}
                </div>
                <div>
                  <strong>Calculated Returned:</strong> {shipment?.calculatedReturned}
                </div>
                <div>
                  <strong>Shipment Calculated Lira Payments:</strong> {shipment?.shipmentCalculatedLiraPayments}
                </div>
                <div>
                  <strong>Shipment Calculated USD Payments:</strong> {shipment?.shipmentCalculatedUSDPayments}
                </div>
                <div>
                  <strong>Shipment Total Payments -usd and liras-  in usd :</strong> {shipment?.shipmentCalculatedPayments}
                </div>
                <div>
                  <strong>Shipment Total Expenses:</strong> {shipment?.shipmentTotalExpenses}
                </div>
                <div>
                  <strong>Shipment Calculated Extra Profits:</strong> {shipment?.shipmentCalculatedExtraProfits}
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

