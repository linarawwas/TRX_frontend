import React from 'react';
import { useSelector } from 'react-redux';
import '../../AsideMenu.css';

const TargetButton: React.FC = () => {
  const target: string = useSelector((state: any) => state.shipment.target);

  return (
    <>
      <div className='go-to-home-button' style={{ textAlign: 'right' }}>
        الهدف: 🎯 {target}
      </div>
    </>
  );
  
};

export default TargetButton;
