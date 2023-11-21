import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AsideMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { clearCompanyId, clearToken, clearIsAdmin } from '../../redux/UserInfo/action';
import { TargetButton } from './TargetButton/TargetButton';
import { DeliveredButton } from './DeliveredButton/DeliveredButton';

function AsideMenu() {
  const dispatch = useDispatch();
  const isAdmin = useSelector(state => state.user.isAdmin);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dayId = useSelector(state => state.shipment.dayId);
  const handleLogout = () => {
    toast.success('Logged Out Successfully')
    // Delete the token from local storage
    localStorage.removeItem('token');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    // Dispatch actions to clear token and companyId in the Redux store
    dispatch(clearToken());
    dispatch(clearCompanyId());
    dispatch(clearIsAdmin());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`dashboard ${isMenuOpen ? 'menu-open' : 'menu-closed'}`}>
      <div className='aside-Menu'>
        <ToastContainer position="top-right" autoClose={1000} />

        <div className='button-div'>
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <Link to='/'>
            <button className='go-to-home-button'>Home</button>
          </Link>
          <TargetButton />
 <DeliveredButton />
        </div>

        <aside className="sidebar">
          <ul>
            <li>
              <Link to={`/areas/${dayId}`} className='sidebar-link' onClick={toggleMenu}>Delivery Pathway</Link>
            </li>
            {isAdmin && (
              <>
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
                  <Link to="/viewOrders" className='sidebar-link' onClick={toggleMenu} >Orders</Link>
                </li> </>
            )}
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
