import React, { useState } from 'react';
import './EmployeeLandingPage.css';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../../redux/store'; // Import the RootState type from your Redux store
import { clearShipmentInfo } from '../../../redux/Shipment/action';
import FeatureSection from '../../LandingPage/FeatureSection';
import '../../LandingPage/LandingPage.css';
const EmployeeLandingPage: React.FC = () => {
  const dispatch = useDispatch();
  const name = useSelector((state: RootState) => state.user.username);
  return (
    <div className="employee-landing-page">
      <h1 className="welcome-message-employee"> Welcome to TRX, {name}</h1>
      <FeatureSection/>
    </div>
  );
};

export default EmployeeLandingPage;
