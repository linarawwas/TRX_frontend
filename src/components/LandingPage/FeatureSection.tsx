import React, { useState, useEffect } from "react";
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

  const toggleForm = (form: string) =>
    setActiveForm((prev) => (prev === form ? null : form));

  useEffect(() => {
    document.body.style.overflow = activeForm ? "hidden" : "auto";
  }, [activeForm]);

  const closeModal = () => setActiveForm(null);

  const shipmentId = useSelector((state: any) => state.shipment._id);
  const dayId = useSelector((state: any) => state.shipment.dayId);
  const shipmentDefined = !!shipmentId;

  return (
    <>
      <div
        className="feature-section"
        style={{ direction: "rtl", textAlign: "right" }}
      >
        <ul>
          {/* ✅ This now links to the Areas page */}
          {dayId && (
            <li className="show-form-li">
              <Link to={`/areas/${dayId}`} className="link-to-shipment">
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  className="shipment-logo"
                />
              </Link>
            </li>
          )}

          {/* ✅ This now opens the shipment modal and is red + mirrored */}
          <li
            className="show-form-li end-shipment"
            onClick={() => toggleForm("shipment")}
          >
            {activeForm === "shipment" ? (
              <FaTimes />
            ) : (
              <FontAwesomeIcon
                icon={faTruck}
                size="2x"
                className="shipment-logo mirrored"
              />
            )}
          </li>

          <li className="show-form-li" onClick={() => toggleForm("profits")}>
            {activeForm === "profits" ? (
              <FaTimes />
            ) : (
              <FontAwesomeIcon icon={faDollarSign} size="2x" />
            )}
          </li>

          <li className="show-form-li" onClick={() => toggleForm("expenses")}>
            {activeForm === "expenses" ? (
              <FaTimes />
            ) : (
              <FontAwesomeIcon icon={faWallet} size="2x" />
            )}
          </li>
        </ul>
      </div>

      {activeForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
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
