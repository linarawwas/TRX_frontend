import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Days/Days.css";

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch days data from your API
    fetch("http://localhost:5000/api/areas")
      .then((response) => response.json())
      .then((data) => {
        setAreas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching days:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="daysBody">
      <h2 className="daysTitle">Distribution Areas</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
          <table className="days-table">
            <thead>
              <tr>
                <th>Area</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area._id}>
                  <td>
                    <Link to={`/addresses/${area._id}`}>{area.name}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      )}
    </div>
  );
}
