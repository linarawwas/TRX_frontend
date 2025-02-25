import { useEffect, useState } from "react";
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
  const [hasPendingOrders, setHasPendingOrders] = useState(false);

  useEffect(() => {
    let syncTimeout;

    const checkForPendingOrders = async () => {
      console.log("Checking IndexedDB for pending orders...");
      const pendingRequests = await getPendingRequests();
      if (pendingRequests.length > 0) {
        console.log("Pending orders found:", pendingRequests.length);
        setHasPendingOrders(true);
      } else {
        console.log("No pending orders.");
        setHasPendingOrders(false);
      }
    };

    const syncOfflineOrders = async () => {
      if (!navigator.onLine || !hasPendingOrders) {
        console.log("Sync not needed (either offline or no pending orders).");
        return;
      }

      console.log("Waiting 5 seconds before syncing...");
      await new Promise((resolve) => (syncTimeout = setTimeout(resolve, 5000)));

      console.log("Fetching pending requests...");
      const pendingRequests = await getPendingRequests();

      if (pendingRequests.length === 0) {
        console.log("No pending requests to sync.");
        setHasPendingOrders(false);
        return;
      }

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

            console.log("Updating Redux store...");
            if (
              parseInt(body.delivered) === 0 &&
              parseInt(body.returned) === 0 &&
              parseInt(body.paid) === 0
            ) {
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
          toast.error("Network error, retrying when connection stabilizes.");
        }
      }

      console.log("Sync completed.");
      setHasPendingOrders(false);
    };

    window.addEventListener("online", syncOfflineOrders);

    if (!navigator.onLine) {
      checkForPendingOrders();
    }

    return () => {
      console.log("Cleaning up event listener...");
      window.removeEventListener("online", syncOfflineOrders);
      clearTimeout(syncTimeout);
    };
  }, [dispatch, hasPendingOrders]);

};

export default useSyncOfflineOrders;
