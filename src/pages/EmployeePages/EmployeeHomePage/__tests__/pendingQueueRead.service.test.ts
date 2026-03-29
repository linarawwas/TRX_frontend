import { getPendingRequests } from "../../../../utils/indexedDB";
import { readPendingQueueSnapshot } from "../services/pendingQueueRead.service";

jest.mock("../../../../utils/indexedDB", () => ({
  getPendingRequests: jest.fn(),
}));

const mockGetPending = getPendingRequests as jest.MockedFunction<
  typeof getPendingRequests
>;

describe("readPendingQueueSnapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ok with adapted count", async () => {
    mockGetPending.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    await expect(readPendingQueueSnapshot()).resolves.toEqual({
      ok: true,
      count: 2,
    });
  });

  it("returns ok with zero for empty queue", async () => {
    mockGetPending.mockResolvedValue([]);
    await expect(readPendingQueueSnapshot()).resolves.toEqual({
      ok: true,
      count: 0,
    });
  });

  it("returns error when IndexedDB read throws", async () => {
    mockGetPending.mockRejectedValue(new Error("idb-down"));
    await expect(readPendingQueueSnapshot()).resolves.toEqual({
      ok: false,
      error: "idb-down",
    });
  });
});
