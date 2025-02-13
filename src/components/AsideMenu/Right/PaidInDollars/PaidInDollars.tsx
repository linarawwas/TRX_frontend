import React from 'react';
import { useSelector } from 'react-redux';
import '../../AsideMenu.css';

const PaidInDollars: React.FC = () => {
  const paidInDollars: number = useSelector((state: any) => state.shipment.dollarPayments);

  return (
    <>
      <div className='go-to-home-button'>{paidInDollars}$</div>
    </>
  );
};

export default PaidInDollars;
