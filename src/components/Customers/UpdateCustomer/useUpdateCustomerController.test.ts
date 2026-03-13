import { act, renderHook, waitFor } from "@testing-library/react";
import { useUpdateCustomerController } from "./useUpdateCustomerController";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import { toast } from "react-toastify";

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  useParams: () => ({ customerId: "customer-1" }),
}));

jest.mock("../../../utils/apiHelpers", () => ({
  __esModule: true,
  fetchAndCacheCustomerInvoice: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

let mockState: any;

describe("useUpdateCustomerController", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockDispatch.mockReset();
    mockNavigate.mockReset();
    (fetchAndCacheCustomerInvoice as jest.Mock).mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
    (toast.info as jest.Mock).mockReset();
    (toast.warn as jest.Mock).mockReset();

    mockState = {
      user: {
        token: "token-1",
        companyId: "company-1",
        isAdmin: false,
      },
      shipment: {
        _id: "shipment-1",
      },
    };

    (fetchAndCacheCustomerInvoice as jest.Mock).mockResolvedValue(undefined);

    global.fetch = jest.fn(async (url: RequestInfo | URL) => {
      const asString = String(url);
      if (asString.includes("/api/areas/company")) {
        return {
          ok: true,
          json: async () => [{ _id: "area-1", name: "Area 1" }],
        } as Response;
      }
      if (asString.includes("/api/customers/area/area-1/active")) {
        return {
          ok: true,
          json: async () => [{ _id: "customer-2", name: "Other", sequence: 2 }],
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1")) {
        return {
          ok: true,
          json: async () => ({
            _id: "customer-1",
            name: "Alice",
            phone: "70123456",
            address: "Beirut",
            isActive: true,
            areaId: { _id: "area-1", name: "Area 1" },
            sequence: 1,
          }),
        } as Response;
      }
      throw new Error(`Unhandled fetch URL: ${asString}`);
    }) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("creates pending changes and opens confirmation modal on valid submit", async () => {
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Alice Updated" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.pendingChanges).toEqual({ name: "Alice Updated" });
  });

  test("dispatches customer context and navigates for external order recording", async () => {
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    act(() => {
      result.current.handleRecordOrder();
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/recordOrderforCustomer", {
      state: { isExternal: true },
    });
  });
});
