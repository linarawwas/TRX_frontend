/**
 * View model passed from the page hook into the presentational shell.
 * Keeps UI components free of Redux / IndexedDB / navigator wiring.
 */
export type EmployeeHomeViewModel = {
  username: string;
  isUserReady: boolean;
  shipmentId: string;
  dayId: string;
  isOnline: boolean;
  pendingCount: number | null;
  pendingLoading: boolean;
  syncError: string | null;
  shipmentModalOpen: boolean;
  openStartShipment: () => void;
  setShipmentModalOpen: (open: boolean) => void;
};
