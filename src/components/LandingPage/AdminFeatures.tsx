import React, { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import AddDiscount from "../AddDiscount/AddDiscount";
import "./AdminFeatures.css";

const AdminFeatures = () => {
  const [showAddDiscount, setShowAddDiscount] = React.useState(false);

  const handleToggleAddDiscount = useCallback(() => {
    setShowAddDiscount((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!showAddDiscount) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleToggleAddDiscount();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddDiscount, handleToggleAddDiscount]);

  const discountModal =
    showAddDiscount &&
    createPortal(
      <div
        className="admfeat-overlay"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleToggleAddDiscount();
        }}
      >
        <div
          className="admfeat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admfeat-discount-title"
        >
          <div className="admfeat-panel__head">
            <h2 id="admfeat-discount-title" className="admfeat-panel__title">
              منح خصم للعميل
            </h2>
            <button
              type="button"
              className="admfeat-panel__close"
              onClick={handleToggleAddDiscount}
              aria-label="إغلاق"
            >
              <FaTimes aria-hidden />
            </button>
          </div>
          <div className="admfeat-panel__body">
            <AddDiscount embedded />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="admin-feature-section" dir="rtl">
      <button
        type="button"
        className="admfeat-trigger"
        onClick={handleToggleAddDiscount}
        aria-expanded={showAddDiscount}
        aria-haspopup="dialog"
      >
        {showAddDiscount ? (
          <>
            <FaTimes className="admfeat-trigger__icon" aria-hidden />
            <span>إغلاق</span>
          </>
        ) : (
          "منح خصم للعميل"
        )}
      </button>

      {discountModal}
    </div>
  );
};

export default AdminFeatures;
