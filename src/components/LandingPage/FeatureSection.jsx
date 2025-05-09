import { useState } from 'react';
import '../../Pages/AdminPages/AdminLandingPage/LandingPage.css';
import AddProfits from '../Profits/AddProfits/AddProfits';
import AddExpenses from '../Expenses/AddExpenses/AddExpenses';
import StartShipment from '../EmployeeComponents/StartShipment/StartShipment';
import { FaTimes } from 'react-icons/fa';

const FeatureSection = () => {
  const [activeForm, setActiveForm] = useState(null); // 'shipment', 'profits', 'expenses'

  const toggleForm = (formName) => {
    setActiveForm(prev => (prev === formName ? null : formName));
  };

  return (
    <>
      <div className="feature-section" style={{ direction: 'rtl', textAlign: 'right' }}>
        <h2>الميزات الرئيسية</h2>
        <ul>
          <li className="show-form-li" onClick={() => toggleForm('shipment')}>
            {activeForm === 'shipment' ? <FaTimes /> : 'ابدأ شحنة جديدة'}
          </li>
          <li className="show-form-li" onClick={() => toggleForm('profits')}>
            {activeForm === 'profits' ? <FaTimes /> : 'أضف أرباح إضافية'}
          </li>
          <li className="show-form-li" onClick={() => toggleForm('expenses')}>
            {activeForm === 'expenses' ? <FaTimes /> : 'أضف مصاريف'}
          </li>
        </ul>
      </div>

      {activeForm === 'shipment' && <StartShipment />}
      {activeForm === 'profits' && <AddProfits />}
      {activeForm === 'expenses' && <AddExpenses />}

      <div className="footer" style={{ direction: 'rtl', textAlign: 'center' }}>
      <p>© 2025 تيركس بواسطة لينة الرواّس. جميع الحقوق محفوظة.</p>
      </div>
    </>
  );
};

export default FeatureSection;
