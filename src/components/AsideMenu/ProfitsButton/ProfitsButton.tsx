import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css';

const ProfitsButton: React.FC = () => {
  const profits: number = useSelector((state: any) => state.shipment.profits);

  return (
    <>
      <div className='go-to-home-button'>{profits}</div>
    </>
  );
};

export default ProfitsButton;
