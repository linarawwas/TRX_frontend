import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import AddDiscount from "../AddDiscount/AddDiscount";
import "./AdminFeatures.css";

const AdminFeatures = () => {
  const [showExchangeRate, setShowExchangeRate] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);

  const handleToggleExchangeRate = () => {
    setShowExchangeRate((prev) => {
      if (!prev) setShowAddDiscount(false);
      return !prev;
    });
  };

  const handleToggleAddDiscount = () => {
    setShowAddDiscount((prev) => {
      if (!prev) setShowExchangeRate(false);
      return !prev;
    });
  };

  return (
    <div className="admin-feature-section" dir="rtl">
     

      {/* Add Discount Modal Trigger */}
      <div className="modal-trigger" onClick={handleToggleAddDiscount}>
        {showAddDiscount ? <FaTimes /> : "منح خصم للعميل"}
      </div>

      {/* Overlay and Modal for Add Discount */}
      {showAddDiscount && (
        <div className="modal-overlay" onClick={handleToggleAddDiscount}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddDiscount />
          </div>
        </div>
      )}

      {/* Overlay and Modal for Exchange Rate */}
      {showExchangeRate && (
        <div className="modal-overlay" onClick={handleToggleExchangeRate}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeatures;
