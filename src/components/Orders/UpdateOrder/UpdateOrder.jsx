import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './UpdateOrder.css'; // Import your CSS file for this component

function UpdateOrder() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <h1 className="update-order-title">Update Order</h1>
      {loading ? (
        <p>Loading...</p>
      ) : orderData ? (
        <div>
          <h2>Order Details</h2>
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
        </div>
      ) : (
        <p>Order not found</p>
      )}
    </div>
  );
}

export default UpdateOrder;
