import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../../../../redux/rootReducer";
import { getPendingRequests } from "../../../../utils/indexedDB";
import { useEmployeeHomeViewModel } from "../hooks/useEmployeeHomeViewModel";
import { makeEmployeeHomeRootState } from "../test-utils/makeEmployeeHomeRootState";

jest.mock("../../../../utils/indexedDB", () => ({
  getPendingRequests: jest.fn(() => Promise.resolve([])),
}));

const mockGetPending = getPendingRequests as jest.MockedFunction<
  typeof getPendingRequests
>;

function createWrapper(store: ReturnType<typeof configureStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useEmployeeHomeViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPending.mockResolvedValue([]);
  });

  it("isUserReady is false when username is empty", async () => {
    const state = makeEmployeeHomeRootState({
      user: { username: "", token: "t", companyId: "c", isAdmin: false },
    });
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: state,
    });
    const { result } = renderHook(() => useEmployeeHomeViewModel(), {
      wrapper: createWrapper(store),
    });
    await waitFor(() => expect(result.current.pendingLoading).toBe(false));
    expect(result.current.isUserReady).toBe(false);
  });

  it("isUserReady is true when username is set", async () => {
    const state = makeEmployeeHomeRootState({
      user: { username: "Sam", token: "t", companyId: "c", isAdmin: false },
    });
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: state,
    });
    const { result } = renderHook(() => useEmployeeHomeViewModel(), {
      wrapper: createWrapper(store),
    });
    await waitFor(() => expect(result.current.pendingLoading).toBe(false));
    expect(result.current.isUserReady).toBe(true);
    expect(result.current.username).toBe("Sam");
  });

  it("openStartShipment sets shipmentModalOpen true", async () => {
    const state = makeEmployeeHomeRootState();
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: state,
    });
    const { result } = renderHook(() => useEmployeeHomeViewModel(), {
      wrapper: createWrapper(store),
    });
    await waitFor(() => expect(result.current.pendingLoading).toBe(false));
    expect(result.current.shipmentModalOpen).toBe(false);
    act(() => {
      result.current.openStartShipment();
    });
    expect(result.current.shipmentModalOpen).toBe(true);
  });

  it("exposes shipment id and dayId from Redux", async () => {
    const state = makeEmployeeHomeRootState({
      shipment: { _id: "sx", dayId: "dx" },
    });
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: state,
    });
    const { result } = renderHook(() => useEmployeeHomeViewModel(), {
      wrapper: createWrapper(store),
    });
    await waitFor(() => expect(result.current.pendingLoading).toBe(false));
    expect(result.current.shipmentId).toBe("sx");
    expect(result.current.dayId).toBe("dx");
  });
});
