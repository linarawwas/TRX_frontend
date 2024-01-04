import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';
import './AddProfits.css'
import { setShipmentProfits } from '../../../redux/Shipment/action';
const AddProfits: React.FC = () => {
  const companyId = useSelector((state: any) => state.user.companyId);
  const shipmentId = useSelector((state: any) => state.shipment._id);
  const token = useSelector((state: any) => state.user.token);
  const [profits, setProfits] = useState({
    name: '',
    value: 0,
    paymentCurrency: '',
    exchangeRate: '6537789b6ed59ef09c18213d',
    companyId: companyId,
    shipmentId: shipmentId,
  });
  const dispatch = useDispatch();
  const shipmentProfits = useSelector((state: any) => state.shipment.profits)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfits({ ...profits, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/extraProfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the  token in the headers
        },
        body: JSON.stringify(profits),
      });

      if (response.ok) {
        toast.success('Profits successfully recorded.');
        dispatch(setShipmentProfits(shipmentProfits + profits.value))
      } else {
        const errorData = await response.json(); // Parse the error response
        toast.error('Error recording Profits:', errorData.error); // Log the error message from the server
      }
    } catch (error: any) {
      toast.error('Network error:', error);
    }
  };

  return (
    <div className="record-order-container add-profits-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="record-order-title">Add Profits</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={profits.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <SelectInput
          label="Payment Currency:"
          name="paymentCurrency"
          value={profits.paymentCurrency}
          options={[
            { value: '', label: 'Select Currency' },
            { value: 'USD', label: 'USD' },
            { value: 'LBP', label: 'LBP' },
          ]}
          onChange={handleChange}
        />
        <NumberInput
          label="Value:"
          name="value"
          value={profits.value}
          onChange={handleChange}
        />
        <button className="record-order-button" type="submit">
          Add profits
        </button>
      </form>
    </div>
  );
};

export default AddProfits;
