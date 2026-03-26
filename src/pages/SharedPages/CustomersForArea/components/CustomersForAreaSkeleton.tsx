import React from "react";
import { t } from "../../../../utils/i18n";

export const CustomersForAreaSkeleton: React.FC = () => (
  <div className="cfa-skeleton" aria-busy="true" aria-live="polite">
    <div className="cfa-skeleton__row" />
    <div className="cfa-skeleton__row" />
    <div className="cfa-skeleton__row cfa-skeleton__row--short" />
    <p className="cfa-skeleton__label">{t("customersForArea.loading")}</p>
  </div>
);
