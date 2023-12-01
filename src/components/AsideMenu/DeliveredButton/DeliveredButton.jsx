import React from 'react';
import { useSelector } from 'react-redux';
import '../AsideMenu/AsideMenu.css'
export const DeliveredButton = () => {
    const delivered = useSelector(state => state.shipment.delivered)
    return (
        <>
            <div className='go-to-home-button'>➡️ {delivered}</div>
        </>
    )
}