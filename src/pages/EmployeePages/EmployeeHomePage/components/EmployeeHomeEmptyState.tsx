import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

export type EmployeeHomeEmptyStateProps = {
  onStartShipment: () => void;
};

const EmployeeHomeEmptyStateInner: React.FC<EmployeeHomeEmptyStateProps> = ({
  onStartShipment,
}) => (
  <section
    className="employee-home-empty"
    aria-labelledby="employee-home-empty-title"
  >
    <h2 id="employee-home-empty-title" className="employee-home-empty__title">
      {t("emp.home.empty.title")}
    </h2>
    <p className="employee-home-empty__body">{t("emp.home.empty.body")}</p>
    <button
      type="button"
      className="employee-home-btn employee-home-btn--primary"
      onClick={onStartShipment}
    >
      {t("emp.actions.startShipment")}
    </button>
  </section>
);

export const EmployeeHomeEmptyState = memo(EmployeeHomeEmptyStateInner);
