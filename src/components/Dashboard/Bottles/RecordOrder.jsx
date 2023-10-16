import React, { useState } from 'react';
import './RecordOrder.css';
const RecordOrder = () => {
    const [orderData, setOrderData] = useState({
        delivered: '',
        returned: '',
        customerid: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrderData({ ...orderData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Send a POST request with the orderData to the specified route (http://localhost:5000/api/bottles)
        try {
            const response = await fetch('http://localhost:5000/api/bottles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                // Handle a successful response, e.g., display a success message
                console.log('Order successfully recorded.');
            } else {
                // Handle errors if the request is not successful
                console.error('Error recording order.');
            }
        } catch (error) {
            // Handle network errors
            console.error('Network error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Delivered:
                <input
                    type="number"
                    name="delivered"
                    value={orderData.delivered}
                    onChange={handleChange}
                />
            </label>
            <label>
                Returned:
                <input
                    type="number"
                    name="returned"
                    value={orderData.returned}
                    onChange={handleChange}
                />
            </label>
            <label className='customerID'
            >
                Customer ID:
                <input
                    type="text"
                    name="customerid"
                    value={orderData.customerid}
                    onChange={handleChange}
                />
            </label>
            <button type="submit">Record Order</button>
        </form>
    );
};

export default RecordOrder;
