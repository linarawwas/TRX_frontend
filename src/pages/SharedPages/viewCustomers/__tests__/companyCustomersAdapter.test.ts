import { adaptCompanyCustomersApiResult } from "../adapters/companyCustomersAdapter";

describe("adaptCompanyCustomersApiResult", () => {
  it("returns ok with normalized arrays", () => {
    const r = adaptCompanyCustomersApiResult({
      data: {
        active: [{ _id: "a", name: "A" }],
        inactive: [{ _id: "b", name: "B" }],
      },
      error: null,
    });
    expect(r).toEqual({
      ok: true,
      data: {
        active: [{ _id: "a", name: "A" }],
        inactive: [{ _id: "b", name: "B" }],
      },
    });
  });

  it("coerces non-arrays to empty", () => {
    const r = adaptCompanyCustomersApiResult({
      data: { active: undefined as unknown as [], inactive: null as unknown as [] },
      error: null,
    });
    expect(r.ok && r.data).toEqual({ active: [], inactive: [] });
  });

  it("returns error when missing data or error set", () => {
    expect(adaptCompanyCustomersApiResult({ data: null, error: "x" })).toEqual({
      ok: false,
      error: "x",
    });
    expect(adaptCompanyCustomersApiResult({ data: null, error: null })).toEqual({
      ok: false,
      error: "Failed to fetch customers",
    });
  });
});
