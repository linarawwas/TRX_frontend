import React, { useState } from 'react';
import './ShipmentsList.css';

import { useSelector, useDispatch } from 'react-redux';

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

const ShipmentsList: React.FC = () => {
  const dispatch = useDispatch();

  const token = useSelector((state: any) => state.user.token);
  const companyId = useSelector((state: any) => state.user.companyId);
  const [isLoading, setIsLoading] = useState(false);

  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [fromDate, setFromDate] = useState({ day: 12, month: 22, year: 2023 });
  const [toDate, setToDate] = useState({ day: 1, month: 10, year: 2023 });

  const fetchShipments = async () => {
    try {
      setIsLoading(true); // Set loading state to true before fetching

      const response = await fetch(`http://localhost:5000/api/shipments/range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromDate, toDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }

      const { shipments: fetchedShipments } = await response.json();
      setShipments(fetchedShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setIsLoading(false); // Set loading state to false after fetching (success or error)
    }
  };



  const handleFromDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFromDate({ ...fromDate, [name]: value });
  };

  const handleToDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setToDate({ ...toDate, [name]: value });
  };

  return (
    <div className="shipments-container">
      <div className="date-inputs">
        <label htmlFor="fromDate">From Date:</label>
        <input type="number" name="day" value={fromDate.day} onChange={handleFromDateChange} />
        <input type="number" name="month" value={fromDate.month} onChange={handleFromDateChange} />
        <input type="number" name="year" value={fromDate.year} onChange={handleFromDateChange} />

        <label htmlFor="toDate">To Date:</label>
        <input type="number" name="day" value={toDate.day} onChange={handleToDateChange} />
        <input type="number" name="month" value={toDate.month} onChange={handleToDateChange} />
        <input type="number" name="year" value={toDate.year} onChange={handleToDateChange} />

        <button onClick={fetchShipments}>Fetch Shipments</button>
      </div>

      <div className="shipments-list">
        <h2>Shipments List</h2>
        <ul>
          {isLoading ? (
            <div className="loader-container">
              <progress className="loader" max="100"></progress>
            </div>
          ) : (
            shipments.map((shipment) => (
              <li key={shipment._id}>
                <div>
                  <strong>Shipment ID:</strong> {shipment._id}
                </div>
                <div>
                  <strong>Company ID:</strong> {shipment.companyId}
                </div>
                <div>
                  <strong>Date:</strong> {shipment.date.day}/{shipment.date.month}/{shipment.date.year}
                </div>
                <div>
                  <strong>Carrying For Delivery:</strong> {shipment.carryingForDelivery}
                </div>
                <div>
                  <strong>Calculated Delivered:</strong> {shipment.calculatedDelivered}
                </div>
                <div>
                  <strong>Calculated Returned:</strong> {shipment.calculatedReturned}
                </div>
                <div>
                  <strong>Shipment Calculated Payments:</strong> {shipment.shipmentCalculatedPayments}
                </div>
                <div>
                  <strong>Shipment Total Expenses:</strong> {shipment.shipmentTotalExpenses}
                </div>
                <div>
                  <strong>Shipment Calculated Extra Profits:</strong> {shipment.shipmentCalculatedExtraProfits}
                </div>
                <div>
                  <strong>Shipment Calculated Lira Payments:</strong> {shipment.shipmentCalculatedLiraPayments}
                </div>
                <div>
                  <strong>Shipment Calculated USD Payments:</strong> {shipment.shipmentCalculatedUSDPayments}
                </div>
              </li>
            )))}
        </ul>
      </div>
    </div>
  );
};

export default ShipmentsList;