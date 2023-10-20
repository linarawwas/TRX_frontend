import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleLogout = () => {
    // Delete the token from local storage
    localStorage.removeItem('token');

    // Refresh the browser to clear the token and potentially navigate to a login page
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`dashboard ${isMenuOpen ? 'menu-open' : 'menu-closed'}`}>
      <aside className="sidebar">
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? 'Close Menu' : 'Open Menu'}
        </button>
        <ul>
          <li>
            <Link to="/viewOrders">Orders</Link>
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
            <Link to="/areas/add">Add Area</Link>
          </li>
          <li>
            <Link to="/customers">Customer</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
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
