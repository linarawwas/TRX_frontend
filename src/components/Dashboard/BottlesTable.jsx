// BottlesTable.jsx
import React, { useState, useEffect } from 'react';

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
    <div>
      <h2>Bottles Table</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Needed</th>
              <th>Returned</th>
              <th>Customer ID</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {bottles.map((bottle) => (
              <tr key={bottle._id}>
                <td>{bottle._id}</td>
                <td>{bottle.needed}</td>
                <td>{bottle.returned}</td>
                <td>{bottle.customerid}</td>
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
