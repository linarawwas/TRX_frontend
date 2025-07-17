import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import UpdateExchangeRate from "../ExchangeRate/UpdateExchangeRate";
import AddDiscount from "../AddDiscount/AddDiscount";
import "./AdminFeatures.css";
const AdminFeatures = () => {
  const [showExchangeRate, setShowExchangeRate] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);

  const handleToggleExchangeRate = () => {
    setShowExchangeRate((prev) => {
      if (!prev) setShowAddDiscount(false); // Close the other form
      return !prev;
    });
  };

  const handleToggleAddDiscount = () => {
    setShowAddDiscount((prev) => {
      if (!prev) setShowExchangeRate(false); // Close the other form
      return !prev;
    });
  };

  return (
    <>
      <div className="admin-feature-section" dir="rtl">
        <div onClick={handleToggleExchangeRate}>
          {showExchangeRate ? <FaTimes /> : "تحديث سعر الصرف"}
        </div>
        <div onClick={handleToggleAddDiscount}>
          {showAddDiscount ? <FaTimes /> : "منح خصم للعميل"}
        </div>
      </div>
      {showExchangeRate && <UpdateExchangeRate />}
      {showAddDiscount && <AddDiscount />}
    </>
  );
};

export default AdminFeatures;
