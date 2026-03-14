import { act, renderHook, waitFor } from "@testing-library/react";
import { useUpdateCustomerController } from "../../../features/customers/hooks/useUpdateCustomerController";
import { fetchAndCacheCustomerInvoice } from "../../../features/customers/apiCustomers";
import { fetchAreasByCompany } from "../../../features/areas/apiAreas";
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

jest.mock("../../../features/customers/apiCustomers", () => {
  const actual = jest.requireActual("../../../features/customers/apiCustomers");
  return {
    __esModule: true,
    ...actual,
    fetchAndCacheCustomerInvoice: jest.fn(),
  };
});

jest.mock("../../../features/areas/apiAreas", () => ({
  __esModule: true,
  fetchAreasByCompany: jest.fn(),
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
  const originalConfirm = window.confirm;

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockReset();
    mockNavigate.mockReset();
    (fetchAndCacheCustomerInvoice as jest.Mock).mockReset();
    (fetchAreasByCompany as jest.Mock).mockReset();
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
    (fetchAreasByCompany as jest.Mock).mockResolvedValue([
      { _id: "area-1", name: "Area 1" },
    ]);

    global.fetch = jest.fn(async (url: RequestInfo | URL, options?: RequestInit) => {
      const asString = String(url);
      const method = options?.method || "GET";
      if (asString.includes("/api/customers/area/area-1/active")) {
        return {
          ok: true,
          json: async () => [{ _id: "customer-2", name: "Other", sequence: 2 }],
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1/restore")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({}),
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1/deactivate")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({}),
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1/hard")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({}),
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1") && method === "PATCH") {
        return {
          ok: true,
          status: 200,
          json: async () => ({}),
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1") && method === "GET") {
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.fetch = originalFetch;
    window.confirm = originalConfirm;
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

  test("shows info when submit is called with no actual changes", async () => {
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(toast.info).toHaveBeenCalledWith("لا توجد تغييرات لإرسالها");
    expect(result.current.confirmOpen).toBe(false);
  });

  test("submits confirmed customer updates and clears pending state on success", async () => {
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

    await act(async () => {
      await result.current.submitUpdate();
    });

    expect(toast.success).toHaveBeenCalledWith("تم التحديث بنجاح");
    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.pendingChanges).toBeNull();
  });

  test("opens restore options when automatic restore hits a sequence conflict", async () => {
    global.fetch = jest.fn(async (url: RequestInfo | URL, options?: RequestInit) => {
      const asString = String(url);
      const method = options?.method || "GET";
      if (asString.includes("/api/customers/area/area-1/active")) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (asString.includes("/api/customers/customer-1/restore")) {
        return {
          ok: false,
          status: 409,
          json: async () => ({ error: "conflict" }),
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            _id: "customer-1",
            name: "Alice",
            phone: "70123456",
            address: "Beirut",
            isActive: false,
            areaId: { _id: "area-1", name: "Area 1" },
            sequence: 1,
          }),
        } as Response;
      }
      throw new Error(`Unhandled fetch URL: ${asString}`);
    }) as any;

    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    await act(async () => {
      await result.current.handleRestoreAuto();
    });

    expect(toast.warn).toHaveBeenCalledWith("رقم الترتيب مستخدم. اختر رقمًا آخر.");
    expect(result.current.showRestoreOptions).toBe(true);
  });

  test("blocks hard delete for non-admin users", async () => {
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    act(() => {
      result.current.openDeleteModal();
    });

    expect(toast.warn).toHaveBeenCalledWith("هذه العملية للمشرف فقط");
    expect(result.current.showDeleteModal).toBe(false);
  });

  test("hard delete shows backend conflict errors and does not navigate", async () => {
    mockState.user.isAdmin = true;
    global.fetch = jest.fn(async (url: RequestInfo | URL, options?: RequestInit) => {
      const asString = String(url);
      const method = options?.method || "GET";
      if (asString.includes("/api/areas/company")) {
        return { ok: true, json: async () => [{ _id: "area-1", name: "Area 1" }] } as Response;
      }
      if (asString.includes("/api/customers/area/area-1/active")) {
        return { ok: true, json: async () => [] } as Response;
      }
      if (asString.includes("/api/customers/customer-1/hard")) {
        return {
          ok: false,
          status: 409,
          json: async () => ({ error: "لا يمكن الحذف: لدى الزبون طلبات مرتبطة." }),
        } as Response;
      }
      if (asString.includes("/api/customers/customer-1") && method === "GET") {
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

    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    await act(async () => {
      await result.current.performHardDelete();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "لا يمكن الحذف: لدى الزبون طلبات مرتبطة."
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("prevents recording an order when there is no active shipment", async () => {
    mockState.shipment._id = "";
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    act(() => {
      result.current.handleRecordOrder();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "ابدأ الشحنة أولاً قبل تسجيل الطلب"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("deactivates a customer after confirmation", async () => {
    window.confirm = jest.fn(() => true);
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    await act(async () => {
      await result.current.handleDeactivate();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("تم إيقاف الزبون");
  });

  test("restores a customer with an explicit sequence", async () => {
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    act(() => {
      result.current.setRestoreSequence(5);
    });

    await act(async () => {
      await result.current.handleRestoreWithSequence({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(toast.success).toHaveBeenCalledWith("تم تنشيط الزبون وتعيين الترتيب");
    expect(result.current.restoreSequence).toBe("");
  });

  test("hard delete succeeds for admins and navigates back", async () => {
    mockState.user.isAdmin = true;
    const { result } = renderHook(() => useUpdateCustomerController());

    await waitFor(() => expect(result.current.customerData?._id).toBe("customer-1"));

    await act(async () => {
      await result.current.performHardDelete();
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(toast.success).toHaveBeenCalledWith("تم حذف الزبون نهائيًا");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
