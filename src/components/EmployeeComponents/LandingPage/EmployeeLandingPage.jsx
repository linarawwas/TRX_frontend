import React from 'react';
import './EmployeeLandingPage.css'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
function EmployeeLandingPage() {
    const name = useSelector(state => state.user.username)
    return (
        <div className="employee-landing-page">
            <h1 className= "welcome-message-employee"> Welcome! {name}, what do you want to do ? </h1>
            <Link to='/newShipment'>
                <button className='employee-button'>Start New Shipment</button>
            </Link>
        </div>
    );
}

export default EmployeeLandingPage;
