import React from 'react';
import { useSelector } from 'react-redux';
import '../../AsideMenu.css';

const ReturnedButton: React.FC = () => {
  const returned: string = useSelector((state: any) => state.shipment.returned);

  return (
    <>
      <div className='go-to-home-button'>Returned: ⬅️ {returned}</div>
    </>
  );
};

export default ReturnedButton;
