// Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/bottles">Bottles</Link>
          </li>
          <li>
            <Link to="/days">Days</Link>
          </li>
          <li>
            <Link to="/area">Area</Link>
          </li>
          <li>
            <Link to="/customer">Customer</Link>
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
