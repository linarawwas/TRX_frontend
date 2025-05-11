import React, { useState } from "react";
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

const FeatureSection: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const toggleForm = (form: string) =>
    setActiveForm((prev) => (prev === form ? null : form));

  return (
    <>
      <div
        className="feature-section"
        style={{ direction: "rtl", textAlign: "right" }}
      >        <ul>
          <li className="show-form-li" onClick={() => toggleForm("shipment")}>
            {activeForm === "shipment" ? (
              <FaTimes />
            ) : (
              <FontAwesomeIcon icon={faTruck} size="2x" />
            )}
          </li>
          <li className="show-form-li" onClick={() => toggleForm("profits")}>
            {activeForm === "profits" ? (
              <FaTimes />
            ) : (
              <FontAwesomeIcon icon={faDollarSign} size="2x"/>
            )}
          </li>
          <li className="show-form-li" onClick={() => toggleForm("expenses")}>
            {activeForm === "expenses" ? (
              <FaTimes />
            ) : (
              <FontAwesomeIcon icon={faWallet} size="2x"/>
            )}
          </li>
        </ul>
      </div>

      {activeForm === "shipment" && <StartShipment />}
      {activeForm === "profits" && <AddProfits />}
      {activeForm === "expenses" && <AddExpenses />}

      <div className="footer" style={{ direction: "rtl", textAlign: "center" }}>
        <p>© 2025 تيركس بواسطة لينة الرواّس. جميع الحقوق محفوظة.</p>
      </div>
    </>
  );
};

export default FeatureSection;
