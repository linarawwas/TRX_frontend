import React, { useState } from 'react';
import '../../Orders/RecordOrder/RecordOrder.css'
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import NumberInput from '../../UI reusables/NumberInput/NumberInput.js'
const AddExpenses = () => {
    const companyId = useSelector(state => state.user.companyId);
    const shipmentId = useSelector(state => state.shipment._id);
    const token = useSelector(state => state.user.token);
    const [expenses, setExpenses] = useState({
        type: "expenses", 
        name: '', 
        value: null, 
        paymentCurrency: '',
        exchangeRate: '6537789b6ed59ef09c18213d',
        companyId: companyId,
        shipmentId: shipmentId

    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpenses({ ...expenses, [name]: value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/nonDeliveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include the  token in the headers
                },
                body: JSON.stringify(expenses),
            });

            if (response.ok) {
                toast.success('Expenses successfully recorded.');
            } else {
                const errorData = await response.json(); // Parse the error response
                toast.error('Error recording Expenses:', errorData.error); // Log the error message from the server
            }
        } catch (error) {
            toast.error('Network error:', error);
        }
    };

    return (
        <div className="record-order-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="record-order-title">Add Expenses</h1>
            <form className="record-order-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                value={expenses.name}
                placeholder="Name"
                onChange={handleChange}
              ></input>
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
}

export default AddExpenses;
