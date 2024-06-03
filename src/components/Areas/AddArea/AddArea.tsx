import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './AddArea.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

interface Day {
  _id: string;
  name: string;
}

function AddArea(): JSX.Element {
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const [name, setName] = useState<string>('');
  const [dayId, setDayId] = useState<string>('');
  const [days, setDays] = useState<Day[]>([]);

  // Fetch the list of days from your API
  useEffect(() => {
    fetch(`http://localhost:5000/api/days`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((response) => response.json())
      .then((data: Day[]) => {
        setDays(data);
      })
      .catch((error) => {
        toast.error('Error fetching days:', error);
      });
  }, [token, companyId]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDayId(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create an object with the area details
    const newArea = {
      name,
      dayId,
      companyId,
    };

    try {
      // Send a POST request to your create area endpoint
      const response = await fetch('http://localhost:5000/api/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newArea),
      });

      if (response.ok) {
        // Area creation succeeded
        toast.success('Area created successfully');
        // Optionally, you can redirect to a different page after creation
      } else {
        // Area creation failed; handle the error
        toast.error('Area creation failed');
      }
    } catch (error:any) {
      toast.error('Area creation error:', error);
    }
  };

  return (
    <div className="add-area-container">
      <ToastContainer position="top-right" autoClose={1000} />

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
