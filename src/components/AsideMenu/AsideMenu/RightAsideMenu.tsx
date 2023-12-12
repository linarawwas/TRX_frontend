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
      <button className="right-menu-toggle" onClick={toggleRightMenu}>
        {isRightMenuOpen ? <FaTimes /> : "📊"}
      </button>
      <div className='button-div'>
        <TargetButton />
        <DeliveredButton />
        <ReturnedButton />
        <PaidInDollars />
        <PaidInLira />
        <button className='go-to-home-button' onClick={handleGoHome}>🏁</button>
        <button className='go-to-home-button' onClick={handlePrevShipment}>↩️</button>
      </div>
    </aside>
  );
};

export default RightAsideMenu;
