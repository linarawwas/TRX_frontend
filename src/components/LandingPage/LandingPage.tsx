import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import FeatureSection from './FeatureSection';
import SpinLoader from '../UI reusables/SpinLoader/SpinLoader';
import CurrentShipmentStats from './CurrentShipmentStats/CurrentShipmentStat';

const LandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);
  return (
    <div className="landing-page">

          <div className="hero-section">
            <h1>Welcome to TRX, {name}</h1>
            <p>A powerful inventory management system</p>
            <CurrentShipmentStats />
          </div>
    </div>
  );
};

export default LandingPage;
