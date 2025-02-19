import { useEffect } from "react";
import { toast } from "react-toastify";
import { getPendingRequests, removeRequestFromDb } from "../utils/indexedDB";
const useSyncOfflineOrders = () => {
  useEffect(() => {
    const syncOfflineOrders = async () => {
      const pendingRequests = await getPendingRequests();

      for (const request of pendingRequests) {
        try {
          const response = await fetch(request.url, request.options);
          if (response.ok) {
            await removeRequestFromDb(request.id);
            toast.success("Offline order submitted successfully.");
          } else {
            toast.error("Failed to sync an offline order.");
          }
        } catch (error) {
          console.error("Error syncing offline orders:", error);
        }
      }
    };

    window.addEventListener("online", syncOfflineOrders);

    return () => {
      window.removeEventListener("online", syncOfflineOrders);
    };
  }, []);
};

export default useSyncOfflineOrders;
