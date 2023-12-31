import React from 'react';
import './LandingPage.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
const LandingPage: React.FC = () => {
  const name = useSelector((state: RootState) => state.user.username);
    return (
      <div className="landing-page">
        <div className="hero-section">
          <h1>Welcome to TRX, {name}</h1>
          <p>A powerful inventory management system</p>
        </div>
        <div className="feature-section">
          <h2>Key Features</h2>
          <ul>
            <li>Track your inventory effortlessly</li>
            <li>Real-time updates</li>
            <li>Advanced reporting and analytics</li>
          </ul>
        </div>
        <div className="footer">
          <p>&copy; 2023 TRX by Lina Rawas. All Rights Reserved.</p>
        </div>
      </div>
    );
  };
  
  export default LandingPage;
  
  