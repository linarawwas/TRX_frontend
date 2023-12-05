import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './date-selector.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store'; // Import the RootState type from your Redux store
import {
  setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,
} from '../../../../redux/Shipment/action';

interface DateSelectorProps {
  updateShipmentData: (data: ShipmentData) => void;
}
// Define the ShipmentData type
interface ShipmentData {
  dayId: string;
  month: string;
  day: number;
  year: number;
}

const DateSelector: React.FC<DateSelectorProps> = ({ updateShipmentData }) => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const token = useSelector((state: RootState) => state.user.token);

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    try {
      const response = await fetch(`http://localhost:5000/api/days/name/${dayName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch day information');
      }

      const dayData = await response.json();
      if (dayData.length === 0) {
        throw new Error('Day information not found');
      }

      const dayId = dayData[0]._id;

      const shipmentData: ShipmentData = {
        dayId,
        month: `${month}`, // Convert month to a string with leading zero if needed
        day,
        year,
      };

      dispatch(setDayId(shipmentData.dayId));
      dispatch(setDateMonth(shipmentData.month));
      dispatch(setDateDay(shipmentData.day));
      dispatch(setDateYear(shipmentData.year));
      updateShipmentData(shipmentData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='date-selector'>
      <h2>Select a Date</h2>
      <DatePicker selected={selectedDate} onChange={handleDateChange} />
    </div>
  );
};

export default DateSelector;
