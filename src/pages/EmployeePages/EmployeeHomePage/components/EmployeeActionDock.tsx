import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import StartShipment from "../../../../components/EmployeeComponents/StartShipment/StartShipment";
import { t } from "../../../../utils/i18n";

export type EmployeeActionDockProps = {
  dayId: string | null;
  shipmentModalOpen: boolean;
  onShipmentModalOpenChange: (open: boolean) => void;
};

/**
 * Primary field actions: continue today’s route vs start shipment modal.
 * Modal state is controlled by the parent so empty states can open the same flow.
 */
const EmployeeActionDockInner: React.FC<EmployeeActionDockProps> = ({
  dayId,
  shipmentModalOpen,
  onShipmentModalOpenChange,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeModal = useCallback(() => {
    onShipmentModalOpenChange(false);
  }, [onShipmentModalOpenChange]);

  const toggleModal = useCallback(() => {
    onShipmentModalOpenChange(!shipmentModalOpen);
  }, [onShipmentModalOpenChange, shipmentModalOpen]);

  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    },
    [closeModal]
  );

  useEffect(() => {
    document.body.style.overflow = shipmentModalOpen ? "hidden" : "auto";
    if (shipmentModalOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [shipmentModalOpen]);

  const hasAreaLink = Boolean(dayId && typeof dayId === "string");

  return (
    <>
      <div
        className="employee-action-dock"
        style={{ direction: "rtl", textAlign: "right" }}
      >
        <ul
          className={`employee-action-dock__list ${
            !hasAreaLink ? "employee-action-dock__list--single" : ""
          }`}
        >
          {dayId && typeof dayId === "string" && (
            <li
              className="employee-action-dock__item employee-action-dock__item--primary"
              data-label={t("emp.actions.goToShipment")}
            >
              <Link
                to={`/areas/${dayId}`}
                className="employee-action-dock__link"
                aria-label={t("emp.actions.goToShipment")}
              >
                <FontAwesomeIcon icon={faTruck} size="2x" aria-hidden />
                <span className="employee-action-dock__label">
                  {t("emp.actions.goToShipment")}
                </span>
              </Link>
            </li>
          )}

          <li
            className="employee-action-dock__item employee-action-dock__item--secondary"
            data-label={t("emp.actions.startShipment")}
          >
            <button
              type="button"
              className="employee-action-dock__button"
              onClick={toggleModal}
              aria-expanded={shipmentModalOpen}
              aria-label={
                shipmentModalOpen
                  ? t("emp.actions.close")
                  : t("emp.actions.startShipment")
              }
            >
              {shipmentModalOpen ? (
                <FaTimes aria-hidden />
              ) : (
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  className="employee-action-dock__icon-mirror"
                  aria-hidden
                />
              )}
              <span className="employee-action-dock__label">
                {shipmentModalOpen
                  ? t("emp.actions.close")
                  : t("emp.actions.startShipment")}
              </span>
            </button>
          </li>
        </ul>
      </div>

      {shipmentModalOpen && (
        <div
          className="employee-action-dock__overlay"
          onClick={closeModal}
          onKeyDown={handleOverlayKeyDown}
          role="presentation"
        >
          <div
            className="employee-action-dock__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("emp.actions.startShipment")}
          >
            <button
              ref={closeButtonRef}
              className="employee-action-dock__modal-close"
              onClick={closeModal}
              aria-label={t("emp.actions.close")}
              type="button"
            >
              <FaTimes />
            </button>
            <StartShipment />
          </div>
        </div>
      )}
    </>
  );
};

export const EmployeeActionDock = memo(EmployeeActionDockInner);
