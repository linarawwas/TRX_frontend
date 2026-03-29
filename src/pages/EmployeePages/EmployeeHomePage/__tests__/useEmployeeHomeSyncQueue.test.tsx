import { renderHook, waitFor } from "@testing-library/react";
import { readPendingQueueSnapshot } from "../services/pendingQueueRead.service";
import { useEmployeeHomeSyncQueue } from "../hooks/useEmployeeHomeSyncQueue";

jest.mock("../services/pendingQueueRead.service", () => ({
  readPendingQueueSnapshot: jest.fn(),
}));

const mockRead = readPendingQueueSnapshot as jest.MockedFunction<
  typeof readPendingQueueSnapshot
>;

describe("useEmployeeHomeSyncQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves loading and exposes count on success", async () => {
    mockRead.mockResolvedValue({ ok: true, count: 5 });
    const { result } = renderHook(() => useEmployeeHomeSyncQueue());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it("sets error and count 0 on failed read", async () => {
    mockRead.mockResolvedValue({ ok: false, error: "read-failed" });
    const { result } = renderHook(() => useEmployeeHomeSyncQueue());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(0);
    expect(result.current.error).toBe("read-failed");
  });
});
