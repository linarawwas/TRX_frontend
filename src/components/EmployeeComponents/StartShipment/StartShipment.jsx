import '../../Orders/RecordOrder/RecordOrder.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput.js'
import React, { useState } from 'react';
import DateSelector from './DateSelector/DateSelector.jsx';

const StartShipment = () => {
    const token = useSelector(state => state.user.token);
    const companyId = useSelector(state => state.user.companyId);
    const [shipmentData, setShipmentData] = useState({
    dayName: '', 
    day: null,
    month: null,
    year: null,
    companyId:companyId,
    carryingForDelivery:0
  }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the  token in the headers
        },
        body: JSON.stringify(shipmentData),
      });

      if (response.ok) {

        toast.success('Order successfully recorded.');
      } else {
        const shipmentData = await response.json(); // Parse the error response
        toast.error('Error recording order:', shipmentData.error); // Log the error message from the server
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
        <DateSelector/>
        
        <button className="record-order-button" type="submit">
          StartShipment
        </button>
      </form>
    </div>
  );
}

export default StartShipment;
