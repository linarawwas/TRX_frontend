import { renderHook } from "@testing-library/react";
import { useAuth } from "./useAuth";
import {
  clearAuth,
  hydrateAuthFromStorage,
  StoredAuth,
} from "./authStorage";

const mockDispatch = jest.fn();
let mockState: any;

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState),
}));

jest.mock("./authStorage", () => ({
  __esModule: true,
  hydrateAuthFromStorage: jest.fn(),
  clearAuth: jest.fn(),
}));

const mockHydrateAuthFromStorage =
  hydrateAuthFromStorage as jest.MockedFunction<typeof hydrateAuthFromStorage>;
const mockClearAuth = clearAuth as jest.MockedFunction<typeof clearAuth>;

describe("useAuth", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockHydrateAuthFromStorage.mockReset();
    mockClearAuth.mockReset();

    mockState = {
      user: {
        token: "token-1",
        companyId: "company-1",
        isAdmin: true,
        username: "Lina",
      },
    };
  });

  test("returns auth state and authenticated flag", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.token).toBe("token-1");
    expect(result.current.companyId).toBe("company-1");
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.username).toBe("Lina");
    expect(result.current.isAuthenticated).toBe(true);
  });

  test("bootstraps auth from storage through authStorage helper", () => {
    const stored: StoredAuth = {
      token: "boot-token",
      companyId: "boot-company",
      isAdmin: false,
      username: "Boot",
    };
    mockHydrateAuthFromStorage.mockReturnValue(stored);

    const { result } = renderHook(() => useAuth());

    expect(result.current.bootstrapFromStorage()).toEqual(stored);
    expect(mockHydrateAuthFromStorage).toHaveBeenCalledWith(mockDispatch);
  });

  test("logs out through clearAuth helper", () => {
    const { result } = renderHook(() => useAuth());

    result.current.logout();

    expect(mockClearAuth).toHaveBeenCalledWith(mockDispatch);
  });
});
