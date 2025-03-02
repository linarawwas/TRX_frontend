import { useEffect, useRef, useState } from "react";
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
  const syncInProgress = useRef(false);
  const hasEventListener = useRef(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (syncInProgress.current) {
        console.log("Sync already in progress, skipping...");
        return;
      }

      if (!navigator.onLine) {
        console.log("Device is offline. Sync will start once online.");
        return;
      }

      syncInProgress.current = true;

      console.log("Waiting 10 seconds before syncing...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("Fetching pending requests from IndexedDB...");

      let pendingRequests;
      try {
        pendingRequests = await getPendingRequests();
        console.log("Pending requests found:", pendingRequests);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        syncInProgress.current = false;
        return;
      }

      if (pendingRequests.length === 0) {
        console.log("No pending requests to sync.");
        syncInProgress.current = false;
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
          setTimeout(syncOfflineOrders, 10000);
        }
      }

      syncInProgress.current = false;
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (!syncInProgress.current) {
        syncOfflineOrders();
      }
    };

    if (!hasEventListener.current) {
      window.addEventListener("online", handleOnline);
      hasEventListener.current = true;
    }

    if (isOnline) {
      console.log("Device is online. Waiting 10 seconds before sync...");
      setTimeout(syncOfflineOrders, 10000);
    }

    return () => {
      console.log("Cleaning up event listener for online status...");
      window.removeEventListener("online", handleOnline);
      hasEventListener.current = false;
    };
  }, [dispatch, isOnline]);

  return null;
};

export default useSyncOfflineOrders;
