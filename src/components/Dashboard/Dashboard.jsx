// Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
const Dashboard = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <ul>
          <li>
            <Link to="/viewOrders">Bottles</Link>
          </li>          
          <li>
            <Link to="/recordOrder">Record Order</Link>
          </li>
          <li>
            <Link to="/days">Days</Link>
          </li>
          <li>
            <Link to="/areas">Areas</Link>
          </li>
          <li>
            <Link to="/customers">Customer</Link>
          </li>
        </ul>
      </aside>
      <main className="content">
        {/* Content for the selected model goes here */}
      </main>
    </div>
  );
};

export default Dashboard;
