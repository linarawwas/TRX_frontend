import React, { useState, useEffect } from 'react';
import './RecordOrder.css';
import SelectInput from '../../UI reusables/SelectInput/SelectInput';
import NumberInput from '../../UI reusables/NumberInput/NumberInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function RecordOrder(props) {
  const [orderData, setOrderData] = useState({
    delivered: 0,
    returned: 0,
    customerid: '',
    areaId: '',
    paid: 0,
    productId: '',
    paymentCurrency: '',
    exchangeRate: '6537789b6ed59ef09c18213d',companyId:props.companyId
  });

  const [exchangeRates, setExchangeRates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async (url, setData, errorMessage) => {
      try {
        const response = await fetch(url, { headers: { "Authorization": `Bearer ${props.token}` } });
        if (response.ok) {
          const data = await response.json();
          setData(data);
        } else {
          toast.error(errorMessage);
        }
      } catch (error) {
        toast.error('Network error:', error);
      }
    };

    // Fetch areas
    fetchData(`http://localhost:5000/api/areas/company/${props.companyId}`, setAreas, 'Error fetching areas');

    // Fetch exchange rates
    fetchData(`http://localhost:5000/api/exchangeRates/company/${props.companyId}`, setExchangeRates, 'Error fetching exchange rates');

    // Fetch products
    fetchData(`http://localhost:5000/api/products/company/${props.companyId}`, setProducts, 'Error fetching products');

    // Fetch customers only when areaId is selected
    if (orderData.areaId) {
      fetchData(`http://localhost:5000/api/customers/area/${orderData.areaId}`, setCustomers, 'Error fetching customers');
    } else {
      // Clear customers when areaId is not selected
      setCustomers([]);
    }
  }, [props.token, props.companyId, orderData.areaId]);

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
          'Authorization': `Bearer ${props.token}`, // Include the props.token in the headers
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {

        toast.success('Order successfully recorded.');
      } else {
        const errorData = await response.json(); // Parse the error response
        toast.error('Error recording order:', errorData.error); // Log the error message from the server
      }
    } catch (error) {
      toast.error('Network error:', error);
    }
  };

  return (
    <div className="record-order-container">
      <ToastContainer position="top-right" autoClose={3000} />
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
