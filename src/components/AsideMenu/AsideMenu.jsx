import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AsideMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons from react-icons

function AsideMenu() {
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

  return (<div>
            <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />} {/* Use icons for the toggle button */}
        </button>
        <div className={`dashboard ${isMenuOpen ? 'menu-open' : 'menu-closed'}`}>
      
      <aside className="sidebar">

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
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/areas/add">Add Area</Link>
          </li>
          <li>
            <Link to="/customers">Customer</Link>
          </li>
          <li>
            <button className='logout-button' onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </aside>
    </div>
  </div>
   
  );
}

export default AsideMenu;
