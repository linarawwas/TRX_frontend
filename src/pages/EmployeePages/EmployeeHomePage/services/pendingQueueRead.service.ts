import { getPendingRequests } from "../../../../utils/indexedDB";
import { createLogger } from "../../../../utils/logger";
import { adaptPendingRequestsToCount } from "../adapters/pendingQueueAdapter";
import { LOG_SCOPE_EMPLOYEE_HOME_QUEUE } from "../constants/employeeHome.constants";

const logger = createLogger(LOG_SCOPE_EMPLOYEE_HOME_QUEUE);

export type PendingQueueReadResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

/**
 * Read-only snapshot of the offline mutation queue size.
 * Does not dequeue or mutate. Swappable with DAL when sync pipeline is centralized.
 */
export async function readPendingQueueSnapshot(): Promise<PendingQueueReadResult> {
  try {
    const pending = await getPendingRequests();
    return { ok: true, count: adaptPendingRequestsToCount(pending) };
  } catch (e) {
    logger.error("Failed to read offline queue from IndexedDB", e);
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Failed to read offline queue",
    };
  }
}
