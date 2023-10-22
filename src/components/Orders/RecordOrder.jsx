import React, { useState, useEffect } from 'react';
import './RecordOrder.css';

function RecordOrder() {
    const [orderData, setOrderData] = useState({
        delivered: '',
        returned: '',
        customerid: '',
        areaId: '', // Use a single state for the selected area
    });

    const [areas, setAreas] = useState([]);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        // Fetch areas from the endpoint (http://localhost:5000/api/areas)
        fetch('http://localhost:5000/api/areas')
            .then((response) => response.json())
            .then((data) => {
                setAreas(data);
            })
            .catch((error) => {
                console.error('Error fetching areas:', error);
            });
    }, []);

    useEffect(() => {
        // Fetch customers based on the selected area
        if (orderData.areaId) {
            fetch(`http://localhost:5000/api/customers/area/${orderData.areaId}`)
                .then((response) => response.json())
                .then((data) => {
                    setCustomers(data);
                })
                .catch((error) => {
                    console.error('Error fetching customers:', error);
                });
        }
    }, [orderData.areaId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrderData({ ...orderData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Send a POST request with the orderData to the specified route (http://localhost:5000/api/orders)
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
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
      <div className='record-order-container'>
        <h1 className='record-order-title'> Record an Order</h1>
<form className='record-order-form' onSubmit={handleSubmit}>
          <label className='order-label'>
            Delivered:
            <input
            className='order-input order-input-nested order-input-number'
              type="number"
              name="delivered"
              value={orderData.delivered}
              onChange={handleChange}
            />
          </label>
          <label className='order-label'>
            Returned:
            <input
                        className='order-input order-input-nested order-input-number '

              type="number"
              name="returned"
              value={orderData.returned}
              onChange={handleChange}
            />
          </label>
          <label  className='order-label'>
            Area:
            <select className='areaName order-select-element' name="areaId" value={orderData.areaId} onChange={handleChange}>
              <option className='areaName' value="">Select an area</option>
              {areas.map((area) => (
                <option className='areaName' key={area._id} value={area._id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>
          <label className='order-label'>
            Customer:
            <select name="customerid" className='order-select-element' value={orderData.customerid} onChange={handleChange}>
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
    
          <button className='record-order-button' type="submit">Record Order</button>
        </form>
      </div>
        
      );
    };
    
    export default RecordOrder;