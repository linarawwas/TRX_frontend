import React from 'react';
import './LandingPage.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import FeatureSection from './FeatureSection';
const LandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to TRX, {name}</h1>
        <p>A powerful inventory management system</p>
      </div>
      <FeatureSection />
    </div>
  );
};

export default LandingPage;

