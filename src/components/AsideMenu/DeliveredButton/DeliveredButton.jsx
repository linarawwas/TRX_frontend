import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu.css'
export const DeliveredButton = ()=>{
    const delivered=useSelector(state=>state.shipment.delivered)
return (
    <>
    <button className='go-to-home-button'>Delivered: {delivered}</button>
    </>
)
}