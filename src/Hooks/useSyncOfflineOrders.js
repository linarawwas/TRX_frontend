import { useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { getPendingRequests, removeRequestFromDb } from "../utils/indexedDB";
import {
  removePendingOrder,
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
} from "../redux/Shipment/action";

const useSyncOfflineOrders = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const syncOfflineOrders = async () => {
      console.log("Checking if device is online...");
      
      if (!navigator.onLine) {
        console.log("Device is offline. Syncing will not start.");
        toast.info("You are offline. Orders will sync once you're online.");
        return;
      }

      console.log("Checking IndexedDB for pending orders...");
      
      let pendingRequests;
      try {
        pendingRequests = await getPendingRequests();
        console.log("Fetched pending requests:", pendingRequests);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        return;
      }

      const hasPendingOrders = pendingRequests.length > 0;
      
      if (!navigator.onLine || !hasPendingOrders) {
        console.log("Sync not needed (either offline or no pending orders).");
        return;
      }

      console.log(`Total pending requests found: ${pendingRequests.length}`);

      for (const request of pendingRequests) {
        try {
          console.log("Processing request:", request);
          const body = JSON.parse(request.options.body);

          if (!request.url || !request.url.startsWith("http")) {
            console.error("Invalid request URL:", request.url);
            toast.error("Invalid request URL. Sync failed.");
            continue;
          }

          console.log("Sending request to server...");
          const response = await fetch(request.url, request.options);

          if (response.ok) {
            console.log("Order synced successfully. Removing from IndexedDB...");
            await removeRequestFromDb(request.id);

            if (parseInt(body.delivered) === 0 &&
                parseInt(body.returned) === 0 &&
                parseInt(body.paid) === 0) {
              dispatch(addCustomerWithEmptyOrder(body.customerid));
            } else {
              dispatch(addCustomerWithFilledOrder(body.customerid));
            }

            dispatch(removePendingOrder(body.customerid));
            toast.success("Offline order submitted successfully.");
          } else {
            console.error("Failed to sync order:", response.statusText);
            toast.error(`Failed to sync order: ${response.statusText}`);
          }
        } catch (error) {
          console.error("Error syncing offline order:", error);
          toast.error("Network error, retrying in 10 seconds...");
          setTimeout(syncOfflineOrders, 10000); // Retry after 10 seconds
        }
      }
    };

    window.addEventListener("online", syncOfflineOrders);

    if (navigator.onLine) {
      console.log("Device is online. Starting immediate sync...");
      syncOfflineOrders();
    }

    return () => {
      console.log("Cleaning up event listener for online status...");
      window.removeEventListener("online", syncOfflineOrders);
    };
  }, [dispatch]);
};

export default useSyncOfflineOrders;
