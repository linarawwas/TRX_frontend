
import React from 'react';
import './EmployeeLandingPage.css';
import { useSelector } from 'react-redux';
import '../../AdminPages/AdminLandingPage/LandingPage.css';
import FeatureSection from '../../../components/LandingPage/FeatureSection';
import { RootState } from '../../../redux/store';
const EmployeeLandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);
  return (
    <div className="employee-landing-page">
      <h1 className="welcome-message-employee"> Welcome to TRX, {name}</h1>
      <FeatureSection/>
    </div>
  );
};

export default EmployeeLandingPage;
