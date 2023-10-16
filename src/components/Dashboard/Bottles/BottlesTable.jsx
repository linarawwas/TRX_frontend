// BottlesTable.jsx
import React, { useState, useEffect } from 'react';
import './BottlesTable.css'; // Import your CSS file

const BottlesTable = () => {
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bottles data from your API
    fetch('http://localhost:5000/api/bottles')
      .then((response) => response.json())
      .then((data) => {
        setBottles(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching bottles:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className='bottlesBody'>
      <h2 className='bottlesTitle'>Customer Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="bottles-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Delivered</th>
              <th>Returned</th>
              <th>date of delivery</th>
            </tr>
          </thead>
          <tbody>
            {bottles.map((bottle) => (
              <tr key={bottle._id}>
                <td>{bottle.customerid.name}</td>
                <td>{bottle.delivered}</td>
                <td>{bottle.returned}</td>
                <td>{bottle.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BottlesTable;
