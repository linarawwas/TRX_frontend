import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css';

const TargetButton: React.FC = () => {
  const target: string = useSelector((state: any) => state.shipment.target);

  return (
    <>
      <div className='go-to-home-button'>Target: 🎯 {target}</div>
    </>
  );
};

export default TargetButton;
