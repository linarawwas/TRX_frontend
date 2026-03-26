import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { selectShipmentMeta } from "../../../redux/selectors/shipment";
import { useNavigatorOnline } from "../../../hooks/useNavigatorOnline";
import { usePendingRequestCount } from "../../../hooks/usePendingRequestCount";
import TodaySnapshot from "../../../components/AsideMenu/Right/TodaySnapshot";
import RoundSnapshot from "../../../components/AsideMenu/Right/RoundSnapshot";
import { EmployeeHomeStatusBar } from "./components/EmployeeHomeStatusBar";
import { EmployeeHomeHeader } from "./components/EmployeeHomeHeader";
import { EmployeeHomeEmptyState } from "./components/EmployeeHomeEmptyState";
import { EmployeeHomeSkeleton } from "./components/EmployeeHomeSkeleton";
import { EmployeeActionDock } from "./components/EmployeeActionDock";
import { EmployeeHomeFooter } from "./components/EmployeeHomeFooter";
import "./EmployeeHomePage.css";

/**
 * Employee home: system status → context header → shipment KPIs → sticky actions.
 * UI state (modal) is local; business state stays in Redux + IndexedDB (pending queue).
 */
const EmployeeHomePage: React.FC = () => {
  const username = useSelector((s: RootState) => s.user.username);
  const { id: shipmentId, dayId } = useSelector(selectShipmentMeta);

  const isOnline = useNavigatorOnline();
  const {
    count: pendingCount,
    loading: pendingLoading,
    error: pendingError,
  } = usePendingRequestCount();

  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);

  const openStartShipment = useCallback(() => {
    setShipmentModalOpen(true);
  }, []);

  /** Hydrated profile name (token may exist before /me fills username). */
  const isUserReady = Boolean(username);

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
            syncError={pendingError}
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

export default EmployeeHomePage;
