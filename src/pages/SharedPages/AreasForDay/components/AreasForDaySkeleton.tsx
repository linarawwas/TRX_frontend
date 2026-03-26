import React from "react";
import { t } from "../../../../utils/i18n";

export const AreasForDaySkeleton: React.FC = () => (
  <div className="areas-for-day-skeleton" aria-busy="true" aria-live="polite">
    <div className="areas-for-day-skeleton__row" />
    <div className="areas-for-day-skeleton__row" />
    <div className="areas-for-day-skeleton__row areas-for-day-skeleton__row--short" />
    <p className="areas-for-day-skeleton__label">{t("addresses.areasForDay.loading")}</p>
  </div>
);
