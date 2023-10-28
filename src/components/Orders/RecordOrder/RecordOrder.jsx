import React, { useState, useEffect } from 'react';
import './RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';

function RecordOrder() {
  const [orderData, setOrderData] = useState({
    delivered: 0,
    returned: 0,
    customerid: '',
    areaId: '',
    paid: 0,
    productId: '',
    paymentCurrency: '',
    exchangeRate: '',
  });

  const [exchangeRates, setExchangeRates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async (url, setData, errorMessage) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setData(data);
        } else {
          console.error(errorMessage);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    fetchData('http://localhost:5000/api/areas', setAreas, 'Error fetching areas');
    fetchData('http://localhost:5000/api/customers', setCustomers, 'Error fetching customers');
    fetchData('http://localhost:5000/api/exchangeRates', setExchangeRates, 'Error fetching exchange rates');
    fetchData('http://localhost:5000/api/products', setProducts, 'Error fetching products');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
  
      if (response.ok) {
        console.log('Order successfully recorded.');
      } else {
        const errorData = await response.json(); // Parse the error response
        console.error('Error recording order:', errorData.error); // Log the error message from the server
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  
  return (
    <div className="record-order-container">
      <h1 className="record-order-title">Record an Order</h1>
      <form className="record-order-form" onSubmit={handleSubmit}>
        <SelectInput
          label="Type of Order:"
          name="productId"
          value={orderData.productId}
          options={products.map((product) => ({ value: product.id, label: product.type }))}
          onChange={handleChange}
        />
        <SelectInput
          label="Payment Currency:"
          name="paymentCurrency"
          value={orderData.paymentCurrency}
          options={[
            { value: '', label: 'Select Currency' },
            { value: 'USD', label: 'USD' },
            { value: 'LBP', label: 'LBP' },
          ]}
          onChange={handleChange}
        />
        <SelectInput
          label="Exchange Rate:"
          name="exchangeRate"
          value={orderData.exchangeRate}
          options={exchangeRates.map((rate) => ({ value: rate._id, label: rate.exchangeRateInLBP }))}
          onChange={handleChange}
        />
        <NumberInput
          label="Delivered:"
          name="delivered"
          value={orderData.delivered}
          onChange={handleChange}
        />
        <NumberInput
          label="Returned:"
          name="returned"
          value={orderData.returned}
          onChange={handleChange}
        />
        <SelectInput
          label="Area:"
          name="areaId"
          value={orderData.areaId}
          options={areas.map((area) => ({ value: area._id, label: area.name }))}
          onChange={handleChange}
        />
        <SelectInput
          label="Customer:"
          name="customerid"
          value={orderData.customerid}
          options={customers.map((customer) => ({ value: customer._id, label: customer.name }))}
          onChange={handleChange}
        />
        <NumberInput
          label="Paid:"
          name="paid"
          value={orderData.paid}
          onChange={handleChange}
        />
        <button className="record-order-button" type="submit">
          Record Order
        </button>
      </form>
    </div>
  );
}

export default RecordOrder;
