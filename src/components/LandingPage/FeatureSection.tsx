import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import StartShipment from "../EmployeeComponents/StartShipment/StartShipment";
import "../../pages/AdminPages/AdminHomePage/LandingPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import "./FeatureSection.css";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../redux/store";
import { selectRoundProgress, selectShipmentMeta } from "../../redux/selectors/shipment";
import { computeProgress } from "../../features/shipments/utils/progress";
import { t } from "../../utils/i18n";

const FeatureSection: React.FC = () => {
  const [activeForm, setActiveForm] = useState<"shipment" | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { dayId } = useSelector(selectShipmentMeta);
  const { targetRound, deliveredThisRound } = useSelector(selectRoundProgress);
  const { reached } = computeProgress(deliveredThisRound, targetRound);

  const handleShipmentToggle = useCallback(() => {
    setActiveForm((prev) => (prev === "shipment" ? null : "shipment"));
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

          {/* 🔁 Now: Open StartShipment modal */}
          <li className="show-form-li end-shipment">
            <button
              type="button"
              onClick={handleShipmentToggle}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                // cursor: reached ? "pointer" : "not-allowed",
                color: "inherit",
                opacity: 1,
              }}
              aria-label={activeForm === "shipment" ? t("emp.actions.close") : t("emp.actions.startShipment")}
            >
              {activeForm === "shipment" ? (
                <FaTimes aria-label={t("emp.actions.close")} />
              ) : (
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  className="shipment-logo mirrored"
                  style={{ color: "white" }}
                  aria-label={t("emp.actions.startShipment")}
                />
              )}
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
