import '../../Orders/RecordOrder/RecordOrder.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput.js'
import React, { useState } from 'react';
import DateSelector from './DateSelector/DateSelector.jsx';
import { setShipmentId, setShipmentTarget } from '../../../redux/Shipment/action.js';

const StartShipment = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.user.token);
  const companyId = useSelector(state => state.user.companyId);
  const [shipmentData, setShipmentData] = useState({
    dayId: '',
    day: null,
    month: null,
    year: null,
    companyId: '',
    carryingForDelivery: 0
  }
  );

  // Function to update shipmentData with data from DateSelector
  const updateShipmentData = (data) => {
    setShipmentData({
      ...shipmentData,
      companyId: companyId,
      dayId: data.dayId,
      day: data.day,
      month: data.month,
      year: data.year
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shipmentData),
      });

      if (response.ok) {
        const shipmentData = await response.json();
        dispatch(setShipmentId(shipmentData._id))
        dispatch(setShipmentTarget(shipmentData.carryingForDelivery))
        toast.success('Shipment successfully recorded.');
      } else {

        toast.error('Error recording Shipment');
      }
    } catch (error) {
      toast.error('Network error:', error);
    }
  };
  const handleChange = (e) => {
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
          StartShipment
        </button>
      </form>
    </div>
  );
}

export default StartShipment;