
import { useState } from 'react';
import './LandingPage.css';
import AddProfits from '../Profits/AddProfits/AddProfits';
import AddExpenses from '../Expenses/AddExpenses/AddExpenses';
import { useDispatch } from 'react-redux';
import { clearShipmentInfo } from '../../redux/Shipment/action';
import { Link } from 'react-router-dom';
import StartShipment from '../EmployeeComponents/StartShipment/StartShipment';
import { FaTimes } from 'react-icons/fa';
import UpdateExchangeRate from '../ExchangeRate/UpdateExchangeRate';
const AdminFeatures = () => {
    const dispatch = useDispatch();
    const [showExchangeRate, setShowExchangeRate] = useState(false)
    return (
        <>
            <div className="feature-section">
                <h2>Key Features</h2>
                <ul>
                    <li className='show-form-li' onClick={() => { setShowExchangeRate(!showExchangeRate) }}>{showExchangeRate ? <FaTimes /> : "Update Exchange Rate"}</li>
                </ul>
            </div>
            {showExchangeRate && <UpdateExchangeRate />}

        </>
    );
};

export default AdminFeatures;

