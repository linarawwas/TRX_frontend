import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AsideMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { clearCompanyId, clearToken, clearIsAdmin } from '../../../redux/UserInfo/action';
import { TargetButton } from '../TargetButton/TargetButton';
import { DeliveredButton } from '../DeliveredButton/DeliveredButton';
import { ReturnedButton } from '../ReturnedButton/ReturnedButton';
import { PaidInDollars } from '../PaidInDollars/PaidInDollars';
import { PaidInLira } from '../PaidInLira/PaidInLira';
function AsideMenuEmployee() {
  const shipmentId = useSelector(state => state.shipment._id)
  const shipmentDefined = shipmentId !== null && shipmentId !== undefined && shipmentId !== '';
  const dispatch = useDispatch();
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
          <TargetButton />
          <DeliveredButton />
          <ReturnedButton />
          <PaidInDollars />
          <PaidInLira />
          <Link to='/'>
            <div className='go-to-home-button .home-btn'>🏁 </div>
          </Link>
        </div>

        <aside className="sidebar">
          <ul>
            {shipmentDefined ? (<li>
              <Link to={`/areas/${dayId}`} className='sidebar-link' onClick={toggleMenu}>Delivery Pathway</Link>
            </li>
            ) : (<li>Please Start Shipment </li>)}
            <li>
              <Link to="/addExpenses" className='sidebar-link' onClick={toggleMenu}>Add Expenses</Link>
            </li>
            <li>
              <Link to="/addProfits" className='sidebar-link' onClick={toggleMenu}>Add Profits</Link>
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

export default AsideMenuEmployee;
