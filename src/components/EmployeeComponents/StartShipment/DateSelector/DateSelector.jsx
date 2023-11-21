import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-selector.css';
const DateSelector = () => {
    const [selectedDate, setSelectedDate] = useState(null);
  
    const handleDateChange = (date) => {
      setSelectedDate(date);
    };
  
    const handleAddShipment = () => {
      // Get day name, month, day, and year from the selected date
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const month = selectedDate.toLocaleDateString('en-US', { month: 'long' });
      const day = selectedDate.getDate();
      const year = selectedDate.getFullYear();
  
      // Use the extracted values for further processing (e.g., save to state, send to API, etc.)
      // ...
      console.log(dayName, month, day, year);
    };
  
    return (
      <div className='date-selector'>
        <h2>Select a Date</h2>
        <DatePicker selected={selectedDate} onChange={handleDateChange} />
        <button className='save-button' onClick={handleAddShipment}>save</button>
      </div>
    );
  };
  
  export default DateSelector;
  