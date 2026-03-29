import {
  selectEmployeeHomeShipmentContext,
  selectEmployeeHomeUsername,
} from "../state/employeeHomeState";
import { makeEmployeeHomeRootState } from "../test-utils/makeEmployeeHomeRootState";

describe("employeeHomeState selectors", () => {
  it("selectEmployeeHomeUsername returns username", () => {
    const state = makeEmployeeHomeRootState({
      user: { username: "Worker-1" },
    });
    expect(selectEmployeeHomeUsername(state)).toBe("Worker-1");
  });

  it("selectEmployeeHomeShipmentContext maps _id to id", () => {
    const state = makeEmployeeHomeRootState({
      shipment: {
        _id: "s-99",
        dayId: "d-42",
      },
    });
    expect(selectEmployeeHomeShipmentContext(state)).toEqual({
      id: "s-99",
      dayId: "d-42",
    });
  });
});
