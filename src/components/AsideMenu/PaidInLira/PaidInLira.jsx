import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css'
export const PaidInLira = ()=>{
    const paidInLira=useSelector(state=>state.shipment.paidInLira)
return (
    <>
    <div className='go-to-home-button'>PaidInLira: {paidInLira}</div>
    </>
)
}