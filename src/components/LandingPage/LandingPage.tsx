import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import FeatureSection from './FeatureSection';
import SpinLoader from '../UI reusables/SpinLoader/SpinLoader';

const LandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 800); // Display the loader for 1 second

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array to run this effect only once when the component mounts

  return (
    <div className="landing-page">
      {showLoader ? (
        <SpinLoader /> // Render your SpinLoader component while showLoader is true
      ) : (
        <>
          <div className="hero-section">
            <h1>Welcome to TRX, {name}</h1>
            <p>A powerful inventory management system</p>
          </div>
          <FeatureSection />
        </>
      )}
    </div>
  );
};

export default LandingPage;
