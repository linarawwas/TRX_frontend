import { useState } from 'react';
import '../../Pages/AdminPages/AdminLandingPage/LandingPage.css';
import { FaTimes } from 'react-icons/fa';
import UpdateExchangeRate from '../ExchangeRate/UpdateExchangeRate';
import AddDiscount from '../AddDiscount/AddDiscount';

const AdminFeatures = () => {
    const [showExchangeRate, setShowExchangeRate] = useState(false);
    const [showAddDiscount, setShowAddDiscount] = useState(false);

    return (
        <>
            <div className="feature-section" dir="rtl">
                <h2>الميزات الرئيسية</h2>
                <ul>
                    <li
                        className='show-form-li'
                        onClick={() => setShowExchangeRate(!showExchangeRate)}
                    >
                        {showExchangeRate ? <FaTimes /> : "تحديث سعر الصرف"}
                    </li>
                    <li
                        className='show-form-li'
                        onClick={() => setShowAddDiscount(!showAddDiscount)}
                    >
                        {showAddDiscount ? <FaTimes /> : "منح خصم للعميل"}
                    </li>
                </ul>
            </div>
            {showExchangeRate && <UpdateExchangeRate />}
            {showAddDiscount && <AddDiscount />}
        </>
    );
};

export default AdminFeatures;
