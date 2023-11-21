import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu.css'
export const ReturnedButton = ()=>{
    const returned=useSelector(state=>state.shipment.returned)
return (
    <>
    <button className='go-to-home-button'>Returned: {returned}</button>
    </>
)
}