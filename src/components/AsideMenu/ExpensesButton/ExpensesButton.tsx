import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css';

const ExpensesButton: React.FC = () => {
  const expenses: number = useSelector((state: any) => state.shipment.expenses);
console.log(expenses)
  return (
    <>
      <div className='go-to-home-button'>{expenses}</div>
    </>
  );
};

export default ExpensesButton;
