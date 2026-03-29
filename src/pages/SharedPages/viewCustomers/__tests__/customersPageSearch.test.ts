import { customerMatchesSearch } from "../utils/customersPageSearch";

describe("customerMatchesSearch", () => {
  it("matches name phone address case-insensitively", () => {
    const c = {
      _id: "1",
      name: "Acme",
      phone: "555",
      address: "Main St",
    };
    expect(customerMatchesSearch(c, "")).toBe(true);
    expect(customerMatchesSearch(c, "acme")).toBe(true);
    expect(customerMatchesSearch(c, "555")).toBe(true);
    expect(customerMatchesSearch(c, "main")).toBe(true);
    expect(customerMatchesSearch(c, "nope")).toBe(false);
  });
});
