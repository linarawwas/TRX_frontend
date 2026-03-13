import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import useSyncOfflineOrders from "./useSyncOfflineOrders";
import { getPendingRequests, removeRequestFromDb } from "../utils/indexedDB";
import { toast } from "react-toastify";

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

describe("useSyncOfflineOrders", () => {
  const originalFetch = global.fetch;
  const originalNavigatorOnLine = navigator.onLine;

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockReset();
    mockGetPendingRequests.mockReset();
    mockRemoveRequestFromDb.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();

    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({}),
      statusText: "OK",
    })) as any;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.fetch = originalFetch;
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: originalNavigatorOnLine,
    });
  });

  test("syncs pending requests and updates redux state", async () => {
    mockGetPendingRequests.mockResolvedValue([
      {
        id: 1,
        url: "http://localhost:5000/api/orders",
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
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/orders",
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
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
