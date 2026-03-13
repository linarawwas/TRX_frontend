import { fetchMeAndSync } from "./authApi";
import { persistAuthToStorage } from "./authStorage";
import { setCompanyId, setIsAdmin, setUsername } from "../../redux/UserInfo/action";

jest.mock("./authStorage", () => ({
  __esModule: true,
  persistAuthToStorage: jest.fn(),
}));

describe("fetchMeAndSync", () => {
  const dispatch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    dispatch.mockReset();
    (persistAuthToStorage as jest.Mock).mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("persists and dispatches user profile after a successful fetch", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        companyId: "company-1",
        isAdmin: true,
        name: "Lina",
      }),
    })) as any;

    const result = await fetchMeAndSync("token-1", dispatch);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/me"),
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer token-1" },
      })
    );
    expect(result).toEqual({
      companyId: "company-1",
      isAdmin: true,
      name: "Lina",
    });
    expect(persistAuthToStorage).toHaveBeenCalledWith({
      companyId: "company-1",
      isAdmin: true,
      username: "Lina",
    });
    expect(dispatch.mock.calls).toEqual([
      [setCompanyId("company-1")],
      [setIsAdmin(true)],
      [setUsername("Lina")],
    ]);
  });

  test("throws when the me endpoint responds with an error", async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 401,
    })) as any;

    await expect(fetchMeAndSync("token-1", dispatch)).rejects.toThrow(
      "Failed to fetch /api/users/me (401)"
    );

    expect(persistAuthToStorage).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
