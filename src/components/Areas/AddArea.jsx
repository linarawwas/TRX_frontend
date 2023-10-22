import React, { useState, useEffect } from 'react';
import './AddArea.css';

function AddArea() {
  const [name, setName] = useState('');
  const [dayId, setDayId] = useState('');
  const [days, setDays] = useState([]);

  // Fetch the list of days from your API
  useEffect(() => {
    fetch('http://localhost:5000/api/days')
      .then((response) => response.json())
      .then((data) => {
        setDays(data);
      })
      .catch((error) => {
        console.error('Error fetching days:', error);
      });
  }, []);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleDayChange = (e) => {
    setDayId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create an object with the area details
    const newArea = {
      name,
      dayId,
    };

    try {
      // Send a POST request to your create area endpoint
      const response = await fetch('http://localhost:5000/api/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArea),
      });

      if (response.ok) {
        // Area creation succeeded
        console.log('Area created successfully');
        // Optionally, you can redirect to a different page after creation
      } else {
        // Area creation failed; handle the error
        console.error('Area creation failed');
      }
    } catch (error) {
      console.error('Area creation error:', error);
    }
  };

  return (
    <div className="add-area-container">
      <h2 className='add-area-title'>Add New Area</h2>
      <form className='add-area-form' onSubmit={handleSubmit}>
        <div className="add-area-input-group">
          <label htmlFor="name" className="add-area-input-label">Area Name:</label>
          <input
            className='area-name-input add-area-input-field'
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="add-area-input-group">
          <label htmlFor="day" className="add-area-input-label">Select a Day:</label>
          <select
            id="day"
            name="dayId"
            value={dayId}
            onChange={handleDayChange}
            required
            className="add-area-input-field"
          >
            <option value="">Select a Day</option>
            {days.map((day) => (
              <option key={day._id} value={day._id}>
                {day.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="add-area-submit-button">Add Area</button>
      </form>
    </div>
  );
}

export default AddArea;
