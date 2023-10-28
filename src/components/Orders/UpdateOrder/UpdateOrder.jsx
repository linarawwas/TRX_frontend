import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './UpdateOrder.css'; // Import your CSS file for this component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function UpdateOrder() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  // State to hold payment data
  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',
    paymentCurrency: '', // Default currency, you can change this as needed
    exchangeRateId: '6537789b6ed59ef09c18213d', // Default exchange rate, change as needed
  });
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };
  const handleDeleteOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Order deleted successfully');

        // Handle success (e.g., redirect to another page)
        console.log('Order deleted successfully');
      } else {
        toast.error('Error deleting order');

        // Handle errors here
        console.error('Error deleting order');
      }
    } catch (error) {
      toast.error('Error deleting order');

      console.error('Error deleting order:', error);
    }
  };

  const handleAddPayment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/addPayment/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        toast.success('Payment added successfully');

        // Payment added successfully, fetch the updated order data
        const updatedOrderResponse = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (updatedOrderResponse.ok) {
          const updatedOrderData = await updatedOrderResponse.json();
          setOrderData(updatedOrderData);
          console.log('Payment added successfully');
        } else {
          toast.error('Error fetching updated order data');

          // Handle errors when fetching the updated order data
          console.error('Error fetching updated order data');
        }
      } else {
        toast.error('Error adding payment');

        // Handle errors here
        console.error('Error adding payment');
      }
    } catch (error) {
      toast.error('Error adding payment');

      console.error('Error adding payment:', error);
    }
  };
  useEffect(() => {
    // Fetch the order details based on orderId
    fetch(`http://localhost:5000/api/orders/${orderId}`)
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order details:', error);
        setLoading(false);
      });
  }, [orderId]);

  return (
    <div className="update-order-container">
      <ToastContainer position="top-right" autoClose={3000}  />

      <div className='update-order-header'>
      <h1 className="update-order-title">Billing Information:</h1>
      <button
        type="button"
        onClick={handleDeleteOrder}
        className="delete-button"
      >
        <FontAwesomeIcon icon={faTrash} />
        Delete Order
      </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orderData ? (
        <div>
          <table className="order-details-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(orderData).map(([key, value]) => (
                <tr key={key}>
                  <td className="field-name">{key}</td>
                  <td className="field-value">{JSON.stringify(value, null, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="payment-form">
            <h2 className="payment-heading">Add Payment</h2>
            <form>
              <div className="form-group">
                <label htmlFor="paymentAmount" className="form-label">
                  Payment Amount
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  name="paymentAmount"
                  value={paymentData.paymentAmount}
                  onChange={handlePaymentChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentCurrency" className="form-label">
                  Payment Currency
                </label>
                <select
                  id="paymentCurrency"
                  name="paymentCurrency"
                  value={paymentData.paymentCurrency}
                  onChange={handlePaymentChange}
                  className="form-input"
                >
                  <option value="LBP">LBP</option>
                  <option value="USD">USD</option>
                  {/* Add other currency options as needed */}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="exchangeRateId" className="form-label">
                  Exchange Rate ID
                </label>
                <input
                  type="text"
                  id="exchangeRateId"
                  name="exchangeRateId"
                  value={paymentData.exchangeRateId}
                  onChange={handlePaymentChange}
                  className="form-input"
                />
              </div>


              <button type="button" onClick={handleAddPayment} className="add-payment-button">
                Add Payment
              </button>
            </form>
          </div>

        </div>
      ) : (
        <p>Order not found</p>
      )}

    </div>
  );
}

export default UpdateOrder;