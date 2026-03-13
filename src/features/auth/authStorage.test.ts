import {
  clearAuth,
  hydrateAuthFromStorage,
  loadAuthFromStorage,
  persistAuthToStorage,
} from "./authStorage";
import {
  clearCompanyId,
  clearIsAdmin,
  clearToken,
  clearUsername,
  setCompanyId,
  setIsAdmin,
  setToken,
  setUsername,
} from "../../redux/UserInfo/action";

describe("authStorage", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    localStorage.clear();
  });

  test("loads and parses auth from localStorage", () => {
    localStorage.setItem("token", "token-1");
    localStorage.setItem("companyId", "company-1");
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("username", "Lina");

    expect(loadAuthFromStorage()).toEqual({
      token: "token-1",
      companyId: "company-1",
      isAdmin: true,
      username: "Lina",
    });
  });

  test("hydrates redux auth state from storage", () => {
    localStorage.setItem("token", "token-1");
    localStorage.setItem("companyId", "company-1");
    localStorage.setItem("isAdmin", "false");
    localStorage.setItem("username", "Lina");

    const auth = hydrateAuthFromStorage(dispatch);

    expect(auth).toEqual({
      token: "token-1",
      companyId: "company-1",
      isAdmin: false,
      username: "Lina",
    });
    expect(dispatch.mock.calls).toEqual([
      [setToken("token-1")],
      [setIsAdmin(false)],
      [setCompanyId("company-1")],
      [setUsername("Lina")],
    ]);
  });

  test("persists present values and removes cleared ones", () => {
    persistAuthToStorage({
      token: "token-1",
      companyId: "company-1",
      isAdmin: true,
      username: "Lina",
    });

    expect(localStorage.getItem("token")).toBe("token-1");
    expect(localStorage.getItem("companyId")).toBe("company-1");
    expect(localStorage.getItem("isAdmin")).toBe("true");
    expect(localStorage.getItem("username")).toBe("Lina");

    persistAuthToStorage({
      token: null,
      companyId: null,
      username: null,
      isAdmin: false,
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("companyId")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
    expect(localStorage.getItem("isAdmin")).toBe("false");
  });

  test("clears redux auth state and backing storage", () => {
    localStorage.setItem("token", "token-1");
    localStorage.setItem("companyId", "company-1");
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("username", "Lina");

    clearAuth(dispatch);

    expect(dispatch.mock.calls).toEqual([
      [clearToken()],
      [clearCompanyId()],
      [clearIsAdmin()],
      [clearUsername()],
    ]);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("companyId")).toBeNull();
    expect(localStorage.getItem("isAdmin")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
  });
});
