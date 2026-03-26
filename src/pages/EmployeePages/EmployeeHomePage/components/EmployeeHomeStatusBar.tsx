import React, { memo } from "react";
import { t } from "../../../../utils/i18n";

export type EmployeeHomeStatusBarProps = {
  isOnline: boolean;
  /** Resolved count; `null` while IndexedDB is unread */
  pendingCount: number | null;
  pendingLoading: boolean;
  syncError: string | null;
};

/**
 * Connectivity + offline queue visibility (system state, not business KPIs).
 */
const EmployeeHomeStatusBarInner: React.FC<EmployeeHomeStatusBarProps> = ({
  isOnline,
  pendingCount,
  pendingLoading,
  syncError,
}) => {
  const showPending =
    !pendingLoading &&
    pendingCount !== null &&
    pendingCount > 0;

  return (
    <div
      className="employee-home-status"
      role="status"
      aria-live="polite"
    >
      <div
        className={`employee-home-status__row ${
          isOnline
            ? "employee-home-status__row--online"
            : "employee-home-status__row--offline"
        }`}
      >
        <span className="employee-home-status__dot" aria-hidden />
        <span>
          {isOnline ? t("emp.status.online") : t("emp.status.offline")}
        </span>
      </div>

      {showPending && (
        <div className="employee-home-status__pending">
          {t("emp.status.pendingSync", { count: pendingCount })}
        </div>
      )}

      {syncError && (
        <div className="employee-home-status__error" role="alert">
          {t("emp.home.syncError")}
        </div>
      )}
    </div>
  );
};

export const EmployeeHomeStatusBar = memo(EmployeeHomeStatusBarInner);
