import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css';

const ExpensesButton: React.FC = () => {
  const expensesInLiras: number = useSelector((state: any) => state.shipment.expensesInLiras);
  const expensesInUSD: number = useSelector((state: any) => state.shipment.expensesInUSD);

  return (
    <>
      <div className='go-to-home-button'>{expensesInLiras}LBP</div>
      <div className='go-to-home-button'>{expensesInUSD}$</div>
    </>
  );
};

export default ExpensesButton;
