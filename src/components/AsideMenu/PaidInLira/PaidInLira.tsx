import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css';

const PaidInLira: React.FC = () => {
  const paidInLira: number = useSelector((state: any) => state.shipment.liraPayments);

  return (
    <>
      <div className='go-to-home-button'>{paidInLira}LBP</div>
    </>
  );
};

export default PaidInLira;
