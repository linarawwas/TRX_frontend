import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

export type CustomersForAreaConnectivityBarProps = {
  isOnline: boolean;
};

/** Always-visible device connectivity (live updates vs one-shot navigator.onLine). */
const CustomersForAreaConnectivityBarInner: React.FC<
  CustomersForAreaConnectivityBarProps
> = ({ isOnline }) => (
  <div className="cfa-connectivity" role="status" aria-live="polite">
    <div
      className={`cfa-connectivity__row ${
        isOnline ? "cfa-connectivity__row--online" : "cfa-connectivity__row--offline"
      }`}
    >
      <span className="cfa-connectivity__dot" aria-hidden />
      <span>
        {isOnline ? t("emp.status.online") : t("emp.status.offline")}
      </span>
    </div>
    {!isOnline && (
      <p className="cfa-connectivity__hint">
        {t("customersForArea.offlineHint")}
      </p>
    )}
  </div>
);

export const CustomersForAreaConnectivityBar = memo(
  CustomersForAreaConnectivityBarInner
);
