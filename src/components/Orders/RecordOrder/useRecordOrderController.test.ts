import { act, renderHook, waitFor } from "@testing-library/react";
import { useRecordOrderController } from "./useRecordOrderController";
import {
  getAdjustedInvoiceSums,
  projectAfterOrder,
} from "../../../utils/invoicePreview";
import { getProductTypeFromDB, saveRequest } from "../../../utils/indexedDB";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import { toast } from "react-toastify";

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
let mockState: any;

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../utils/invoicePreview", () => ({
  __esModule: true,
  getAdjustedInvoiceSums: jest.fn(),
  projectAfterOrder: jest.fn(),
}));

jest.mock("../../../utils/indexedDB", () => ({
  __esModule: true,
  getProductTypeFromDB: jest.fn(),
  saveRequest: jest.fn(),
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
  },
}));

const mockGetAdjustedInvoiceSums =
  getAdjustedInvoiceSums as jest.MockedFunction<typeof getAdjustedInvoiceSums>;
const mockProjectAfterOrder =
  projectAfterOrder as jest.MockedFunction<typeof projectAfterOrder>;
const mockGetProductTypeFromDB =
  getProductTypeFromDB as jest.MockedFunction<typeof getProductTypeFromDB>;
const mockSaveRequest = saveRequest as jest.MockedFunction<typeof saveRequest>;

describe("useRecordOrderController", () => {
  const originalOnLine = navigator.onLine;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockReset();
    mockNavigate.mockReset();
    mockGetAdjustedInvoiceSums.mockReset();
    mockProjectAfterOrder.mockReset();
    mockGetProductTypeFromDB.mockReset();
    mockSaveRequest.mockReset();
    (fetchAndCacheCustomerInvoice as jest.Mock).mockReset();
    (fetchAndCacheCustomerInvoice as jest.Mock).mockResolvedValue(undefined);
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
    (toast.info as jest.Mock).mockReset();

    mockState = {
      user: {
        token: "token-1",
        companyId: "company-1",
      },
      order: {
        customer_Id: "customer-1",
        customer_name: "Alice",
        phone: "",
        product_name: "Water",
        product_id: "product-1",
        product_price: 10,
      },
      shipment: {
        _id: "shipment-1",
        exchangeRateLBP: 89000,
        delivered: 12,
        returned: 2,
        dollarPayments: 30,
        liraPayments: 1500000,
        target: 20,
        expensesInUSD: 0,
        expensesInLiras: 0,
        profitsInUSD: 0,
        profitsInLiras: 0,
        round: {
          sequence: 2,
          targetAdded: 10,
          baseDelivered: 8,
          baseReturned: 1,
          baseUsd: 20,
          baseLbp: 1000000,
          baseExpUsd: 0,
          baseExpLbp: 0,
          baseProfUsd: 0,
          baseProfLbp: 0,
          startedAt: null,
        },
      },
    };

    mockGetAdjustedInvoiceSums.mockResolvedValue({
      bottlesLeft: 4,
      totalSumUSD: 20,
      lastRateLBP: 89000,
    } as any);
    mockProjectAfterOrder.mockReturnValue({
      bottlesLeftAfter: 2,
      totalUsdAfter: 10,
    } as any);
    mockGetProductTypeFromDB.mockResolvedValue(null as any);
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({}),
    })) as any;
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.fetch = originalFetch;
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: originalOnLine,
    });
  });

  test("clamps delivered and returned inputs to remaining and max returnable", async () => {
    const { result } = renderHook(() =>
      useRecordOrderController({ customerData: null })
    );

    await waitFor(() => expect(result.current.maxReturnable).toBe(4));

    act(() => {
      result.current.handleChange({
        target: { name: "delivered", value: "99" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: "returned", value: "99" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.form.delivered).toBe(6);
    expect(result.current.form.returned).toBe(4);
  });

  test("submits online orders and navigates back after success", async () => {
    const { result } = renderHook(() =>
      useRecordOrderController({ customerData: null })
    );

    await waitFor(() => expect(result.current.maxReturnable).toBe(4));

    act(() => {
      result.current.handleChange({
        target: { name: "delivered", value: "2" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: "paidUSD", value: "5" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/orders"),
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchAndCacheCustomerInvoice).toHaveBeenCalledWith(
      "customer-1",
      "token-1"
    );
    expect(toast.success).toHaveBeenCalledWith("✅ تم تسجيل الطلب");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("queues offline orders and dispatches optimistic updates", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() =>
      useRecordOrderController({ customerData: null, isExternal: true })
    );

    await waitFor(() => expect(result.current.maxReturnable).toBe(4));

    act(() => {
      result.current.handleChange({
        target: { name: "delivered", value: "2" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: "paidUSD", value: "5" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    expect(mockSaveRequest).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith("📡 سيتم حفظ الطلب عند عودة الاتصال");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
