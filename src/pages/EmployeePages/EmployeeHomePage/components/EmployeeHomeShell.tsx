import React, { memo } from "react";
import TodaySnapshot from "../../../../components/AsideMenu/Right/TodaySnapshot";
import RoundSnapshot from "../../../../components/AsideMenu/Right/RoundSnapshot";
import type { EmployeeHomeViewModel } from "../types/employeeHome.types";
import { EmployeeHomeStatusBar } from "./EmployeeHomeStatusBar";
import { EmployeeHomeHeader } from "./EmployeeHomeHeader";
import { EmployeeHomeEmptyState } from "./EmployeeHomeEmptyState";
import { EmployeeHomeSkeleton } from "./EmployeeHomeSkeleton";
import { EmployeeActionDock } from "./EmployeeActionDock";
import { EmployeeHomeFooter } from "./EmployeeHomeFooter";

export type EmployeeHomeShellProps = EmployeeHomeViewModel;

/**
 * Presentational shell: layout + composition only. No Redux, no services.
 */
const EmployeeHomeShellInner: React.FC<EmployeeHomeShellProps> = ({
  username,
  isUserReady,
  shipmentId,
  dayId,
  isOnline,
  pendingCount,
  pendingLoading,
  syncError,
  shipmentModalOpen,
  openStartShipment,
  setShipmentModalOpen,
}) => {
  if (!isUserReady) {
    return (
      <div className="employee-home employee-home--shell" dir="rtl" lang="ar">
        <div className="employee-home__glow" aria-hidden />
        <div className="employee-home__inner">
          <div className="employee-home__surface employee-home__surface--loading">
            <EmployeeHomeSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-home employee-home--shell" dir="rtl" lang="ar">
      <div className="employee-home__glow" aria-hidden />
      <div className="employee-home__inner">
        <div className="employee-home__surface">
          <EmployeeHomeStatusBar
            isOnline={isOnline}
            pendingCount={pendingCount}
            pendingLoading={pendingLoading}
            syncError={syncError}
          />

          <EmployeeHomeHeader userName={username} />

          <main className="employee-home__main">
            {!shipmentId ? (
              <EmployeeHomeEmptyState onStartShipment={openStartShipment} />
            ) : (
              <TodaySnapshot />
            )}
            <RoundSnapshot />
          </main>
        </div>

        <EmployeeActionDock
          dayId={dayId || null}
          shipmentModalOpen={shipmentModalOpen}
          onShipmentModalOpenChange={setShipmentModalOpen}
        />

        <EmployeeHomeFooter />
      </div>
    </div>
  );
};

export const EmployeeHomeShell = memo(EmployeeHomeShellInner);
