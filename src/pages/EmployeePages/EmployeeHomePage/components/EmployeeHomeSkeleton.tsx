import React from "react";
import { t } from "../../../../utils/i18n";

/** Shown while user profile is not yet available (token without hydrated name). */
export const EmployeeHomeSkeleton: React.FC = () => (
  <div className="employee-home-skeleton" aria-busy="true" aria-live="polite">
    <div className="employee-home-skeleton__block employee-home-skeleton__block--title" />
    <div className="employee-home-skeleton__block employee-home-skeleton__block--line" />
    <div className="employee-home-skeleton__block employee-home-skeleton__card" />
    <div className="employee-home-skeleton__block employee-home-skeleton__card" />
    <p className="employee-home-skeleton__label">{t("emp.home.loading")}</p>
  </div>
);
