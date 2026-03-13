import { act, renderHook } from "@testing-library/react";
import { useAddProfit } from "./useAddProfit";
import { createExtraProfit } from "../apiFinance";
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
  createExtraProfit: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCreateExtraProfit =
  createExtraProfit as jest.MockedFunction<typeof createExtraProfit>;

describe("useAddProfit", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockCreateExtraProfit.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();

    mockState = {
      user: {
        token: "token-1",
      },
      shipment: {
        _id: "shipment-1",
        profitsInLiras: 1000,
        profitsInUSD: 5,
      },
    };
  });

  test("creates a USD profit and updates shipment totals", async () => {
    mockCreateExtraProfit.mockResolvedValue({} as any);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useAddProfit({ onSuccess }));

    await act(async () => {
      await result.current.submit({
        name: "Commission",
        value: 4,
        paymentCurrency: "USD",
      });
    });

    expect(mockCreateExtraProfit).toHaveBeenCalledWith("token-1", {
      name: "Commission",
      value: 4,
      paymentCurrency: "USD",
      shipmentId: "shipment-1",
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("تم تسجيل الربح الإضافي");
    expect(onSuccess).toHaveBeenCalled();
  });

  test("rejects invalid form data before hitting the API", async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useAddProfit({ onError }));

    await act(async () => {
      await result.current.submit({
        name: "",
        value: "",
        paymentCurrency: "USD",
      });
    });

    expect(mockCreateExtraProfit).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
