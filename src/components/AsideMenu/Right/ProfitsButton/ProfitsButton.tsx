import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../../AsideMenu.css';

const ProfitsButton: React.FC = () => {
  const profitsInLiras: number = useSelector((state: any) => state.shipment.profitsInLiras);
  const profitsInUSD: number = useSelector((state: any) => state.shipment.profitsInUSD);

  return (
    <>
      <div className='go-to-home-button'>{profitsInLiras}LBP</div>
      <div className='go-to-home-button'>{profitsInUSD}$</div>
    </>
  );
};

export default ProfitsButton;
