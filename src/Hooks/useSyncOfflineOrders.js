import { useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { getPendingRequests, removeRequestFromDb } from "../utils/indexedDB";
import {
  removePendingOrder,
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
} from "../redux/Shipment/action"; // Make sure these are the correct action imports

const useSyncOfflineOrders = () => {
  const dispatch = useDispatch(); // Access dispatch for Redux actions

  useEffect(() => {
    const syncOfflineOrders = async () => {
      const pendingRequests = await getPendingRequests();

      for (const request of pendingRequests) {
        const body = JSON.parse(request.options.body); // Parse the request body
        console.log(body);

        try {
          const response = await fetch(request.url, request.options);

          if (response.ok) {
            // Successfully synced, now remove the request from IndexedDB
            await removeRequestFromDb(request.id);

            // Determine if the order is empty or filled based on the body
            if (
              parseInt(body.delivered) === 0 &&
              parseInt(body.returned) === 0 &&
              parseInt(body.paid) === 0
            ) {
              // If order is empty, add to CustomersWithEmptyOrder
              dispatch(addCustomerWithEmptyOrder(body.customerid));
            } else {
              // If order is filled, add to CustomersWithFilledOrder
              dispatch(addCustomerWithFilledOrder(body.customerid));
            }

            // Remove from CustomersWithPendingOrders
            dispatch(removePendingOrder(body.customerid));

            // Show success message
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
  }, [dispatch]); // Adding dispatch to the dependency array
};

export default useSyncOfflineOrders;
