
import { useState } from 'react';
import '../../Pages/AdminLandingPage/LandingPage.css';
import { useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import UpdateExchangeRate from '../ExchangeRate/UpdateExchangeRate';
import AddDiscount from '../AddDiscount/AddDiscount';
const AdminFeatures = () => {
    const [showExchangeRate, setShowExchangeRate] = useState(false)
    const [showAddDiscount, setShowAddDiscount] = useState(false)
    return (
        <>
            <div className="feature-section">
                <h2>Key Features</h2>
                <ul>
                    <li className='show-form-li' onClick={() => { setShowExchangeRate(!showExchangeRate) }}>{showExchangeRate ? <FaTimes /> : "Update Exchange Rate"}</li>
                    <li className='show-form-li' onClick={() => { setShowAddDiscount(!showAddDiscount) }}>{showAddDiscount ? <FaTimes /> : "Give A Customer a Discount"}</li>
                </ul>
            </div>
            {showExchangeRate && <UpdateExchangeRate />}
            {showAddDiscount && <AddDiscount />}

        </>
    );
};

export default AdminFeatures;

