import { act, renderHook } from "@testing-library/react";
import { useAddExpense } from "./useAddExpense";
import { createExpense } from "../apiFinance";
import { toast } from "react-toastify";

const mockDispatch = jest.fn();
let mockState: any;

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState),
}));

jest.mock("../apiFinance", () => ({
  __esModule: true,
  createExpense: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCreateExpense = createExpense as jest.MockedFunction<typeof createExpense>;

describe("useAddExpense", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockCreateExpense.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();

    mockState = {
      user: {
        token: "token-1",
      },
      shipment: {
        _id: "shipment-1",
        expensesInLiras: 1000,
        expensesInUSD: 5,
      },
    };
  });

  test("creates a USD expense and updates shipment totals", async () => {
    mockCreateExpense.mockResolvedValue({} as any);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useAddExpense({ onSuccess }));

    await act(async () => {
      await result.current.submit({
        name: "Fuel",
        value: 3,
        paymentCurrency: "USD",
      });
    });

    expect(mockCreateExpense).toHaveBeenCalledWith("token-1", {
      name: "Fuel",
      value: 3,
      paymentCurrency: "USD",
      shipmentId: "shipment-1",
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("تم تسجيل المصروف بنجاح");
    expect(onSuccess).toHaveBeenCalled();
  });

  test("rejects invalid form data before hitting the API", async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useAddExpense({ onError }));

    await act(async () => {
      await result.current.submit({
        name: "",
        value: "",
        paymentCurrency: "USD",
      });
    });

    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
