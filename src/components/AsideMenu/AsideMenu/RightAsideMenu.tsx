import React, { useState } from 'react';
import TargetButton from '../TargetButton/TargetButton';
import DeliveredButton from '../DeliveredButton/DeliveredButton';
import ReturnedButton from '../ReturnedButton/ReturnedButton';
import PaidInDollars from '../PaidInDollars/PaidInDollars';
import PaidInLira from '../PaidInLira/PaidInLira';
import { setShipmentFromPrev } from '../../../redux/Shipment/action';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import './RightAsideMenu.css';

const RightAsideMenu: React.FC = () => {
  const [isRightMenuOpen, setIsRightMenuOpen] = useState<boolean>(false);

  const toggleRightMenu = () => {
    setIsRightMenuOpen(!isRightMenuOpen);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePrevShipment = () => {
    dispatch(setShipmentFromPrev());
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <aside className={`right-aside-menu ${isRightMenuOpen ? 'open' : ''}`}>
      <div className='buttons-menu-employee right-menu-toggle'>
        <button className='right-buttons-employee' onClick={handleGoHome}>🏁</button>
        <button className='right-buttons-employee' onClick={handlePrevShipment}>↩️</button>
        <button className='right-buttons-employee' onClick={toggleRightMenu}>
          {isRightMenuOpen ? <FaTimes /> : "📊"}
        </button>
      </div>
      <div className='button-div'>
        <TargetButton />
        <DeliveredButton />
        <ReturnedButton />
        <PaidInDollars />
        <PaidInLira />
      </div>
    </aside>
  );
};

export default RightAsideMenu;
