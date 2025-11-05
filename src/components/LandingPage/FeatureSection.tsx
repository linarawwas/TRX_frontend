import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { RootState } from "../../redux/store";
import { selectShipmentMeta } from "../../redux/selectors/shipment";
import { t } from "../../utils/i18n";

const FeatureSection: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { dayId } = useSelector(selectShipmentMeta);

  const toggleForm = useCallback((form: string) => {
    setActiveForm((prev) => (prev === form ? null : form));
  }, []);

  const closeModal = useCallback(() => setActiveForm(null), []);

  const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    document.body.style.overflow = activeForm ? "hidden" : "auto";
    if (activeForm && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
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
                aria-label={t("emp.actions.goToShipment")}
                style={{ color: "white" }}
              >
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  aria-label={t("emp.actions.goToShipment")}
                />
              </Link>
            </li>
          )}

          <li className="show-form-li">
            <button
              type="button"
              onClick={() => toggleForm("profits")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}
              aria-label={activeForm === "profits" ? t("emp.actions.close") : t("emp.actions.addProfits")}
            >
              {activeForm === "profits" ? (
                <FaTimes aria-label={t("emp.actions.close")} />
              ) : (
                <FontAwesomeIcon
                  icon={faDollarSign}
                  size="2x"
                  aria-label={t("emp.actions.addProfits")}
                />
              )}
            </button>
          </li>

          <li className="show-form-li">
            <button
              type="button"
              onClick={() => toggleForm("expenses")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}
              aria-label={activeForm === "expenses" ? t("emp.actions.close") : t("emp.actions.addExpenses")}
            >
              {activeForm === "expenses" ? (
                <FaTimes aria-label={t("emp.actions.close")} />
              ) : (
                <FontAwesomeIcon
                  icon={faWallet}
                  size="2x"
                  aria-label={t("emp.actions.addExpenses")}
                />
              )}
            </button>
          </li>

          {/* 🔁 Now: Open StartShipment modal */}
          <li className="show-form-li end-shipment">
            <button
              type="button"
              onClick={() => toggleForm("shipment")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}
              aria-label={t("emp.actions.startShipment")}
            >
              <FontAwesomeIcon
                icon={faTruck}
                size="2x"
                className="shipment-logo mirrored"
                style={{ color: "white" }}
                aria-label={t("emp.actions.startShipment")}
              />
            </button>
          </li>
        </ul>
      </div>

      {activeForm && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          onKeyDown={handleOverlayKeyDown}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              ref={closeButtonRef}
              className="modal-close"
              onClick={closeModal}
              aria-label={t("emp.actions.close")}
              type="button"
            >
              <FaTimes />
            </button>
            {activeForm === "shipment" && <StartShipment />}
            {activeForm === "profits" && (
              <AddProfits
                config={{
                  modelName: t("profits.title"),
                  title: t("profits.add.title"),
                  buttonLabel: t("profits.add.buttonLabel"),
                  fields: {
                    name: { label: t("profits.fields.name"), "input-type": "text" },
                    value: { label: t("profits.fields.value"), "input-type": "number" },
                    paymentCurrency: {
                      label: t("profits.fields.paymentCurrency"),
                      "input-type": "selectOption",
                      options: [
                        { value: "USD", label: t("profits.currency.usd") },
                        { value: "LBP", label: t("profits.currency.lbp") },
                      ],
                    },
                  },
                }}
              />
            )}
            {activeForm === "expenses" && (
              <AddExpenses
                config={{
                  modelName: t("expenses.title"),
                  title: t("expenses.add.title"),
                  buttonLabel: t("expenses.add.buttonLabel"),
                  fields: {
                    name: { label: t("expenses.fields.name"), "input-type": "text" },
                    value: { label: t("expenses.fields.value"), "input-type": "number" },
                    paymentCurrency: {
                      label: t("expenses.fields.paymentCurrency"),
                      "input-type": "selectOption",
                      options: [
                        { value: "USD", label: t("expenses.currency.usd") },
                        { value: "LBP", label: t("expenses.currency.lbp") },
                      ],
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      )}

      <div className="footer" style={{ direction: "rtl", textAlign: "center" }}>
        <p>{t("emp.footer.copyright")}</p>
      </div>

    </>
  );
};

export default FeatureSection;
