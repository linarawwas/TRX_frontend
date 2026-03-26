import { segmentCustomersForArea } from "./customersForAreaSegmentation";
import type { CustomerRow } from "./customersForAreaTypes";

const row = (id: string, name: string): CustomerRow => ({
  _id: id,
  name,
  phone: "111",
  address: "addr",
});

describe("segmentCustomersForArea", () => {
  it("puts pending customers in pendingList and not in completed", () => {
    const customers = [row("a", "Ali"), row("b", "Bob")];
    const r = segmentCustomersForArea(
      customers,
      "",
      ["b"],
      ["a"],
      ["a"]
    );
    expect(r.pendingList.map((x) => x.c._id)).toEqual(["a"]);
    expect(r.completedList.find((x) => x.c._id === "a")).toBeUndefined();
    expect(r.activeList.map((x) => x.c._id)).toEqual(["b"]);
  });

  it("filters by search on name", () => {
    const customers = [row("1", "Alpha"), row("2", "Beta")];
    const r = segmentCustomersForArea(customers, "alp", [], [], []);
    expect(r.activeList.map((x) => x.c._id)).toEqual(["1"]);
  });

  it("counts filled vs empty in completed", () => {
    const customers = [row("x", "X"), row("y", "Y")];
    const r = segmentCustomersForArea(customers, "", ["x"], ["y"], []);
    expect(r.counts).toEqual({ filled: 1, empty: 1, total: 2 });
    expect(r.hasPending).toBe(false);
  });
});
