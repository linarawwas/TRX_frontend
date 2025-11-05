import React, { useState, useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import AddProfits from "../Profits/AddProfits/AddProfits";
import AddExpenses from "../Expenses/AddExpenses/AddExpenses";
import StartShipment from "../EmployeeComponents/StartShipment/StartShipment";
import "../../pages/AdminPages/AdminHomePage/LandingPage.css";
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

  const toggleForm = useCallback((form: string) => {
    setActiveForm((prev) => (prev === form ? null : form));
  }, []);

  const closeModal = () => setActiveForm(null);

  useEffect(() => {
    document.body.style.overflow = activeForm ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeForm]);

  return (
    <>
      <div
        className="feature-section"
        style={{ direction: "rtl", textAlign: "right" }}
      >
        <ul>
          {/* 🔁 Now: Go to current shipment area */}
          {dayId && typeof dayId === "string" && (
            <li className="show-form-li" style={{ backgroundColor: "green" }}>
              <Link
                to={`/areas/${dayId}`}
                className="link-to-shipment"
                aria-label="الذهاب إلى تفاصيل الشحنة"
                style={{ color: "white" }}
              >
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  aria-label="تفاصيل الشحنة"
                />
              </Link>
            </li>
          )}

          <li className="show-form-li" onClick={() => toggleForm("profits")}>
            {activeForm === "profits" ? (
              <FaTimes aria-label="إغلاق نافذة الأرباح" />
            ) : (
              <FontAwesomeIcon
                icon={faDollarSign}
                size="2x"
                aria-label="إضافة أرباح"
              />
            )}
          </li>

          <li className="show-form-li" onClick={() => toggleForm("expenses")}>
            {activeForm === "expenses" ? (
              <FaTimes aria-label="إغلاق نافذة المصاريف" />
            ) : (
              <FontAwesomeIcon
                icon={faWallet}
                size="2x"
                aria-label="إضافة مصاريف"
              />
            )}
          </li>

          {/* 🔁 Now: Open StartShipment modal */}
          <li
            className="show-form-li end-shipment"
            onClick={() => toggleForm("shipment")}
          >
            <FontAwesomeIcon
              icon={faTruck}
              size="2x"
              className="shipment-logo mirrored"
              style={{ color: "white" }}
              aria-label="بدء شحنة جديدة"
            />
          </li>
        </ul>
      </div>

      {activeForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="إغلاق النموذج"
            >
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
