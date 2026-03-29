import { adaptPendingRequestsToCount } from "../adapters/pendingQueueAdapter";

describe("adaptPendingRequestsToCount", () => {
  it("returns array length", () => {
    expect(adaptPendingRequestsToCount([{}, {}, {}])).toBe(3);
    expect(adaptPendingRequestsToCount([])).toBe(0);
  });

  it("returns 0 for non-arrays", () => {
    expect(adaptPendingRequestsToCount(null)).toBe(0);
    expect(adaptPendingRequestsToCount(undefined)).toBe(0);
    expect(adaptPendingRequestsToCount({ length: 3 })).toBe(0);
  });
});
