import React from 'react';
import { useSelector } from 'react-redux';
import '../../AsideMenu.css';

const DeliveredButton: React.FC = () => {
  const delivered: string = useSelector((state: any) => state.shipment.delivered);

  return (
    <>
      <div className='go-to-home-button' style={{ textAlign: 'right' }}>
        تم التسليم: ➡️ {delivered}
      </div>
    </>
  );
  
};

export default DeliveredButton;
