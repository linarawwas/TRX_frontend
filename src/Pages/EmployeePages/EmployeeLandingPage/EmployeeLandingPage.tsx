import React from 'react';
import { useSelector } from 'react-redux';
import FeatureSection from '../../../components/LandingPage/FeatureSection';
import { RootState } from '../../../redux/store';
import './EmployeeLandingPage.css';

const EmployeeLandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);

  return (
    <div className="employee-landing-page" dir="rtl" style={{ textAlign: 'right' }}>
      <h1>مرحباً {name}</h1>
      <FeatureSection />
    </div>
  );
};

export default EmployeeLandingPage;