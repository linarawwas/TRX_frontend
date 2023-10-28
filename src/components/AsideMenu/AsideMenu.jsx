import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AsideMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AsideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    toast.success('Logged Out Successfully')
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
         <div className='aside-Menu'>
         <ToastContainer position="top-right" autoClose={3000}  />

 <div className='button-div'>
        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <Link to='/'>
          <button className='go-to-home-button'>Home</button>
        </Link>
      </div>

      <aside className="sidebar">
        <ul>
          <li>
            <Link to="/viewOrders" className='sidebar-link' onClick={toggleMenu} >Orders</Link>
          </li>
          <li>
            <Link to="/recordOrder" className='sidebar-link' onClick={toggleMenu}>Record Order</Link>
          </li>
          <li>
            <Link to="/days" className='sidebar-link' onClick={toggleMenu}>Days</Link>
          </li>
          <li>
            <Link to="/areas" className='sidebar-link' onClick={toggleMenu}>Areas</Link>
          </li>
          <li>
            <Link to="/register" className='sidebar-link' onClick={toggleMenu}>Register</Link>
          </li>
          <li>
            <Link to="/areas/add" className='sidebar-link' onClick={toggleMenu}>Add Area</Link>
          </li>
          <li>
            <Link to="/customers" className='sidebar-link' onClick={toggleMenu}>Customer</Link>
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
