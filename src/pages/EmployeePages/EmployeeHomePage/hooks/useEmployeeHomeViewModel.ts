import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigatorOnline } from "../../../../hooks/useNavigatorOnline";
import { isEmployeeHomeUserReady } from "../utils/employeeHomeGuards";
import {
  selectEmployeeHomeShipmentContext,
  selectEmployeeHomeUsername,
} from "../state/employeeHomeState";
import type { EmployeeHomeViewModel } from "../types/employeeHome.types";
import { useEmployeeHomeSyncQueue } from "./useEmployeeHomeSyncQueue";

/**
 * Orchestrates global + local state for Employee Home (DAL-ready boundaries).
 */
export function useEmployeeHomeViewModel(): EmployeeHomeViewModel {
  const username = useSelector(selectEmployeeHomeUsername);
  const { id: shipmentId, dayId } = useSelector(selectEmployeeHomeShipmentContext);
  const isOnline = useNavigatorOnline();
  const {
    count: pendingCount,
    loading: pendingLoading,
    error: pendingError,
  } = useEmployeeHomeSyncQueue();
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const openStartShipment = useCallback(() => {
    setShipmentModalOpen(true);
  }, []);

  return {
    username,
    isUserReady: isEmployeeHomeUserReady(username),
    shipmentId,
    dayId,
    isOnline,
    pendingCount,
    pendingLoading,
    syncError: pendingError,
    shipmentModalOpen,
    openStartShipment,
    setShipmentModalOpen,
  };
}
