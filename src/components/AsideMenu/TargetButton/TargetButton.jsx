import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu.css'
export const TargetButton = ()=>{
    const target=useSelector(state=>state.shipment.target)
return (
    <>
    <div className='go-to-home-button'>Target: {target}</div>
    </>
)
}