import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu.css'
export const PaymentsButton = ()=>{
    const payments=useSelector(state=>state.shipment.payments)
return (
    <>
    <button className='go-to-home-button'>Payments: {payments}</button>
    </>
)
}