import { isEmployeeHomeUserReady } from "../utils/employeeHomeGuards";

describe("employeeHomeGuards", () => {
  describe("isEmployeeHomeUserReady", () => {
    it("is false for empty string", () => {
      expect(isEmployeeHomeUserReady("")).toBe(false);
    });

    it("is true for non-empty username", () => {
      expect(isEmployeeHomeUserReady("Lina")).toBe(true);
    });
  });
});
