import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Days.css";

export default function Days() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch days data from your API
    fetch("http://localhost:5000/api/days")
      .then((response) => response.json())
      .then((data) => {
        setDays(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching days:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="daysBody">
      <h2 className="daysTitle">Customer Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
          <table className="days-table">
            <thead>
              <tr>
                <th>Day</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day._id}>
                  <td>
                    <Link to={`/areas/${day._id}`}>{day.name}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      )}
    </div>
  );
}
