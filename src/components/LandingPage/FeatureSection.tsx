import React, { useState, useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import AddProfits from "../Profits/AddProfits/AddProfits";
import AddExpenses from "../Expenses/AddExpenses/AddExpenses";
import StartShipment from "../EmployeeComponents/StartShipment/StartShipment";
import "../../Pages/AdminPages/AdminLandingPage/LandingPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faWallet,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import "./FeatureSection.css";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const FeatureSection: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const shipmentId = useSelector((state: any) => state.shipment._id);
  const dayId = useSelector((state: any) => state.shipment.dayId);
  const shipmentDefined = !!shipmentId;

  // === Handlers ===
  const toggleForm = useCallback((form: string) => {
    setActiveForm((prev) => (prev === form ? null : form));
  }, []);

  const closeModal = () => setActiveForm(null);

  // === Scroll Lock When Modal Open ===
  useEffect(() => {
    document.body.style.overflow = activeForm ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeForm]);

  return (
    <>
      <div className="feature-section" style={{ direction: "rtl", textAlign: "right" }}>
        <ul>
          <li className="show-form-li" onClick={() => toggleForm("shipment")}>
            {activeForm === "shipment" ? (
              <FaTimes aria-label="إغلاق نافذة الشحن" />
            ) : (
              <FontAwesomeIcon icon={faTruck} size="2x" aria-label="بدء الشحنة" />
            )}
          </li>

          <li className="show-form-li" onClick={() => toggleForm("profits")}>
            {activeForm === "profits" ? (
              <FaTimes aria-label="إغلاق نافذة الأرباح" />
            ) : (
              <FontAwesomeIcon icon={faDollarSign} size="2x" aria-label="إضافة أرباح" />
            )}
          </li>

          <li className="show-form-li" onClick={() => toggleForm("expenses")}>
            {activeForm === "expenses" ? (
              <FaTimes aria-label="إغلاق نافذة المصاريف" />
            ) : (
              <FontAwesomeIcon icon={faWallet} size="2x" aria-label="إضافة مصاريف" />
            )}
          </li>

          {dayId && typeof dayId === "string" && (
            <li className="show-form-li end-shipment">
              <Link to={`/areas/${dayId}`} className="link-to-shipment" aria-label="الذهاب إلى تفاصيل الشحنة">
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  className="shipment-logo mirrored"
                  style={{ color: "white" }}
                />
              </Link>
            </li>
          )}
        </ul>
      </div>

      {activeForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="إغلاق النموذج">
              <FaTimes />
            </button>
            {activeForm === "shipment" && <StartShipment />}
            {activeForm === "profits" && <AddProfits />}
            {activeForm === "expenses" && <AddExpenses />}
          </div>
        </div>
      )}

      <div className="footer" style={{ direction: "rtl", textAlign: "center" }}>
        <p>© 2025 تيركس بواسطة لينة الرواّس. جميع الحقوق محفوظة.</p>
      </div>
    </>
  );
};

export default FeatureSection;
