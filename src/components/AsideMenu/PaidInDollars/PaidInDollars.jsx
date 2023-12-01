import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css'
export const PaidInDollars = ()=>{
    const paidInDollars=useSelector(state=>state.shipment.dollarPayments)
return (
    <>
    <div className='go-to-home-button'> {paidInDollars}$</div>
    </>
)
}