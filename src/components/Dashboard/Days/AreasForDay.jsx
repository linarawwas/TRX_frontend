import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams from react-router-dom

export default function AreasForDay({ match }) {
const { dayId } = useParams();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
const [dayName, setDayName]=useState('')
  useEffect(() => {
    // Fetch areas data for the specified day
    fetch(`http://localhost:5000/api/areas/${dayId}`)
      .then((response) => response.json())
      .then((data) => {
        setAreas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
      });
  }, [dayId]);
  useEffect(() => {
    // Fetch name of the the specified day
    fetch(`http://localhost:5000/api/days/${dayId}`)
      .then((response) => response.json())
      .then((data) => {
        setDayName(data.name);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
      });
  }, [dayId]);

  return (
    <div>
      <h2>Areas for {dayName}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {areas.map((area) => (
            <li key={area._id}>{area.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
