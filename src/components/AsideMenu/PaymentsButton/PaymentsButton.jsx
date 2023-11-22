import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu.css'
export const PaymentsButton = ()=>{
    const payments=useSelector(state=>state.shipment.payments)
return (
    <>
    <div className='go-to-home-button'>Payments: {payments}</div>
    </>
)
}