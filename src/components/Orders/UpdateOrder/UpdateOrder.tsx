import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css'
import '../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import './UpdateOrder.css'
import SpinLoader from '../../UI reusables/SpinLoader/SpinLoader';
interface PaymentData {
  paymentAmount: string;
  paymentCurrency: string;
  exchangeRateId: string;
}

function UpdateOrder(): JSX.Element {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();

  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentAmount: '',
    paymentCurrency: '',
    exchangeRateId: '6537789b6ed59ef09c18213d',
  });

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  const handleDeleteOrder = async (): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Order deleted successfully');
        setTimeout(() => {
          navigate('/viewOrders');
        }, 1500);
      } else {
        toast.error('Error deleting order');
        console.error('Error deleting order');
      }
    } catch (error) {
      toast.error('Error deleting order');
      console.error('Error deleting order:', error);
    }
  };
  const handleAddPayment = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {


    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/orders/addPayment/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', Authorization: `Bearer ${ token}`,

        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        toast.success('Payment added successfully');

        // Payment added successfully, fetch the updated order data
        const updatedOrderResponse = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers:
          {
            Authorization: `Bearer ${ token}`,

          }
        });
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
    fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json', Authorization: `Bearer ${ token}`,

      }
    })
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order details:', error);
        setLoading(false);
      });
  }, [orderId,  token]);

  return (
    <div className="update-container">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className='update-header'>
        <h1 className="update-title">Billing Information:</h1>
        <button
          type="button"
          onClick={handleDeleteOrder}
          className="delete-button"
        >          Delete Order
        </button>
      </div>

      {loading ? (
        <SpinLoader/> 
      ) : orderData ? (
        <div>
          <table className="details-table bill-table">
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
                  <option value="LBP">choose currency</option>
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