import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';
import { RootState } from '../../../redux/store'; // Update this path with your Redux store structure
import './AddExpenses.css'
import { setShipmentExpensesInLiras, setShipmentExpensesInUSD } from '../../../redux/Shipment/action';
const AddExpenses: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);
  const [expenses, setExpenses] = useState({
    name: '',
    value: 0,
    paymentCurrency: '',
    exchangeRate: '6537789b6ed59ef09c18213d',
    companyId: companyId,
    shipmentId: shipmentId,
  });
  const dispatch = useDispatch();
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpenses({ ...expenses, [name]: value });
  };
  const shipmentExpensesInLiras = useSelector((state: any) => state.shipment.expensesInLiras)
  const shipmentExpensesInUSD = useSelector((state: any) => state.shipment.expensesInUSD)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenses),
      });

      if (response.ok) {

        toast.success('Expenses successfully recorded.');
        if (expenses.paymentCurrency === 'USD') {
          dispatch(setShipmentExpensesInUSD(parseInt(shipmentExpensesInUSD) + parseInt(expenses.value)))
        } else {
          dispatch(setShipmentExpensesInLiras(parseInt(shipmentExpensesInLiras) + parseInt(expenses.value)))
        }
      } else {
        const errorData = await response.json();
        toast.error('Error recording Expenses:', errorData.error);
      }
    } catch (error: any) {
      toast.error('Network error:', error);
    }
  };

  return (
    <div className="record-order-container add-expenses-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="record-order-title">Add Expenses</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={expenses.name}
          placeholder="Name"
          onChange={handleChange}
        />
        <SelectInput
          label="Payment Currency:"
          name="paymentCurrency"
          value={expenses.paymentCurrency}
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
          value={expenses.value}
          onChange={handleChange}
        />
        <button className="record-order-button" type="submit">
          Add expenses
        </button>
      </form>
    </div>
  );
};

export default AddExpenses;
