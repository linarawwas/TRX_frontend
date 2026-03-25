import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { getPendingRequests, removeRequestFromDb } from "../utils/indexedDB";
import { createLogger } from "../utils/logger";
import { rtkResult } from "../features/api/rtkTransport";
import {
  removePendingOrder,
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
} from "../redux/Shipment/action";

interface PendingRequest {
  id: number;
  url: string;
  options: RequestInit & { body?: string };
}

const logger = createLogger("offline-sync");

const parseJsonBody = (raw: string | undefined) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const parseReplayBody = (raw: string | undefined): unknown => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const toReplayPath = (url: string): string | null => {
  if (url.startsWith("/api/")) return url;
  if (url.startsWith("http")) {
    try {
      const parsed = new URL(url);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return null;
    }
  }
  return null;
};

const useSyncOfflineOrders = () => {
  const dispatch = useDispatch();
  const syncInProgress = useRef(false);
  const hasEventListener = useRef(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const syncOfflineOrders = async () => {
      if (syncInProgress.current) {
        logger.debug("Sync already in progress, skipping.");
        return;
      }

      if (!navigator.onLine) {
        logger.debug("Device is offline. Sync will start once online.");
        return;
      }

      syncInProgress.current = true;

      logger.debug("Waiting 10 seconds before syncing.");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      logger.debug("Fetching pending requests from IndexedDB.");

      let pendingRequests: PendingRequest[];
      try {
        pendingRequests = await getPendingRequests();
        logger.debug("Pending requests found.", pendingRequests);
      } catch (error) {
        logger.error("Error fetching pending requests.", error);
        syncInProgress.current = false;
        return;
      }

      if (pendingRequests.length === 0) {
        logger.debug("No pending requests to sync.");
        syncInProgress.current = false;
        return;
      }

      for (const request of pendingRequests) {
        try {
          logger.debug("Processing request.", request);
          const body = parseJsonBody(request.options.body);

          const replayPath = request.url ? toReplayPath(request.url) : null;
          if (!replayPath) {
            logger.error("Invalid request URL.", request.url);
            toast.error("Invalid request URL. Sync failed.");
            continue;
          }

          logger.debug("Sending request to server.");
          const replayMethod = (
            request.options.method || "GET"
          ) as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
          const replayResult = await rtkResult<unknown>(replayPath, {
            method: replayMethod,
            headers: (request.options.headers as Record<string, string>) ?? {},
            jsonBody: parseReplayBody(request.options.body),
            credentials: request.options.credentials,
            fallbackMessage: "Failed to sync order",
          });
          if (replayResult.error) {
            logger.error("Failed to sync order.", replayResult.error);
            toast.error(`Failed to sync order: ${replayResult.error}`);
            continue;
          }

          logger.info("Order synced successfully. Removing from IndexedDB.");
          await removeRequestFromDb(request.id);

          if (
            parseInt(String(body.delivered)) === 0 &&
            parseInt(String(body.returned)) === 0 &&
            parseInt(String(body.paid)) === 0
          ) {
            dispatch(addCustomerWithEmptyOrder(body.customerid));
          } else {
            dispatch(addCustomerWithFilledOrder(body.customerid));
          }

          dispatch(removePendingOrder(body.customerid));
          toast.success("تم إرسال الطلبات المسجلة بدون انترنت بنجاح!");
        } catch (error) {
          logger.error("Error syncing offline order.", error);
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
      logger.debug("Device is online. Waiting 10 seconds before sync.");
      setTimeout(syncOfflineOrders, 10000);
    }

    return () => {
      logger.debug("Cleaning up event listener for online status.");
      window.removeEventListener("online", handleOnline);
      hasEventListener.current = false;
    };
  }, [dispatch, isOnline]);

  return null;
};

export default useSyncOfflineOrders;

