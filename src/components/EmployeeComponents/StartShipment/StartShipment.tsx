import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';
import DateSelector from './DateSelector/DateSelector';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure
import {
  setShipmentDelivered,
  setShipmentId,
  setShipmentPayments,
  setShipmentReturned,
  setShipmentTarget,
} from '../../../redux/Shipment/action';

const StartShipment: React.FC = () => {
  const dispatch = useDispatch();
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
      } else {
        toast.error('Error recording Shipment');
      }
    } catch (error:any) {
      toast.error('Network error:', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipmentData({ ...shipmentData, [name]: value });
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
        <DateSelector updateShipmentData={updateShipmentData} />
        <button className="record-order-button" type="submit">
          Start Shipment
        </button>
      </form>
    </div>
  );
};

export default StartShipment;
