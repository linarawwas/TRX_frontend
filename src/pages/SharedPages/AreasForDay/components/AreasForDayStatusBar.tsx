import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

export type AreasForDayStatusBarProps = {
  isOnline: boolean;
};

/**
 * Connectivity strip: field users must see offline state without inferring from empty lists.
 */
const AreasForDayStatusBarInner: React.FC<AreasForDayStatusBarProps> = ({
  isOnline,
}) => (
  <div
    className="areas-for-day-status"
    role="status"
    aria-live="polite"
  >
    <div
      className={`areas-for-day-status__row ${
        isOnline
          ? "areas-for-day-status__row--online"
          : "areas-for-day-status__row--offline"
      }`}
    >
      <span className="areas-for-day-status__dot" aria-hidden />
      <span>
        {isOnline ? t("emp.status.online") : t("emp.status.offline")}
      </span>
    </div>
    {!isOnline && (
      <p className="areas-for-day-status__hint">{t("addresses.areasForDay.offlineHint")}</p>
    )}
  </div>
);

export const AreasForDayStatusBar = memo(AreasForDayStatusBarInner);
