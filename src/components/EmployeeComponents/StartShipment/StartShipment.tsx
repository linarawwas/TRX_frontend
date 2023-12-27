import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure
import {
  setShipmentDelivered,
  setShipmentId,
  setShipmentPayments,
  setShipmentReturned,
  setShipmentTarget, setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,
} from '../../../redux/Shipment/action';
import { useNavigate } from 'react-router-dom';

const StartShipment: React.FC = () => {
  interface ShipmentData {
    dayId: string;
    month: string;
    day: number;
    year: number;
  }
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.user.token);
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const [shipmentData, setShipmentData] = useState({
    dayId: '',
    day: null,
    month: null,
    year: null,
    companyId: '',
    carryingForDelivery: 0,
  });

  const updateShipmentData = (data: any) => {
    setShipmentData({
      ...shipmentData,
      companyId: companyId,
      dayId: data.dayId,
      day: data.day,
      month: data.month,
      year: data.year,
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipmentData({ ...shipmentData, [name]: value });
  };
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  useEffect(() => {
    // Fetch and set the initial data when the component mounts
    const initializeDate = async () => {
      try {
        // Get the current date
        const currentDate = new Date();
        setSelectedDate(currentDate);

        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();

        // Perform your API request and dispatch actions here based on the current date
        const response = await fetch(`http://localhost:5000/api/days/name/${dayName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch day information');
        }

        const dayData = await response.json();
        if (dayData.length === 0) {
          throw new Error('Day information not found');
        }

        const dayId = dayData[0]._id;

        const shipmentData: ShipmentData = {
          dayId,
          month: `${month}`, // Convert month to a string with leading zero if needed
          day,
          year,
        };

        dispatch(setDayId(shipmentData.dayId));
        dispatch(setDateMonth(shipmentData.month));
        dispatch(setDateDay(shipmentData.day));
        dispatch(setDateYear(shipmentData.year));
        updateShipmentData(shipmentData);

      } catch (error) {
        console.error('Error:', error);
      }
    };

    initializeDate();
  }, [dispatch, token]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shipmentData),
      });

      if (response.ok) {

        const shipmentDataResponse = await response.json();
        dispatch(setShipmentId(shipmentDataResponse._id));
        dispatch(setShipmentDelivered(shipmentDataResponse.calculatedDelivered));
        dispatch(setShipmentReturned(shipmentDataResponse.calculatedReturned));
        dispatch(setShipmentPayments(shipmentDataResponse.shipmentCalculatedPayments));
        dispatch(setShipmentTarget(shipmentDataResponse.carryingForDelivery));
        toast.success('Shipment successfully recorded.');
        const dayId = shipmentData.dayId
        navigate(`/areas/${dayId}`)
      } else {
        toast.error('Error recording Shipment');
      }
    } catch (error: any) {
      toast.error('Network error:', error);
    }
  };
  return (
    <div className="record-order-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="record-order-title">Enter Shipment Info</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <NumberInput
          label="Carrying For Delivery:"
          name="carryingForDelivery"
          value={shipmentData.carryingForDelivery}
          onChange={handleChange}
        />
        {/* <DateSelector updateShipmentData={updateShipmentData} /> */}
        <button className="record-order-button" type="submit">
          Start Shipment
        </button>
      </form>
    </div>
  );
};

export default StartShipment;
