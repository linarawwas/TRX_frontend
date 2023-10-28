import $ from 'jquery';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AsideMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons from react-icons

function AsideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    // Add a click event listener to links with the class 'sidebar-link'
    $('.sidebar-link').on('click', () => {
      closeSidebar();
    });

    return () => {
      // Clean up the event listener when the component unmounts
      $('.sidebar-link').off('click');
    };
  }, []);
  const handleLogout = () => {
    // Delete the token from local storage
    localStorage.removeItem('token');

    // Refresh the browser to clear the token and potentially navigate to a login page
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const closeSidebar = () => {
    setIsMenuOpen(false);
  };
  return (<div>
            <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />} {/* Use icons for the toggle button */}
        </button>
        <Link to='/'>
        <button className='go-to-home-button' >Home</button>

        </Link>
        <div className={`dashboard ${isMenuOpen ? 'menu-open' : 'menu-closed'}`}>
      
      <aside className="sidebar">

        <ul>
          <li >
            <Link to="/viewOrders" className='sidebar-link'>Orders</Link>
          </li>
          <li>
            <Link to="/recordOrder" className='sidebar-link'>Record Order</Link>
          </li>
          <li>
            <Link to="/days" className='sidebar-link'>Days</Link>
          </li>
          <li>
            <Link to="/areas" className='sidebar-link'>Areas</Link>
          </li>
          <li>
            <Link to="/register" className='sidebar-link'>Register</Link>
          </li>
          <li>
            <Link to="/areas/add" className='sidebar-link'>Add Area</Link>
          </li>
          <li>
            <Link to="/customers" className='sidebar-link'>Customer</Link>
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
