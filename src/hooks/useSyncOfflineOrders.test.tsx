import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import useSyncOfflineOrders from "./useSyncOfflineOrders";
import { getPendingRequests, removeRequestFromDb } from "../utils/indexedDB";
import { toast } from "react-toastify";
import { rtkJson, TransportError } from "../features/api/rtkTransport";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: () => mockDispatch,
}));

jest.mock("../utils/indexedDB", () => ({
  __esModule: true,
  getPendingRequests: jest.fn(),
  removeRequestFromDb: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../features/api/rtkTransport", () => ({
  __esModule: true,
  rtkJson: jest.fn(),
  TransportError: class TransportError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body: unknown) {
      super(message);
      this.name = "ApiRequestError";
      this.status = status;
      this.body = body;
    }
  },
}));

function TestComponent() {
  useSyncOfflineOrders();
  return null;
}

const mockGetPendingRequests = getPendingRequests as jest.MockedFunction<
  typeof getPendingRequests
>;
const mockRemoveRequestFromDb = removeRequestFromDb as jest.MockedFunction<
  typeof removeRequestFromDb
>;
const mockRequestJson = rtkJson as jest.MockedFunction<typeof rtkJson>;

describe("useSyncOfflineOrders", () => {
  const originalNavigatorOnLine = navigator.onLine;

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockReset();
    mockGetPendingRequests.mockReset();
    mockRemoveRequestFromDb.mockReset();
    mockRequestJson.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();

    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    mockRequestJson.mockResolvedValue({});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: originalNavigatorOnLine,
    });
  });

  test("syncs pending requests and updates redux state", async () => {
    mockGetPendingRequests.mockResolvedValue([
      {
        id: 1,
        url: "/api/orders",
        options: {
          method: "POST",
          body: JSON.stringify({
            customerid: "customer-1",
            delivered: 2,
            returned: 0,
            paid: 1,
          }),
        },
      },
    ] as any);

    render(<TestComponent />);

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(mockGetPendingRequests).toHaveBeenCalled();
      expect(mockRequestJson).toHaveBeenCalledWith(
        "/api/orders",
        expect.objectContaining({ method: "POST" })
      );
      expect(mockRemoveRequestFromDb).toHaveBeenCalledWith(1);
      expect(mockDispatch).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "تم إرسال الطلبات المسجلة بدون انترنت بنجاح!"
      );
    });
  });

  test("does not sync while offline", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(<TestComponent />);
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await Promise.resolve();

    expect(mockGetPendingRequests).not.toHaveBeenCalled();
    expect(mockRequestJson).not.toHaveBeenCalled();
  });

  test("shows an error for invalid request urls without replay call", async () => {
    mockGetPendingRequests.mockResolvedValue([
      {
        id: 1,
        url: "/relative/orders",
        options: {
          method: "POST",
          body: JSON.stringify({ customerid: "customer-1" }),
        },
      },
    ] as any);

    render(<TestComponent />);

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid request URL. Sync failed.");
    });

    expect(mockRequestJson).not.toHaveBeenCalled();
    expect(mockRemoveRequestFromDb).not.toHaveBeenCalled();
  });

  test("retries after a network failure and eventually syncs successfully", async () => {
    mockGetPendingRequests.mockResolvedValue([
      {
        id: 1,
        url: "/api/orders",
        options: {
          method: "POST",
          body: JSON.stringify({
            customerid: "customer-1",
            delivered: 1,
            returned: 0,
            paid: 1,
          }),
        },
      },
    ] as any);

    mockRequestJson
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({});

    render(<TestComponent />);

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Network error, retrying in 10 seconds..."
      );
      expect(mockGetPendingRequests).toHaveBeenCalledTimes(2);
      expect(mockRemoveRequestFromDb).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith(
        "تم إرسال الطلبات المسجلة بدون انترنت بنجاح!"
      );
    });
  });

  test("keeps retrying across multiple failures before a later success", async () => {
    mockGetPendingRequests.mockResolvedValue([
      {
        id: 1,
        url: "/api/orders",
        options: {
          method: "POST",
          body: JSON.stringify({
            customerid: "customer-1",
            delivered: 1,
            returned: 0,
            paid: 1,
          }),
        },
      },
    ] as any);

    mockRequestJson
      .mockRejectedValueOnce(new Error("network down 1"))
      .mockRejectedValueOnce(new Error("network down 2"))
      .mockResolvedValueOnce({});

    render(<TestComponent />);

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(mockGetPendingRequests).toHaveBeenCalledTimes(3);
      expect(mockRequestJson).toHaveBeenCalledTimes(3);
      expect((toast.error as jest.Mock).mock.calls).toContainEqual([
        "Network error, retrying in 10 seconds...",
      ]);
      expect(mockRemoveRequestFromDb).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith(
        "تم إرسال الطلبات المسجلة بدون انترنت بنجاح!"
      );
    });
  });

  test("does not retry on API status errors (TransportError)", async () => {
    mockGetPendingRequests.mockResolvedValue([
      {
        id: 1,
        url: "/api/orders",
        options: {
          method: "POST",
          body: JSON.stringify({ customerid: "customer-1", delivered: 1 }),
        },
      },
    ] as any);

    mockRequestJson.mockRejectedValueOnce(
      new TransportError("Bad Request", 400, { message: "Bad Request" })
    );

    render(<TestComponent />);

    await act(async () => {
      jest.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(mockGetPendingRequests).toHaveBeenCalledTimes(1);
      expect(mockRequestJson).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Failed to sync order: Bad Request");
      expect(mockRemoveRequestFromDb).not.toHaveBeenCalled();
    });
  });
});
