import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-selector.css';
import { useDispatch, useSelector } from 'react-redux';
import { setDateDay, setDateMonth, setDateYear, setDayId } from '../../../../redux/Shipment/action';
const DateSelector = ({ updateShipmentData }) => {

  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const token = useSelector(state => state.user.token);
  const handleDateChange = async (date) => {
    setSelectedDate(date);

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(dayName)
    const month = date.getMonth() + 1; // Months are zero-indexed, so add 1
    console.log(month)
    const day = date.getDate();
    console.log(day)
    const year = date.getFullYear();
    console.log(year)

    // Fetching dayId based on dayName
    const response = await fetch(`http://localhost:5000/api/days/name/${dayName}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch day information');
    }

    const dayData = await response.json();
    if (dayData.length === 0) {
      throw new Error('Day information not found');
    }

    const dayId = dayData[0]._id;
    console.log(dayId)
    // Creating shipment data
    const shipmentData = {
      dayId,
      month: `${month}`, // Convert month to a string with leading zero if needed
      day,
      year,
    };
    dispatch(setDayId(shipmentData.dayId))
    dispatch(setDateMonth(shipmentData.month))
    dispatch(setDateDay(shipmentData.day))
    dispatch(setDateYear(shipmentData.year))
    updateShipmentData(shipmentData);

  };

  return (
    <div className='date-selector'>
      <h2>Select a Date</h2>
      <DatePicker selected={selectedDate} onChange={handleDateChange} />
    </div>
  );
};

export default DateSelector;