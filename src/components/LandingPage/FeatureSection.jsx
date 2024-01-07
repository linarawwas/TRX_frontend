
import { useState } from 'react';
import './LandingPage.css';
import AddProfits from '../Profits/AddProfits/AddProfits';
import AddExpenses from '../Expenses/AddExpenses/AddExpenses';
import { useDispatch } from 'react-redux';
import { clearShipmentInfo } from '../../redux/Shipment/action';
import { Link } from 'react-router-dom';
import StartShipment from '../EmployeeComponents/StartShipment/StartShipment';
import { FaTimes } from 'react-icons/fa';
const FeatureSection = () => {
    const dispatch = useDispatch();
    const [showProfitsForm, setShowProfitsForm] = useState(false)
    const [showExpensesForm, setShowExpensesForm] = useState(false)
    const [showShipmentForm, setShowShipmentForm] = useState(false)
    return (
        <>
            <div className="feature-section">
                <h2>Key Features</h2>
                <ul>
                    <li className='show-form-li' onClick={() => { setShowShipmentForm(!showShipmentForm) }}>{showShipmentForm ? <FaTimes /> : "Start a new shipment"}</li>
                    <li className='show-form-li' onClick={() => { setShowProfitsForm(!showProfitsForm) }}>{showProfitsForm ? <FaTimes /> : "Add Extra Profits"}</li>
                    <li className='show-form-li' onClick={() => { setShowExpensesForm(!showExpensesForm) }}>{showExpensesForm ? <FaTimes /> : "Add Expenses"}</li>
                </ul>
            </div>
            {showProfitsForm && <AddProfits />}
            {showExpensesForm && <AddExpenses />}
            {showShipmentForm && <StartShipment />}
            <div className="footer">
                <p>&copy; 2023 TRX by Lina Rawas. All Rights Reserved.</p>
            </div>
        </>
    );
};

export default FeatureSection;

